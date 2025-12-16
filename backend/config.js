// Configuration for Agentic Loan System
// Contains API keys and system settings

export default {
  // Groq API for GenAI (optional enhancement)
  GROQ_API_KEY: process.env.GROQ_API_KEY || 'your-groq-api-key',
  
  // Feature flags
  ENABLE_GENAI: true, // If false, fall back to rule-based responses
  
  // Loan policy parameters
  MIN_CREDIT_SCORE: 700,
  MIN_LOAN_AMOUNT: 50000,
  MAX_LOAN_AMOUNT: 2000000,
  MIN_TENURE_MONTHS: 6,
  MAX_TENURE_MONTHS: 60,
  MAX_EMI_TO_INCOME_RATIO: 0.50, // 50% of salary
  
  // Interest rates (simplified for prototype)
  INTEREST_RATE_ANNUAL: 12.5,
  
  // Mock customer database path
  CUSTOMER_DATA_PATH: '../data/customers.json'
}
