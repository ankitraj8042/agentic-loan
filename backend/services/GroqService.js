// Groq Service - GenAI integration for message enhancement
// CRITICAL: This service NEVER makes underwriting decisions
// Only used for: tone, translation, explanation polishing

import Groq from 'groq-sdk'
import config from '../config.js'

let groq = null

// Initialize Groq client only if API key is available
try {
  if (config.GROQ_API_KEY && config.GROQ_API_KEY !== 'your-groq-api-key') {
    groq = new Groq({
      apiKey: config.GROQ_API_KEY
    })
    console.log('✓ Groq AI initialized')
  } else {
    console.log('⚠ Groq API key not configured - using fallback mode')
  }
} catch (error) {
  console.error('⚠ Groq initialization failed:', error.message)
}

class GroqService {
  // Polish sales message for better tone
  static async polishSalesMessage(message, language = 'en') {
    if (!config.ENABLE_GENAI || !groq) {
      return message // Fallback to rule-based
    }
    
    try {
      const prompt = language === 'hi' 
        ? `Translate this loan sales message to Hindi, keeping it professional and friendly:\n\n${message}`
        : `Make this loan sales message more friendly and professional while keeping the same information:\n\n${message}`
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a professional loan assistant. Keep responses concise and helpful.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 200
      })
      
      const result = completion.choices[0]?.message?.content
      console.log('✓ Groq API: Sales message polished')
      return result || message
    } catch (error) {
      console.error('Groq API error (sales):', error.message)
      return message // Fallback
    }
  }
  
  // Polish explanation for better clarity
  static async polishExplanation(explanation, language = 'en') {
    if (!config.ENABLE_GENAI || !groq) {
      return explanation
    }
    
    try {
      const prompt = language === 'hi'
        ? `Translate this loan decision explanation to Hindi:\n\n${explanation}`
        : `Rephrase this loan decision explanation to be clearer and more empathetic:\n\n${explanation}`
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are explaining loan decisions. Be clear, empathetic, and factual.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 300
      })
      
      const result = completion.choices[0]?.message?.content
      console.log('✓ Groq API: Explanation polished')
      return result || explanation
    } catch (error) {
      console.error('Groq API error (explanation):', error.message)
      return explanation
    }
  }
  
  // Summarize uploaded document
  static async polishDocumentSummary(summary, language = 'en') {
    if (!config.ENABLE_GENAI || !groq) {
      return summary
    }
    
    try {
      const prompt = language === 'hi'
        ? `Translate this document summary to Hindi:\n\n${summary}`
        : `Make this document summary more friendly:\n\n${summary}`
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are summarizing document information. Be concise and accurate.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 150
      })
      
      const result = completion.choices[0]?.message?.content
      console.log('✓ Groq API: Document summary polished')
      return result || summary
    } catch (error) {
      console.error('Groq API error (document):', error.message)
      return summary
    }
  }
}

export default GroqService
