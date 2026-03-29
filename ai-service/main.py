from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

load_dotenv()

from agents.schedule_agent import run_schedule_agent
from agents.pretrained_agent import run_pretrained_agent
from agents.custom_link_agent import chat_with_employee

app = FastAPI(title="Aria AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Type 1: Schedule Agent ───────────────────────────────────────────────────

class ScheduleRunRequest(BaseModel):
    agentId: str
    companyPolicyUrl: Optional[str] = None
    govtSourceUrls: Optional[List[str]] = []

@app.post("/schedule/run")
async def schedule_run(req: ScheduleRunRequest):
    result = await run_schedule_agent(req.companyPolicyUrl, req.govtSourceUrls)
    return result

# ─── Type 2: Pretrained Agent ─────────────────────────────────────────────────

@app.post("/pretrained/run")
async def pretrained_run(
    file: UploadFile = File(...),
    agentType: str = Form(...),
    runId: str = Form(None),
):
    if agentType not in ["invoice", "vendor_onboarding", "contract_review"]:
        raise HTTPException(400, "Invalid agentType")
    pdf_bytes = await file.read()
    result = await run_pretrained_agent(agentType, pdf_bytes=pdf_bytes)
    return result

class PretrainedUrlRequest(BaseModel):
    documentUrl: str
    agentType: str
    runId: Optional[str] = None

@app.post("/pretrained/run-url")
async def pretrained_run_url(req: PretrainedUrlRequest):
    if req.agentType not in ["invoice", "vendor_onboarding", "contract_review"]:
        raise HTTPException(400, "Invalid agentType")
    result = await run_pretrained_agent(req.agentType, document_url=req.documentUrl)
    return result

# ─── Type 3: Custom Link Agent ────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    employeeData: dict
    companyName: Optional[str] = ""
    companyPolicyUrl: Optional[str] = None
    agentTone: Optional[str] = "friendly"
    fieldsToCollect: Optional[List[dict]] = []
    chatHistory: Optional[List[dict]] = []

@app.post("/custom-link/chat")
async def custom_link_chat(req: ChatRequest):
    result = await chat_with_employee(
        message=req.message,
        employee_data=req.employeeData,
        company_name=req.companyName,
        company_policy_url=req.companyPolicyUrl,
        agent_tone=req.agentTone,
        fields_to_collect=req.fieldsToCollect,
        chat_history=req.chatHistory,
    )
    return result

@app.get("/health")
def health():
    return {"status": "ok"}

# ─── Email Sender ─────────────────────────────────────────────────────────────

class EmailRequest(BaseModel):
    to: str
    subject: str
    content: str

@app.post("/email/send")
async def send_email(req: EmailRequest):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")

    if not smtp_user or not smtp_pass:
        raise HTTPException(400, "SMTP credentials not configured in ai-service/.env")

    # Use Gemini to polish the email content
    polish_prompt = f"""You are a professional email writer. Polish and improve this email content while keeping the same meaning. Keep it concise and professional.

Original content:
{req.content}

Return ONLY the improved email body text, no subject line, no greeting unless already present."""

    try:
        response = genai.GenerativeModel("gemini-1.5-flash").generate_content(polish_prompt)
        polished_content = response.text.strip()
    except Exception:
        polished_content = req.content

    # Send email
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = req.to
    msg['Subject'] = req.subject
    msg.attach(MIMEText(polished_content, 'plain'))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        return {"message": f"Email sent to {req.to} successfully!", "polishedContent": polished_content}
    except Exception as e:
        raise HTTPException(500, f"SMTP error: {str(e)}")
