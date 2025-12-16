// Verification Agent - Verifies customer KYC
// Asks for phone number, verifies from Firebase, or collects details manually

import FirebaseService from '../services/FirebaseService.js'

class VerificationAgent {
  static async process(session, userMessage = null) {
    // Check if we're waiting for phone number
    if (session.awaitingPhone) {
      const phone = this.extractPhoneNumber(userMessage)
      
      if (!phone) {
        return {
          agent: 'Verification Agent',
          message: 'Please provide a valid 10-digit mobile number (e.g., 9876543210 or +919876543210)'
        }
      }
      
      // Try to find customer in Firebase
      const customer = await FirebaseService.getCustomerByPhone(phone)
      
      if (customer) {
        // Existing customer found
        session.customer = customer
        session.documents.kycVerified = true
        session.awaitingPhone = false
        session.phone = phone
        
        return {
          agent: 'Verification Agent',
          message: `Welcome back, ${customer.name}! Your KYC is verified. I'm checking your eligibility now...`
        }
      } else {
        // New customer - need to collect details
        session.awaitingPhone = false
        session.awaitingName = true
        session.phone = phone
        
        return {
          agent: 'Verification Agent',
          message: `I don't have your details in our system. Let me help you get started. What is your full name?`
        }
      }
    }
    
    // Check if we're waiting for name
    if (session.awaitingName) {
      const name = userMessage.trim()
      if (name.length < 2) {
        return {
          agent: 'Verification Agent',
          message: 'Please provide your full name.'
        }
      }
      
      session.tempCustomerData = { name }
      session.awaitingName = false
      session.awaitingIncome = true
      
      return {
        agent: 'Verification Agent',
        message: `Thank you, ${name}. What is your monthly income? (e.g., 50000 or 5 lakh)`
      }
    }
    
    // Check if we're waiting for income
    if (session.awaitingIncome) {
      const income = this.extractIncome(userMessage)
      
      if (!income || income < 10000) {
        return {
          agent: 'Verification Agent',
          message: 'Please provide a valid monthly income amount (minimum ₹10,000)'
        }
      }
      
      session.tempCustomerData.monthlyIncome = income
      session.awaitingIncome = false
      
      // Create new customer profile
      const newCustomer = {
        customerId: `CUST_${Date.now()}`,
        name: session.tempCustomerData.name,
        creditScore: 720, // Default credit score for new customers
        preApprovedLimit: Math.min(income * 4, 300000), // 4x monthly income, max 3L
        kycStatus: 'PENDING', // Would be VERIFIED after actual KYC
        employmentType: 'SALARIED',
        monthlyIncome: income,
        existingLoans: []
      }
      
      // Save to Firebase
      await FirebaseService.addCustomer(session.phone, newCustomer)
      
      session.customer = { ...newCustomer, phone: session.phone }
      session.documents.kycVerified = true
      delete session.tempCustomerData
      
      return {
        agent: 'Verification Agent',
        message: `Thank you, ${newCustomer.name}! Your profile has been created. Based on your income of ₹${income.toLocaleString('en-IN')}, your pre-approved loan limit is ₹${newCustomer.preApprovedLimit.toLocaleString('en-IN')}. Let me check your loan eligibility now...`
      }
    }
    
    // Initial request - ask for phone number
    if (!session.customer && !session.awaitingPhone) {
      session.awaitingPhone = true
      
      return {
        agent: 'Verification Agent',
        message: 'To proceed with your loan application, I need to verify your identity. Please provide your mobile number (10 digits).'
      }
    }
    
    // Already verified
    if (session.customer) {
      return {
        agent: 'Verification Agent',
        message: `You're already verified, ${session.customer.name}. Proceeding with your loan request...`
      }
    }
  }
  
  static extractPhoneNumber(text) {
    // Remove all non-digit characters
    const digits = text.replace(/\D/g, '')
    
    // Check for 10-digit number
    if (digits.length === 10) {
      return `+91${digits}`
    }
    
    // Check for 12-digit with country code
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`
    }
    
    return null
  }
  
  static extractIncome(text) {
    // Look for numbers
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i,
      /(\d+(?:\.\d+)?)\s*(?:thousand|k)/i,
      /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/,
      /(?:^|\s)(\d{4,})/
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        let amount = parseFloat(match[1].replace(/,/g, ''))
        
        if (/lakh|lac/i.test(text)) {
          amount = amount * 100000
        } else if (/thousand|k/i.test(text)) {
          amount = amount * 1000
        }
        
        if (amount >= 10000 && amount <= 10000000) {
          return Math.round(amount)
        }
      }
    }
    
    return null
  }
}

export default VerificationAgent
