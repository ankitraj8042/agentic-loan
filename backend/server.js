// Backend Server for Agentic Loan Assistant
// Tata Capital - Personal Loans
// BFSI Compliant Prototype

import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import MasterAgent from './agents/MasterAgent.js'
import FirebaseService from './services/FirebaseService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')))

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})
const upload = multer({ storage })

// In-memory session store (PROTOTYPE ONLY)
// In production, use Redis or similar
const sessions = new Map()

// ROUTE: Initialize new session
app.post('/api/session/init', (req, res) => {
  const sessionId = uuidv4()
  
  // Create new session with initial state
  const session = {
    sessionId,
    stage: 'SALES',
    customer: null, // Will be identified later
    loan: {
      amount: null,
      tenure: null
    },
    documents: {
      kycVerified: false,
      salarySlipUploaded: false,
      salarySlipData: null
    },
    intent: 'NEUTRAL',
    language: 'en',
    decision: null,
    messages: []
  }
  
  sessions.set(sessionId, session)
  
  const greeting = 'Hello! I\'m your personal loan assistant. How can I help you today?'
  
  res.json({
    sessionId,
    session,
    greeting
  })
})

// ROUTE: Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { sessionId, message, language } = req.body
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid session' })
  }
  
  const session = sessions.get(sessionId)
  session.language = language || 'en'
  
  // Add user message to history
  session.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  })
  
  try {
    // Process message through Master Agent
    const responses = await MasterAgent.process(session, message)
    
    // Add agent responses to history
    responses.forEach(resp => {
      session.messages.push({
        role: 'agent',
        agent: resp.agent,
        content: resp.message,
        timestamp: new Date()
      })
    })
    
    // Update session
    sessions.set(sessionId, session)
    
    res.json({
      responses,
      session
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ 
      error: 'Processing failed',
      responses: [{
        agent: 'Master Agent',
        message: 'I apologize, but I encountered an error. Please try again.'
      }]
    })
  }
})

// ROUTE: Upload document
app.post('/api/upload', upload.single('document'), async (req, res) => {
  const { sessionId } = req.body
  const file = req.file
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid session' })
  }
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  
  const session = sessions.get(sessionId)
  
  try {
    // Process document (mocked for prototype)
    // In real system, extract text and validate
    session.documents.salarySlipUploaded = true
    session.documents.salarySlipData = {
      filename: file.filename,
      uploadedAt: new Date(),
      // MOCK: Extract salary data
      monthlySalary: 75000, // Hardcoded for demo
      employer: 'Tech Corp India Pvt Ltd'
    }
    
    sessions.set(sessionId, session)
    
    // Re-evaluate underwriting with new document
    const responses = await MasterAgent.process(session, '__DOCUMENT_UPLOADED__')
    
    res.json({
      message: 'Document uploaded successfully',
      responses,
      session
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload processing failed' })
  }
})

// ROUTE: Get session data
app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params
  
  if (!sessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' })
  }
  
  res.json(sessions.get(sessionId))
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() })
})

// ROUTE: Download PDF
app.get('/api/download-pdf/:filename', (req, res) => {
  const { filename } = req.params
  const filepath = path.join(__dirname, 'pdfs', filename)
  
  console.log('PDF Download Request:', filename)
  console.log('File path:', filepath)
  
  // Check if file exists first
  if (!fs.existsSync(filepath)) {
    console.error('PDF not found:', filepath)
    return res.status(404).json({ error: 'PDF not found' })
  }
  
  console.log('File exists, starting download...')
  
  // Set proper headers
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  
  // Stream the file
  const fileStream = fs.createReadStream(filepath)
  fileStream.pipe(res)
  
  fileStream.on('error', (err) => {
    console.error('File stream error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error downloading file' })
    }
  })
})

// ROUTE: Initialize Firebase dummy data (call once)
app.post('/api/init-firebase', async (req, res) => {
  try {
    await FirebaseService.initializeDummyCustomers()
    res.json({ message: 'Firebase initialized with 10 dummy customers' })
  } catch (error) {
    console.error('Firebase init error:', error)
    res.status(500).json({ error: 'Failed to initialize Firebase' })
  }
})

app.listen(PORT, async () => {
  console.log(`🚀 Agentic Loan Server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: PROTOTYPE`)
  console.log(`🏦 Use Case: Tata Capital Personal Loans`)
  console.log(``)
  console.log(`🔥 Initializing Firebase with dummy customers...`)
  try {
    await FirebaseService.initializeDummyCustomers()
    console.log(`✓ Firebase ready with customer database`)
  } catch (error) {
    console.error(`✗ Firebase initialization failed:`, error.message)
  }
})
