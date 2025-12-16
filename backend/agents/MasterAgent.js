// Master Agent - Orchestrates all worker agents
// STATE MACHINE: SALES → VERIFICATION → UNDERWRITING → DOCUMENT → FINAL

import SalesAgent from './SalesAgent.js'
import VerificationAgent from './VerificationAgent.js'
import UnderwritingAgent from './UnderwritingAgent.js'
import SanctionLetterAgent from './SanctionLetterAgent.js'
import DocumentAgent from './DocumentAgent.js'

class MasterAgent {
  static async process(session, userMessage) {
    const responses = []
    
    // Handle special commands
    if (userMessage === '__DOCUMENT_UPLOADED__') {
      return this.handleDocumentUpload(session)
    }
    
    // Classify user intent
    const intent = this.classifyIntent(userMessage)
    
    // Route based on current stage and intent
    switch (session.stage) {
      case 'SALES':
        return await this.handleSalesStage(session, userMessage, intent)
      
      case 'VERIFICATION':
        return await this.handleVerificationStage(session, userMessage)
      
      case 'UNDERWRITING':
        return await this.handleUnderwritingStage(session, userMessage)
      
      case 'DOCUMENT':
        return await this.handleDocumentStage(session, userMessage)
      
      case 'FINAL':
        return await this.handleFinalStage(session, userMessage)
      
      default:
        return [{
          agent: 'Master Agent',
          message: 'I\'m here to help with your personal loan. What would you like to know?'
        }]
    }
  }
  
  static classifyIntent(message) {
    const lowerMsg = message.toLowerCase()
    
    // Check for loan application intent
    if (lowerMsg.includes('loan') || lowerMsg.includes('borrow') || 
        lowerMsg.includes('need money') || lowerMsg.includes('credit')) {
      return 'LOAN_APPLICATION'
    }
    
    // Check for hesitation
    if (lowerMsg.includes('not sure') || lowerMsg.includes('thinking') || 
        lowerMsg.includes('maybe') || lowerMsg.includes('confused')) {
      return 'HESITANT'
    }
    
    // Check for price sensitivity
    if (lowerMsg.includes('emi') || lowerMsg.includes('interest') || 
        lowerMsg.includes('rate') || lowerMsg.includes('expensive')) {
      return 'PRICE_SENSITIVE'
    }
    
    // Check for information request
    if (lowerMsg.includes('how') || lowerMsg.includes('what') || 
        lowerMsg.includes('tell me') || lowerMsg.includes('explain')) {
      return 'INFO_REQUEST'
    }
    
    return 'GENERAL'
  }
  
  static async handleSalesStage(session, userMessage, intent) {
    const responses = []
    
    // If we're in verification sub-flow (waiting for phone/name/income), handle it
    if (session.awaitingPhone || session.awaitingName || session.awaitingIncome) {
      session.stage = 'VERIFICATION'
      return await this.handleVerificationStage(session, userMessage)
    }
    
    // Delegate to Sales Agent
    const salesResponse = await SalesAgent.process(session, userMessage, intent)
    responses.push(salesResponse)
    
    // Check if we have enough info to proceed
    if (session.loan.amount && session.loan.tenure && !session.customer) {
      // Move to verification to get customer details
      session.stage = 'VERIFICATION'
      
      // Run verification
      const verificationResponses = await this.handleVerificationStage(session, '__AUTO__')
      responses.push(...verificationResponses)
    } else if (session.loan.amount && session.loan.tenure && session.customer) {
      // Already have customer, go to underwriting
      session.stage = 'UNDERWRITING'
      const underwritingResponses = await this.handleUnderwritingStage(session, '__AUTO__')
      responses.push(...underwritingResponses)
    }
    
    return responses
  }
  
  static async handleVerificationStage(session, userMessage) {
    const responses = []
    
    // Run verification agent with user message
    const verificationResponse = await VerificationAgent.process(session, userMessage)
    responses.push(verificationResponse)
    
    // If verified and we have loan details, move to underwriting
    if (session.documents.kycVerified && session.loan.amount && session.loan.tenure) {
      session.stage = 'UNDERWRITING'
      
      // Immediately run underwriting
      const underwritingResponses = await this.handleUnderwritingStage(session, '__AUTO__')
      responses.push(...underwritingResponses)
    } else if (session.documents.kycVerified && (!session.loan.amount || !session.loan.tenure)) {
      // Verified but need loan details - go back to sales
      session.stage = 'SALES'
    }
    
    return responses
  }
  
  static async handleUnderwritingStage(session, userMessage) {
    const responses = []
    
    // Run underwriting agent
    const underwritingResponse = await UnderwritingAgent.process(session)
    responses.push(underwritingResponse)
    
    // Check decision
    if (session.decision) {
      if (session.decision.status === 'APPROVED') {
        // Move to final - generate sanction letter
        session.stage = 'FINAL'
        const sanctionResponse = await SanctionLetterAgent.process(session)
        responses.push(sanctionResponse)
      } else if (session.decision.status === 'DOCUMENT_REQUIRED') {
        // Move to document stage
        session.stage = 'DOCUMENT'
      } else if (session.decision.status === 'REJECTED') {
        // Stay in final state
        session.stage = 'FINAL'
      }
    }
    
    return responses
  }
  
  static async handleDocumentStage(session, userMessage) {
    return [{
      agent: 'Verification Agent',
      message: 'Please upload your latest salary slip to proceed with your loan application.'
    }]
  }
  
  static async handleDocumentUpload(session) {
    const responses = []
    
    // Process document with Document Agent
    const docResponse = await DocumentAgent.process(session)
    responses.push(docResponse)
    
    // Re-run underwriting with salary data
    session.stage = 'UNDERWRITING'
    const underwritingResponses = await this.handleUnderwritingStage(session, '__AUTO__')
    responses.push(...underwritingResponses)
    
    return responses
  }
  
  static async handleFinalStage(session, userMessage) {
    if (session.decision?.status === 'APPROVED') {
      return [{
        agent: 'Master Agent',
        message: 'Your loan has been approved! You can download your sanction letter from the dashboard. Is there anything else I can help you with?'
      }]
    } else if (session.decision?.status === 'REJECTED') {
      return [{
        agent: 'Master Agent',
        message: 'I understand this may be disappointing. Please review the suggestions in your dashboard. You can apply again once you meet the eligibility criteria.'
      }]
    }
    
    return [{
      agent: 'Master Agent',
      message: 'How else can I assist you today?'
    }]
  }
}

export default MasterAgent
