# Aria — Multi-Agent AI Platform

3 types of pre-built agents for enterprise automation.

## Agent Types

| Type | What it does | How to use |
|------|-------------|------------|
| ⏰ Schedule Agent | Auto-monitors company policy vs govt rules on cron | Create → Set cron → Run Now or wait |
| 📄 Pretrained Agent | Invoice / Vendor Onboarding / Contract Review | Upload PDF → AI processes → Approve/Reject |
| 🔗 Custom Link Agent | HR creates session → unique URL → employee chats | Fill employee data → Copy link → Send to employee |

## Setup

### 1. Add Gemini API Key
Edit `ai-service/.env`:
```
GEMINI_API_KEY=your_key_here
```
Get key from: https://aistudio.google.com/app/apikey

### 2. Start Everything
```
start.bat
```
Or manually:
```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - AI Service  
cd ai-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# Terminal 3 - Frontend
cd frontend && npm install && npm run dev
```

### 3. Open App
- Dashboard: http://localhost:5173
- Employee chat (example): http://localhost:5173/agent/{token}

## Architecture

```
frontend/          React + Vite (port 5173)
backend/           Node.js + Express + MongoDB (port 3001)
ai-service/        Python FastAPI + Gemini (port 8000)
```

## For Pretrained Agent - ImageKit URLs
Upload your PDFs to ImageKit and paste the URL in the document URL field.
The AI service will fetch and process the PDF directly.

## MongoDB
Make sure MongoDB is running locally: `mongodb://localhost:27017/aria`
