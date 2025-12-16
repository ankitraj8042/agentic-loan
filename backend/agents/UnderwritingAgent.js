// Underwriting Agent - MOST CRITICAL COMPONENT
// DETERMINISTIC LOGIC - NO GENAI IN DECISION MAKING
// BFSI Compliance: All decisions must be explainable and auditable

import config from '../config.js'
import GroqService from '../services/GroqService.js'

class UnderwritingAgent {
  static async process(session) {
    const { customer, loan, documents } = session
    
    if (!customer) {
      return {
        agent: 'Underwriting Agent',
        message: 'Unable to verify customer information.'
      }
    }
    
    // Calculate EMI
    const emi = this.calculateEMI(loan.amount, loan.tenure, config.INTEREST_RATE_ANNUAL)
    
    // DETERMINISTIC UNDERWRITING RULES
    // Rule 1: Credit score check
    if (customer.creditScore < config.MIN_CREDIT_SCORE) {
      const decision = {
        status: 'REJECTED',
        reason: 'CREDIT_SCORE_LOW',
        explanation: `Your credit score (${customer.creditScore}) is below the minimum requirement of ${config.MIN_CREDIT_SCORE}.`,
        suggestions: [
          'Pay off existing dues on time',
          'Reduce credit card utilization below 30%',
          'Avoid multiple loan applications',
          'Maintain a healthy credit mix'
        ],
        metrics: {
          creditScore: customer.creditScore,
          requiredCreditScore: config.MIN_CREDIT_SCORE,
          loanAmount: loan.amount,
          emi: emi
        }
      }
      
      session.decision = decision
      
      const message = await this.generateMessage(decision, session.language)
      
      return {
        agent: 'Underwriting Agent',
        message
      }
    }
    
    // Rule 2: Instant approval - within pre-approved limit
    if (loan.amount <= customer.preApprovedLimit) {
      const decision = {
        status: 'APPROVED',
        reason: 'WITHIN_PREAPPROVED_LIMIT',
        explanation: `Congratulations! Your loan of ₹${loan.amount.toLocaleString('en-IN')} is approved instantly as it's within your pre-approved limit of ₹${customer.preApprovedLimit.toLocaleString('en-IN')}.`,
        approvedAmount: loan.amount,
        tenure: loan.tenure,
        emi: emi,
        interestRate: config.INTEREST_RATE_ANNUAL,
        metrics: {
          creditScore: customer.creditScore,
          preApprovedLimit: customer.preApprovedLimit,
          loanAmount: loan.amount,
          emi: emi,
          emiToIncomeRatio: emi / customer.monthlyIncome
        }
      }
      
      session.decision = decision
      
      const message = await this.generateMessage(decision, session.language)
      
      return {
        agent: 'Underwriting Agent',
        message
      }
    }
    
    // Rule 3: Requires salary slip - up to 2x pre-approved limit
    if (loan.amount <= (customer.preApprovedLimit * 2)) {
      // Check if salary slip already uploaded
      if (documents.salarySlipUploaded && documents.salarySlipData) {
        const salaryData = documents.salarySlipData
        const emiToIncomeRatio = emi / salaryData.monthlySalary
        
        // Sub-rule: EMI should be <= 50% of salary
        if (emiToIncomeRatio <= config.MAX_EMI_TO_INCOME_RATIO) {
          const decision = {
            status: 'APPROVED',
            reason: 'SALARY_VERIFIED_EMI_AFFORDABLE',
            explanation: `Your loan of ₹${loan.amount.toLocaleString('en-IN')} is approved! Based on your salary of ₹${salaryData.monthlySalary.toLocaleString('en-IN')}, the EMI of ₹${emi.toLocaleString('en-IN')} is affordable.`,
            approvedAmount: loan.amount,
            tenure: loan.tenure,
            emi: emi,
            interestRate: config.INTEREST_RATE_ANNUAL,
            metrics: {
              creditScore: customer.creditScore,
              monthlySalary: salaryData.monthlySalary,
              emi: emi,
              emiToIncomeRatio: emiToIncomeRatio
            }
          }
          
          session.decision = decision
          
          const message = await this.generateMessage(decision, session.language)
          
          return {
            agent: 'Underwriting Agent',
            message
          }
        } else {
          // EMI too high relative to income
          const decision = {
            status: 'REJECTED',
            reason: 'EMI_NOT_AFFORDABLE',
            explanation: `Your EMI of ₹${emi.toLocaleString('en-IN')} would be ${(emiToIncomeRatio * 100).toFixed(1)}% of your monthly salary (₹${salaryData.monthlySalary.toLocaleString('en-IN')}), which exceeds our maximum limit of ${config.MAX_EMI_TO_INCOME_RATIO * 100}%.`,
            suggestions: [
              `Reduce loan amount to ₹${Math.floor(salaryData.monthlySalary * config.MAX_EMI_TO_INCOME_RATIO * loan.tenure / (1 + config.INTEREST_RATE_ANNUAL / 1200 * loan.tenure)).toLocaleString('en-IN')} or less`,
              'Increase loan tenure to reduce EMI',
              'Consider a co-applicant to increase eligibility'
            ],
            metrics: {
              monthlySalary: salaryData.monthlySalary,
              emi: emi,
              emiToIncomeRatio: emiToIncomeRatio,
              maxAllowedRatio: config.MAX_EMI_TO_INCOME_RATIO
            }
          }
          
          session.decision = decision
          
          const message = await this.generateMessage(decision, session.language)
          
          return {
            agent: 'Underwriting Agent',
            message
          }
        }
      } else {
        // Need salary slip
        const decision = {
          status: 'DOCUMENT_REQUIRED',
          reason: 'SALARY_VERIFICATION_NEEDED',
          explanation: `Your requested amount of ₹${loan.amount.toLocaleString('en-IN')} exceeds your pre-approved limit of ₹${customer.preApprovedLimit.toLocaleString('en-IN')}. Please upload your latest salary slip to verify your income.`,
          requiredDocuments: ['Salary Slip (Latest month)'],
          metrics: {
            loanAmount: loan.amount,
            preApprovedLimit: customer.preApprovedLimit,
            estimatedEMI: emi
          }
        }
        
        session.decision = decision
        
        const message = await this.generateMessage(decision, session.language)
        
        return {
          agent: 'Underwriting Agent',
          message
        }
      }
    }
    
    // Rule 4: Amount exceeds 2x pre-approved limit - reject
    const decision = {
      status: 'REJECTED',
      reason: 'AMOUNT_EXCEEDS_LIMIT',
      explanation: `The requested amount of ₹${loan.amount.toLocaleString('en-IN')} exceeds our maximum lending limit for your profile. Your maximum eligible amount is ₹${(customer.preApprovedLimit * 2).toLocaleString('en-IN')}.`,
      suggestions: [
        `Reduce loan amount to ₹${(customer.preApprovedLimit * 2).toLocaleString('en-IN')} or less`,
        'Build credit history for 6-12 months and reapply',
        'Consider adding a co-applicant'
      ],
      metrics: {
        requestedAmount: loan.amount,
        maxEligibleAmount: customer.preApprovedLimit * 2,
        preApprovedLimit: customer.preApprovedLimit
      }
    }
    
    session.decision = decision
    
    const message = await this.generateMessage(decision, session.language)
    
    return {
      agent: 'Underwriting Agent',
      message
    }
  }
  
  // DETERMINISTIC EMI CALCULATION
  // Formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
  // Where: P = Principal, r = Monthly interest rate, n = Number of months
  static calculateEMI(principal, tenureMonths, annualRate) {
    const monthlyRate = annualRate / 1200 // Convert annual % to monthly decimal
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    
    return Math.round(emi)
  }
  
  // Generate human-readable message
  // OPTIONAL: Use GenAI only to rephrase, NOT to decide
  static async generateMessage(decision, language) {
    let message = decision.explanation
    
    if (decision.status === 'APPROVED') {
      message += ` Your EMI will be ₹${decision.emi.toLocaleString('en-IN')} per month at ${decision.interestRate}% annual interest.`
    }
    
    if (decision.suggestions && decision.suggestions.length > 0) {
      message += '\n\nSuggestions:\n' + decision.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')
    }
    
    // OPTIONAL: Polish with GenAI for better tone
    message = await GroqService.polishExplanation(message, language)
    
    return message
  }
}

export default UnderwritingAgent
