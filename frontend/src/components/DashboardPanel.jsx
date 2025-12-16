import React from 'react'
import { getTranslation, formatCurrency } from '../translations'
import './DashboardPanel.css'

function DashboardPanel({ sessionData, language = 'en' }) {
  const t = (key) => getTranslation(language, key)
  
  if (!sessionData) {
    return (
      <div className="dashboard-panel">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t('initializingMsg')}</p>
        </div>
      </div>
    )
  }
  
  const { stage, loan, customer, decision, documents } = sessionData
  
  // Calculate eligibility percentage
  const calculateEligibility = () => {
    if (!customer) return 0
    
    let score = 0
    
    // Credit score (40%)
    if (customer.creditScore >= 700) score += 40
    else score += (customer.creditScore / 700) * 40
    
    // KYC (20%)
    if (documents.kycVerified) score += 20
    
    // Loan amount vs limit (40%)
    if (loan.amount && customer.preApprovedLimit) {
      const ratio = loan.amount / (customer.preApprovedLimit * 2)
      score += Math.max(0, (1 - ratio) * 40)
    }
    
    return Math.round(Math.min(100, score))
  }
  
  const calculateApprovalProbability = () => {
    if (decision) {
      if (decision.status === 'APPROVED') return 100
      if (decision.status === 'REJECTED') return 0
      if (decision.status === 'DOCUMENT_REQUIRED') return 50
    }
    
    return calculateEligibility()
  }
  
  const calculateEMI = () => {
    if (!loan.amount || !loan.tenure) return 0
    
    const monthlyRate = 12.5 / 1200
    const emi = loan.amount * monthlyRate * Math.pow(1 + monthlyRate, loan.tenure) / 
                (Math.pow(1 + monthlyRate, loan.tenure) - 1)
    
    return Math.round(emi)
  }
  
  const eligibility = calculateEligibility()
  const approvalProbability = calculateApprovalProbability()
  const emi = calculateEMI()
  
  const stages = ['SALES', 'VERIFICATION', 'UNDERWRITING', 'DOCUMENT', 'FINAL']
  const currentStageIndex = stages.indexOf(stage)
  
  return (
    <div className="dashboard-panel">
      <div className="dashboard-header">
        <h2>{t('dashboardTitle')}</h2>
      </div>
      
      <div className="dashboard-content">
        {/* Agent Timeline */}
        <div className="widget timeline-widget">
          <h3>{t('timelineTitle')}</h3>
          <div className="timeline">
            {stages.slice(0, -1).map((stageName, index) => (
              <div 
                key={stageName}
                className={`timeline-stage ${index <= currentStageIndex ? 'active' : ''} ${index === currentStageIndex ? 'current' : ''}`}
              >
                <div className="stage-dot"></div>
                <div className="stage-label">
                  {stageName === 'SALES' ? t('stageSales') :
                   stageName === 'VERIFICATION' ? t('stageVerification') :
                   stageName === 'UNDERWRITING' ? t('stageUnderwriting') :
                   stageName === 'DOCUMENT' ? t('stageDocument') : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Eligibility Meter */}
        <div className="widget meter-widget">
          <h3>{t('eligibilityTitle')}</h3>
          <div className="meter">
            <svg viewBox="0 0 200 120">
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${eligibility * 2.5} 250`}
              />
              <defs>
                <linearGradient id="gradient">
                  <stop offset="0%" stopColor="#f56565" />
                  <stop offset="50%" stopColor="#ed8936" />
                  <stop offset="100%" stopColor="#48bb78" />
                </linearGradient>
              </defs>
            </svg>
            <div className="meter-value">{eligibility}%</div>
          </div>
        </div>
        
        {/* Approval Probability */}
        <div className="widget probability-widget">
          <h3>{t('approvalTitle')}</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${approvalProbability}%`,
                backgroundColor: 
                  approvalProbability >= 70 ? '#48bb78' :
                  approvalProbability >= 40 ? '#ed8936' : '#f56565'
              }}
            ></div>
          </div>
          <div className="probability-value">{approvalProbability}%</div>
        </div>
        
        {/* Loan Simulator */}
        <div className="widget simulator-widget">
          <h3>{t('simulatorTitle')}</h3>
          <div className="simulator-details">
            <div className="detail-row">
              <span>{t('loanAmount')}:</span>
              <span className="value">
                {loan.amount ? formatCurrency(loan.amount, language) : '—'}
              </span>
            </div>
            <div className="detail-row">
              <span>{t('tenure')}:</span>
              <span className="value">
                {loan.tenure ? `${loan.tenure} ${t('months')}` : '—'}
              </span>
            </div>
            <div className="detail-row">
              <span>{t('interestRate')}:</span>
              <span className="value">12.5% p.a.</span>
            </div>
            <div className="detail-row highlight">
              <span>{t('emi')}:</span>
              <span className="value">
                {emi > 0 ? formatCurrency(emi, language) : '—'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Decision Card */}
        {decision && (
          <div className={`widget decision-widget ${decision.status.toLowerCase()}`}>
            <h3>
              {decision.status === 'APPROVED' ? t('approved') :
               decision.status === 'REJECTED' ? t('rejected') :
               decision.status === 'DOCUMENT_REQUIRED' ? t('docRequired') : t('decisionTitle')}
            </h3>
            <p className="decision-explanation">{decision.explanation}</p>
            
            {decision.suggestions && decision.suggestions.length > 0 && (
              <div className="suggestions">
                <h4>{t('suggestions')}:</h4>
                <ul>
                  {decision.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {decision.status === 'APPROVED' && sessionData.pdfFilename && (
              <a 
                href={`http://localhost:5000/pdfs/${sessionData.pdfFilename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="download-btn"
              >
                📥 {t('downloadLetter')}
              </a>
            )}
          </div>
        )}
        
        {/* Document Status */}
        <div className="widget document-widget">
          <h3>{t('documentsTitle')}</h3>
          <div className="document-list">
            <div className={`document-item ${documents.kycVerified ? 'verified' : 'pending'}`}>
              <span className="doc-icon">
                {documents.kycVerified ? '✅' : '⏳'}
              </span>
              <div className="doc-info">
                <div className="doc-name">{t('stageVerification')}</div>
                <div className="doc-status">
                  {documents.kycVerified ? t('kycVerified') : t('kycPending')}
                </div>
              </div>
            </div>
            
            <div className={`document-item ${documents.salarySlipUploaded ? 'verified' : 'pending'}`}>
              <span className="doc-icon">
                {documents.salarySlipUploaded ? '✅' : '⏳'}
              </span>
              <div className="doc-info">
                <div className="doc-name">{language === 'hi' ? 'वेतन पर्ची' : 'Salary Slip'}</div>
                <div className="doc-status">
                  {documents.salarySlipUploaded ? t('salarySlipVerified') : 
                   decision?.status === 'DOCUMENT_REQUIRED' ? t('salarySlipPending') : 
                   language === 'hi' ? 'आवश्यक नहीं' : 'Not Required'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPanel
