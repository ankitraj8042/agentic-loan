// Document Understanding Agent
// Uses GenAI to summarize uploaded documents (salary slips)
// IMPORTANT: This is ASSISTIVE only - does NOT make underwriting decisions

import GroqService from '../services/GroqService.js'

class DocumentAgent {
  static async process(session) {
    const { documents } = session
    
    if (!documents.salarySlipUploaded) {
      return {
        agent: 'Document Agent',
        message: 'No document has been uploaded yet.'
      }
    }
    
    // MOCK: In real system, would use OCR to extract text from PDF/image
    // For prototype, we use hardcoded data set during upload
    const salaryData = documents.salarySlipData
    
    // OPTIONAL: Use GenAI to generate a friendly summary
    const summary = await this.generateSummary(salaryData, session.language)
    
    return {
      agent: 'Document Agent',
      message: `Document received and verified. ${summary} I'm now re-evaluating your loan eligibility.`
    }
  }
  
  static async generateSummary(salaryData, language) {
    // Rule-based summary
    const summary = `Your monthly salary of ₹${salaryData.monthlySalary.toLocaleString('en-IN')} from ${salaryData.employer} has been verified.`
    
    // OPTIONAL: Polish with GenAI
    return await GroqService.polishDocumentSummary(summary, language)
  }
}

export default DocumentAgent
