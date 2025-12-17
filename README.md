# 🏦 Agentic Loan Assistant

**Agentic Loan Assistant** is an AI-powered, multi-agent personal loan sales system designed for NBFCs.  
It automates the end-to-end loan journey — from customer identification to sanction letter generation — while ensuring **explainability, compliance, and transparency**.

---

## 🎯 Problem Statement

NBFCs face high drop-offs in digital personal loan journeys due to static chatbots, lack of personalization, and unclear eligibility decisions. Customers often do not understand why they are approved or rejected, leading to loss of trust and reduced conversion.

This project addresses the gap by introducing an **Agentic AI–driven conversational system** that simulates a human loan officer while keeping all financial decisions deterministic and auditable.

---

## 💡 Solution Overview

The solution uses a **Master Agent** to orchestrate multiple **specialized Worker Agents**, each responsible for a specific stage in the loan lifecycle.  
This architecture enables a conversational, guided, and explainable loan experience with real-time feedback.

---

## 🤖 Agentic Architecture

### Master Agent
- Controls the conversation flow
- Maintains session state
- Orchestrates worker agents based on user intent

### Worker Agents
1. **Sales Agent** – Captures loan requirements (amount, tenure)
2. **Verification Agent** – Identifies customers using mobile number
3. **Underwriting Agent** – Evaluates eligibility using rule-based logic
4. **Document Agent** – Manages document-related flow
5. **Sanction Letter Agent** – Generates downloadable PDF sanction letter

---

## 📊 Key Capabilities

- Agent-tagged conversational interface  
- Real-time loan journey dashboard (Sales → KYC → Underwriting → Sanction)  
- Live eligibility score and approval probability  
- Transparent EMI calculation  
- Automated PDF sanction letter generation  
- Multilingual support (English / Hindi)  

---

## 🔒 BFSI Compliance

- **No GenAI is used for underwriting or credit decisions**
- All eligibility checks are **rule-based, deterministic, and auditable**
- GenAI (Groq LLaMA 3.3 70B) is used **only** for:
  - Conversational tone enhancement  
  - Language translation  
  - Explanation rephrasing  

This ensures regulatory safety while preserving a human-like interaction.

---

## 🏗️ Technology Stack

**Frontend**
- React (Web Application)
- Conversational chat + real-time dashboard

**Backend**
- Node.js + Express
- Multi-agent orchestration layer

**AI**
- Groq API (LLaMA 3.3 70B) – conversational intelligence only

**Data**
- Firebase Firestore (static customer and policy data)

**Documents**
- PDFKit for sanction letter generation

---

## 🔁 End-to-End User Flow

1. User initiates chat and is identified via mobile number  
2. Master Agent routes the flow to Sales Agent  
3. Loan amount and tenure are captured  
4. Verification Agent validates customer profile  
5. Underwriting Agent evaluates eligibility  
6. Decision is explained transparently  
7. Sanction letter is generated and downloaded  

---

## 🚀 Why This Solution Stands Out

- True **Agentic AI orchestration**, not a traditional chatbot  
- Fully **explainable and compliant underwriting decisions**  
- Real-time dashboard for user clarity and trust  
- Designed for **enterprise BFSI scalability**  
- Clear separation between AI conversation and financial logic  

---

## 📌 Note

This project is a **functional prototype** built for the **EY Techathon**, using simulated data to demonstrate architecture, explainability, and business impact.
