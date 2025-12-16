// Sales Agent - Collects loan requirements and handles objections
// NO GENAI IN DECISION LOGIC - only for message polishing

import GroqService from '../services/GroqService.js'

class SalesAgent {
  static async process(session, userMessage, intent) {
    // Extract loan amount and tenure from message
    const amount = this.extractAmount(userMessage)
    const tenure = this.extractTenure(userMessage)
    
    // Update session if found
    if (amount) {
      session.loan.amount = amount
    }
    if (tenure) {
      session.loan.tenure = tenure
    }
    
    // Update intent
    session.intent = intent
    
    // Generate response based on what we have
    let message = ''
    
    if (!session.loan.amount && !session.loan.tenure) {
      // Initial greeting - need both
      message = 'I can help you with a personal loan. How much would you like to borrow and for how long?'
    } else if (session.loan.amount && !session.loan.tenure) {
      // Have amount, need tenure
      message = `Great! You're looking for ₹${session.loan.amount.toLocaleString('en-IN')}. What loan tenure would you prefer? (e.g., 12 months, 24 months, 36 months)`
    } else if (!session.loan.amount && session.loan.tenure) {
      // Have tenure, need amount
      message = `Perfect! You want a ${session.loan.tenure} month loan. How much would you like to borrow?`
    } else {
      // Have both
      message = `Excellent! Let me process your request for ₹${session.loan.amount.toLocaleString('en-IN')} for ${session.loan.tenure} months. I'll check your eligibility now.`
    }
    
    // Handle specific intents
    if (intent === 'HESITANT') {
      message = 'I understand you might have questions. Personal loans can help with various needs - education, medical emergencies, home renovation, or debt consolidation. Our process is simple and transparent. ' + message
    } else if (intent === 'PRICE_SENSITIVE') {
      message = `We offer competitive interest rates starting at 12.5% per annum. Let me calculate the exact EMI for you. ` + message
    }
    
    // OPTIONAL: Polish with GenAI if enabled
    message = await GroqService.polishSalesMessage(message, session.language)
    
    return {
      agent: 'Sales Agent',
      message
    }
  }
  
  static extractAmount(message) {
    // Look for numbers followed by lakh/lac/thousand/k or just large numbers
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i,
      /(\d+(?:\.\d+)?)\s*(?:thousand|k)/i,
      /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/,
      /(?:^|\s)(\d{5,})/  // 5+ digit numbers
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) {
        let amount = parseFloat(match[1].replace(/,/g, ''))
        
        // Convert based on unit
        if (/lakh|lac/i.test(message)) {
          amount = amount * 100000
        } else if (/thousand|k/i.test(message)) {
          amount = amount * 1000
        }
        
        // Validate range
        if (amount >= 50000 && amount <= 2000000) {
          return Math.round(amount)
        }
      }
    }
    
    return null
  }
  
  static extractTenure(message) {
    // Look for tenure in months or years
    const patterns = [
      /(\d+)\s*(?:month|months|mon|mos)/i,
      /(\d+)\s*(?:year|years|yr|yrs)/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) {
        let tenure = parseInt(match[1])
        
        // Convert years to months
        if (/year|yr/i.test(message)) {
          tenure = tenure * 12
        }
        
        // Validate range
        if (tenure >= 6 && tenure <= 60) {
          return tenure
        }
      }
    }
    
    return null
  }
}

export default SalesAgent
