# 🏦 Agentic Loan Assistant

An intelligent, multi-agent loan processing system powered by AI that automates the entire loan application journey - from customer verification to sanction letter generation.

## ✨ Features

- **🤖 Multi-Agent Architecture**: Master Agent orchestrating 5 specialized Worker Agents
- **📱 Customer Authentication**: Phone-based verification with Firebase integration
- **💬 Intelligent Conversations**: AI-powered chat using Groq's Llama 3.3 70B
- **🌐 Multi-Language Support**: English and Hindi translation
- **📊 Real-Time Dashboard**: Live tracking of loan application progress
- **📄 PDF Generation**: Automated sanction letter creation
- **🎨 Modern UI**: Glassmorphism design with smooth animations

## 🏗️ Architecture

### Agent System

**Master Agent**: Central orchestrator managing conversation flow and state transitions

**Worker Agents**:
1. **Sales Agent**: Introduces loan products and collects requirements
2. **Verification Agent**: Authenticates customers and gathers financial details
3. **Underwriting Agent**: Assesses eligibility and calculates loan terms
4. **Document Agent**: Manages required documentation
5. **Sanction Letter Agent**: Generates final approval PDF

### Tech Stack

**Frontend**:
- React 18
- Vite
- Modern CSS3 (Glassmorphism, Animations)

**Backend**:
- Node.js + Express
- Firebase Firestore
- Groq AI (Llama 3.3 70B Versatile)
- PDFKit
6. **Agent Timeline**: Visual workflow progress

## 🔒 BFSI Compliance

### Non-Negotiable Rules

**NO GenAI in Decision Making**
- Credit decisions are 100% deterministic
- All underwriting rules are hardcoded and auditable
- GenAI used ONLY for:
  - Sales conversation tone enhancement

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase Project (with Firestore enabled)
- Groq API Key

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd agentic-loan
```

2. **Configure Environment Variables**

Create `backend/.env`:
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email@your-project.iam.gserviceaccount.com
```

3. **Install Dependencies**

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

4. **Start the Application**

Backend (from `backend/` directory):
```bash
npm start
```

Frontend (from `frontend/` directory):
```bash
npm run dev
```

5. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message and get agent response |
| POST | `/api/new-session` | Create new conversation session |
| GET | `/api/download-pdf/:filename` | Download sanction letter PDF |

## 🎯 User Flow

1. **Welcome**: User starts chat with Master Agent
2. **Verification**: 
   - Enter phone number
   - Existing customer: Welcomed by name
   - New customer: Provide name and income
3. **Sales**: Discuss loan requirements (amount, purpose, tenure)
4. **Underwriting**: AI analyzes eligibility and calculates terms
5. **Documentation**: Upload/verify required documents
6. **Sanction**: Generate and download approval letter

## 🗂️ Project Structure

```
agentic-loan/
├── backend/
│   ├── agents/
│   │   ├── MasterAgent.js          # Central orchestrator
│   │   ├── SalesAgent.js           # Product introduction
│   │   ├── VerificationAgent.js    # Customer authentication
│   │   ├── UnderwritingAgent.js    # Eligibility assessment
│   │   ├── DocumentAgent.js        # Document management
│   │   └── SanctionLetterAgent.js  # PDF generation
│   ├── services/
│   │   ├── FirebaseService.js      # Database operations
│   │   └── GroqService.js          # AI integration
│   ├── .env                        # Environment variables
│   ├── server.js                   # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPanel.jsx       # Chat interface
│   │   │   ├── ChatPanel.css
│   │   │   ├── DashboardPanel.jsx  # Progress dashboard
│   │   │   └── DashboardPanel.css
│   │   ├── App.jsx                 # Main application
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Create a service account and download credentials
4. Add credentials to `backend/.env`
5. Initialize with dummy customers (done automatically on first run)

### Groq AI Setup

1. Get API key from https://console.groq.com
2. Add to `backend/.env` as `GROQ_API_KEY`
3. Model used: `llama-3.3-70b-versatile`

## 🎨 Design Features

- **Glassmorphism Effects**: Modern blurred glass appearance
- **Gradient Backgrounds**: Dynamic color schemes
- **Smooth Animations**: Cubic-bezier transitions
- **Responsive Layout**: Two-column dashboard layout
- **Hover Effects**: Interactive UI elements
- **Progress Tracking**: Visual loan stage indicators

## 🔒 Security Notes

- Never commit `.env` files
- Keep Firebase credentials secure
- Use environment variables for all secrets
- Implement rate limiting in production
- Add authentication middleware for APIs

## 🐛 Troubleshooting

**Groq API Errors**:
- Ensure API key is correct in `.env`
- Check model name is `llama-3.3-70b-versatile`
- Verify API quota limits

**Firebase Connection Issues**:
- Validate service account credentials
- Check Firestore rules and permissions
- Ensure project ID matches

**PDF Generation Fails**:
- Check PDFKit installation
- Verify write permissions for backend directory
- Check session data completeness

## 📝 Sample Customer Data

10 dummy customers are initialized automatically:
- Phone: +919876543210 to +919876543219
- Names: Rajesh Kumar, Priya Sharma, Amit Patel, etc.
- Incomes: ₹500,000 to ₹2,000,000

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is created for the EY Techathon 2024.

## 🙏 Acknowledgments

- Groq AI for powerful language models
- Firebase for database infrastructure
- React and Vite for frontend framework

---

**Built with ❤️ for EY Techathon**
