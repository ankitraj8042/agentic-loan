// Translation dictionary for English and Hindi
export const translations = {
  en: {
    // Header
    headerTitle: 'Tata Capital - Personal Loan Assistant',
    languageBtn: 'हिंदी',
    voiceOn: 'Voice ON',
    voiceOff: 'Voice OFF',
    
    // Chat Panel
    chatTitle: '💬 Loan Assistant Chat',
    chatPlaceholder: 'Type your message here...',
    sendBtn: 'Send',
    uploadTooltip: 'Upload salary slip',
    typingIndicator: 'Agent is typing...',
    
    // Dashboard
    dashboardTitle: '📊 Loan Journey Dashboard',
    initializingMsg: 'Initializing your loan dashboard...',
    
    // Timeline
    timelineTitle: 'Application Progress',
    stageSales: '💼 Sales',
    stageVerification: '🔐 KYC',
    stageUnderwriting: '📋 Underwriting',
    stageDocument: '📄 Documents',
    
    // Widgets
    eligibilityTitle: 'Eligibility Score',
    approvalTitle: 'Approval Probability',
    simulatorTitle: 'Loan Calculator',
    loanAmount: 'Loan Amount',
    tenure: 'Tenure',
    emi: 'Monthly EMI',
    months: 'months',
    interestRate: 'Interest Rate',
    totalPayable: 'Total Payable',
    
    // Decision
    decisionTitle: 'Decision',
    approved: '✅ APPROVED',
    rejected: '❌ REJECTED',
    docRequired: '📄 DOCUMENT REQUIRED',
    suggestions: 'Suggestions',
    downloadLetter: 'Download Sanction Letter',
    
    // Documents
    documentsTitle: 'Document Tracker',
    kycVerified: 'KYC Verified',
    kycPending: 'KYC Pending',
    salarySlipVerified: 'Salary Slip Verified',
    salarySlipPending: 'Salary Slip Required',
    
    // Customer Info
    customerName: 'Customer',
    creditScore: 'Credit Score',
    preApprovedLimit: 'Pre-approved Limit',
    
    // Agent Names
    masterAgent: 'Master Agent',
    salesAgent: 'Sales Agent',
    verificationAgent: 'Verification Agent',
    underwritingAgent: 'Underwriting Agent',
    documentAgent: 'Document Agent',
    sanctionAgent: 'Sanction Letter Agent',
    user: 'User'
  },
  
  hi: {
    // Header
    headerTitle: 'टाटा कैपिटल - व्यक्तिगत ऋण सहायक',
    languageBtn: 'English',
    voiceOn: 'आवाज़ चालू',
    voiceOff: 'आवाज़ बंद',
    
    // Chat Panel
    chatTitle: '💬 ऋण सहायक चैट',
    chatPlaceholder: 'यहाँ अपना संदेश लिखें...',
    sendBtn: 'भेजें',
    uploadTooltip: 'वेतन पर्ची अपलोड करें',
    typingIndicator: 'एजेंट टाइप कर रहा है...',
    
    // Dashboard
    dashboardTitle: '📊 ऋण यात्रा डैशबोर्ड',
    initializingMsg: 'आपका ऋण डैशबोर्ड तैयार किया जा रहा है...',
    
    // Timeline
    timelineTitle: 'आवेदन प्रगति',
    stageSales: '💼 बिक्री',
    stageVerification: '🔐 केवाईसी',
    stageUnderwriting: '📋 मूल्यांकन',
    stageDocument: '📄 दस्तावेज़',
    
    // Widgets
    eligibilityTitle: 'पात्रता स्कोर',
    approvalTitle: 'स्वीकृति संभावना',
    simulatorTitle: 'ऋण कैलकुलेटर',
    loanAmount: 'ऋण राशि',
    tenure: 'अवधि',
    emi: 'मासिक ईएमआई',
    months: 'महीने',
    interestRate: 'ब्याज दर',
    totalPayable: 'कुल देय राशि',
    
    // Decision
    decisionTitle: 'निर्णय',
    approved: '✅ स्वीकृत',
    rejected: '❌ अस्वीकृत',
    docRequired: '📄 दस्तावेज़ आवश्यक',
    suggestions: 'सुझाव',
    downloadLetter: 'स्वीकृति पत्र डाउनलोड करें',
    
    // Documents
    documentsTitle: 'दस्तावेज़ ट्रैकर',
    kycVerified: 'केवाईसी सत्यापित',
    kycPending: 'केवाईसी लंबित',
    salarySlipVerified: 'वेतन पर्ची सत्यापित',
    salarySlipPending: 'वेतन पर्ची आवश्यक',
    
    // Customer Info
    customerName: 'ग्राहक',
    creditScore: 'क्रेडिट स्कोर',
    preApprovedLimit: 'पूर्व-स्वीकृत सीमा',
    
    // Agent Names
    masterAgent: 'मास्टर एजेंट',
    salesAgent: 'बिक्री एजेंट',
    verificationAgent: 'सत्यापन एजेंट',
    underwritingAgent: 'मूल्यांकन एजेंट',
    documentAgent: 'दस्तावेज़ एजेंट',
    sanctionAgent: 'स्वीकृति पत्र एजेंट',
    user: 'उपयोगकर्ता'
  }
}

export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || translations.en[key] || key
}

export const formatCurrency = (amount, lang = 'en') => {
  if (!amount) return lang === 'hi' ? '₹0' : '₹0'
  return new Intl.NumberFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}
