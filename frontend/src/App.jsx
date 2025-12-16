import React, { useState, useEffect } from 'react'
import ChatPanel from './components/ChatPanel'
import DashboardPanel from './components/DashboardPanel'
import { getTranslation } from './translations'
import './App.css'

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [sessionData, setSessionData] = useState(null)
  const [language, setLanguage] = useState('en') // en | hi
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  // Initialize session on mount
  useEffect(() => {
    initializeSession()
  }, [])

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/session/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      setSessionId(data.sessionId)
      setSessionData(data.session)
      
      // Add initial greeting
      setMessages([{
        agent: 'Master Agent',
        text: data.greeting,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Failed to initialize session:', error)
    }
  }

  const sendMessage = async (userMessage) => {
    // Add user message to chat
    setMessages(prev => [...prev, {
      agent: 'User',
      text: userMessage,
      timestamp: new Date()
    }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
          language
        })
      })
      
      const data = await response.json()
      
      // Add agent responses
      if (data.responses && data.responses.length > 0) {
        const agentMessages = data.responses.map(resp => ({
          agent: resp.agent,
          text: resp.message,
          timestamp: new Date()
        }))
        setMessages(prev => [...prev, ...agentMessages])
        
        // Speak if voice enabled
        if (voiceEnabled && data.responses[0]) {
          speakText(data.responses[0].message)
        }
      }
      
      // Update session data
      if (data.session) {
        setSessionData(data.session)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }

  const uploadDocument = async (file) => {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('sessionId', sessionId)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      // Add response message
      setMessages(prev => [...prev, {
        agent: 'Verification Agent',
        text: data.message,
        timestamp: new Date()
      }])
      
      // Update session
      if (data.session) {
        setSessionData(data.session)
      }
    } catch (error) {
      console.error('Failed to upload document:', error)
    }
  }

  const t = (key) => getTranslation(language, key)

  return (
    <div className="app">
      <header className="app-header">
        <h1>{t('headerTitle')}</h1>
        <div className="header-controls">
          <button 
            className={`toggle-btn ${language === 'hi' ? 'active' : ''}`}
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            {t('languageBtn')}
          </button>
          <button 
            className={`toggle-btn ${voiceEnabled ? 'active' : ''}`}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            🔊 {voiceEnabled ? t('voiceOn') : t('voiceOff')}
          </button>
        </div>
      </header>
      
      <div className="app-content">
        <ChatPanel 
          messages={messages}
          onSendMessage={sendMessage}
          onUploadDocument={uploadDocument}
          language={language}
        />
        <DashboardPanel 
          sessionData={sessionData}
          language={language}
        />
      </div>
    </div>
  )
}

export default App
