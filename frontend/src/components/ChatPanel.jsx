import React, { useState, useRef, useEffect } from 'react'
import { getTranslation } from '../translations'
import './ChatPanel.css'

function ChatPanel({ messages, onSendMessage, onUploadDocument, language = 'en' }) {
  const t = (key) => getTranslation(language, key)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim())
      setInputText('')
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 2000)
    }
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      onUploadDocument(file)
    }
  }
  
  const getAgentColor = (agent) => {
    const colors = {
      'Master Agent': '#667eea',
      'Sales Agent': '#48bb78',
      'Verification Agent': '#4299e1',
      'Underwriting Agent': '#ed8936',
      'Document Agent': '#9f7aea',
      'Sanction Letter Agent': '#38b2ac',
      'User': '#2d3748'
    }
    return colors[agent] || '#718096'
  }
  
  const translateAgentName = (agent) => {
    const agentMap = {
      'Master Agent': t('masterAgent'),
      'Sales Agent': t('salesAgent'),
      'Verification Agent': t('verificationAgent'),
      'Underwriting Agent': t('underwritingAgent'),
      'Document Agent': t('documentAgent'),
      'Sanction Letter Agent': t('sanctionAgent'),
      'User': t('user')
    }
    return agentMap[agent] || agent
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>{t('chatTitle')}</h2>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.agent === 'User' ? 'user-message' : 'agent-message'}`}
          >
            <div className="message-header">
              <span 
                className="agent-badge" 
                style={{ backgroundColor: getAgentColor(msg.agent) }}
              >
                {translateAgentName(msg.agent)}
              </span>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="message-content">
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message agent-message">
            <div className="message-header">
              <span className="agent-badge" style={{ backgroundColor: '#718096' }}>
                {t('typingIndicator')}
              </span>
            </div>
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-area">
        <button 
          className="upload-btn"
          onClick={() => fileInputRef.current.click()}
          title={t('uploadTooltip')}
        >
          📎
        </button>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
        />
        <textarea
          className="chat-input"
          placeholder={t('chatPlaceholder')}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={2}
        />
        <button 
          className="send-btn"
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          {t('sendBtn')}
        </button>
      </div>
    </div>
  )
}

export default ChatPanel
