import React, { useState } from 'react'
import { getTranslation, formatCurrency } from '../translations'
import './DashboardPanel.css'

function DashboardPanel({ sessionData, language = 'en' }) {
  const t = (key) => getTranslation(language, key)
  const [simulatorAmount, setSimulatorAmount] = useState('')
  const [simulatorTenure, setSimulatorTenure] = useState('')
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  
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
  
  const calculateEMI = (amount, tenure) => {
    if (!amount || !tenure) return 0
    
    const monthlyRate = 12.5 / 1200
    const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
                (Math.pow(1 + monthlyRate, tenure) - 1)
    
    return Math.round(emi)
  }
  
  const simulatedEMI = calculateEMI(
    simulatorAmount || loan.amount, 
    simulatorTenure || loan.tenure
  )
  
  const calculatedEMI = calculateEMI(loan.amount, loan.tenure)
  
  const eligibility = calculateEligibility()
  const approvalProbability = calculateApprovalProbability()
  
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
          <div className="simulator-header">
            <h3>{t('simulatorTitle')}</h3>
            <button 
              className="simulator-toggle"
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            >
              {isSimulatorOpen ? '🔽' : '▶️'} {isSimulatorOpen ? (language === 'hi' ? 'बंद करें' : 'Close') : (language === 'hi' ? 'खोलें' : 'Open')}
            </button>
          </div>
          
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
                {calculatedEMI > 0 ? formatCurrency(calculatedEMI, language) : '—'}
              </span>
            </div>
          </div>
          
          {isSimulatorOpen && (
            <div className="simulator-controls">
              <h4>{language === 'hi' ? '🧮 कस्टम गणना' : '🧮 Custom Calculation'}</h4>
              <div className="input-group">
                <label>{t('loanAmount')}:</label>
                <input 
                  type="number"
                  placeholder={loan.amount || '200000'}
                  value={simulatorAmount}
                  onChange={(e) => setSimulatorAmount(Number(e.target.value))}
                  min="50000"
                  max="2000000"
                  step="10000"
                />
              </div>
              <div className="input-group">
                <label>{t('tenure')} ({t('months')}):</label>
                <input 
                  type="number"
                  placeholder={loan.tenure || '24'}
                  value={simulatorTenure}
                  onChange={(e) => setSimulatorTenure(Number(e.target.value))}
                  min="6"
                  max="60"
                />
              </div>
              <div className="simulated-result">
                <span>{language === 'hi' ? '📊 अनुमानित ईएमआई:' : '📊 Estimated EMI:'}</span>
                <span className="simulated-emi">
                  {simulatedEMI > 0 ? formatCurrency(simulatedEMI, language) : '—'}
                </span>
              </div>
            </div>
          )}
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
                href={`/api/download-pdf/${sessionData.pdfFilename}`}
                download
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
