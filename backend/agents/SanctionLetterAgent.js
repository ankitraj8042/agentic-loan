// Sanction Letter Agent - Generates PDF sanction letter
// Uses pdfkit to create professional loan sanction documents

import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class SanctionLetterAgent {
  static async process(session) {
    if (session.decision?.status !== 'APPROVED') {
      return {
        agent: 'Sanction Letter Agent',
        message: 'Sanction letter can only be generated for approved loans.'
      }
    }
    
    try {
      const filename = await this.generatePDF(session)
      
      // Store PDF filename in session for later retrieval
      session.pdfFilename = filename
      
      return {
        agent: 'Sanction Letter Agent',
        message: `Congratulations! Your loan sanction letter has been generated. You can download it from the dashboard.`,
        pdfUrl: `/pdfs/${filename}`
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      return {
        agent: 'Sanction Letter Agent',
        message: 'There was an error generating your sanction letter. Please contact support.'
      }
    }
  }
  
  static async generatePDF(session) {
    const { customer, loan, decision } = session
    const filename = `sanction-${session.sessionId}.pdf`
    const filepath = path.join(__dirname, '../pdfs', filename)
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 })
      const stream = fs.createWriteStream(filepath)
      
      doc.pipe(stream)
      
      // Header
      doc.fontSize(20)
         .fillColor('#667eea')
         .text('TATA CAPITAL', { align: 'center' })
      
      doc.fontSize(12)
         .fillColor('#000')
         .text('Personal Loan Division', { align: 'center' })
         .moveDown()
      
      doc.fontSize(16)
         .fillColor('#000')
         .text('LOAN SANCTION LETTER', { align: 'center', underline: true })
         .moveDown(2)
      
      // Date
      doc.fontSize(10)
         .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' })
         .moveDown()
      
      // Customer details
      doc.fontSize(12)
         .text('Customer Details:', { underline: true })
         .moveDown(0.5)
      
      doc.fontSize(10)
         .text(`Name: ${customer.name}`)
         .text(`Customer ID: ${customer.customerId}`)
         .text(`Credit Score: ${customer.creditScore}`)
         .moveDown()
      
      // Loan details
      doc.fontSize(12)
         .text('Loan Details:', { underline: true })
         .moveDown(0.5)
      
      doc.fontSize(10)
         .text(`Loan Amount: ₹${loan.amount.toLocaleString('en-IN')}`)
         .text(`Tenure: ${loan.tenure} months`)
         .text(`Interest Rate: ${decision.interestRate}% per annum`)
         .text(`Monthly EMI: ₹${decision.emi.toLocaleString('en-IN')}`)
         .text(`Total Amount Payable: ₹${(decision.emi * loan.tenure).toLocaleString('en-IN')}`)
         .moveDown()
      
      // Terms and conditions
      doc.fontSize(12)
         .text('Terms & Conditions:', { underline: true })
         .moveDown(0.5)
      
      doc.fontSize(9)
         .text('1. This sanction is valid for 15 days from the date of issue.')
         .text('2. Final disbursement is subject to verification of documents.')
         .text('3. The loan is subject to the terms mentioned in the loan agreement.')
         .text('4. Prepayment charges may apply as per the loan agreement.')
         .text('5. In case of default, penal interest will be charged.')
         .moveDown(2)
      
      // Signature
      doc.fontSize(10)
         .text('Authorized Signatory', { align: 'right' })
         .text('Tata Capital Limited', { align: 'right' })
      
      // Footer
      doc.fontSize(8)
         .fillColor('#666')
         .text('This is a system-generated document and does not require a signature.', 50, doc.page.height - 50, {
           align: 'center',
           width: doc.page.width - 100
         })
      
      doc.end()
      
      stream.on('finish', () => {
        resolve(filename)
      })
      
      stream.on('error', (error) => {
        reject(error)
      })
    })
  }
}

export default SanctionLetterAgent
