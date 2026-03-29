import time
import json
import httpx
import fitz  # PyMuPDF
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

AGENT_CONFIGS = {
    "invoice": {
        "extract_prompt": """Extract structured data from this invoice. Return ONLY valid JSON:
{
  "vendor_name": "",
  "invoice_number": "",
  "invoice_date": "",
  "due_date": "",
  "amount": 0,
  "gst_number": "",
  "items": [],
  "bank_details": ""
}""",
        "compliance_prompt": """Check invoice compliance. Verify:
1. GST number format (15 chars alphanumeric)
2. Amount is positive
3. Invoice date is valid
4. Required fields present

Return ONLY valid JSON:
{"passed": true/false, "issues": [], "warnings": []}""",
        "risk_prompt": """Assess invoice risk. Rules:
- High: amount > 1000000 (10 lakh)
- Medium: amount 100000-1000000 (1-10 lakh)  
- Low: amount < 100000

Return ONLY valid JSON:
{"score": "Low/Medium/High", "reasons": []}"""
    },
    "vendor_onboarding": {
        "extract_prompt": """Extract vendor contract data. Return ONLY valid JSON:
{
  "vendor_name": "",
  "gst_number": "",
  "contract_value": 0,
  "payment_terms": 0,
  "start_date": "",
  "end_date": "",
  "services": ""
}""",
        "compliance_prompt": """Check vendor contract compliance. Verify:
1. GST number present and valid format
2. Payment terms <= 45 days (MSME rule)
3. Contract has termination clause
4. Liability clause present

Return ONLY valid JSON:
{"passed": true/false, "issues": [], "warnings": []}""",
        "risk_prompt": """Assess vendor contract risk. Consider:
- Contract value
- Payment terms (>30 days = higher risk)
- Missing clauses

Return ONLY valid JSON:
{"score": "Low/Medium/High", "reasons": []}"""
    },
    "contract_review": {
        "extract_prompt": """Extract contract key terms. Return ONLY valid JSON:
{
  "parties": [],
  "contract_type": "",
  "value": 0,
  "duration": "",
  "payment_terms": "",
  "key_obligations": [],
  "penalties": ""
}""",
        "compliance_prompt": """Review contract for legal compliance. Check:
1. Termination clause present
2. Confidentiality/NDA clause
3. Dispute resolution mechanism
4. Liability limitations
5. Force majeure clause

Return ONLY valid JSON:
{"passed": true/false, "issues": [], "warnings": []}""",
        "risk_prompt": """Assess contract risk. Consider:
- Missing critical clauses
- Unfavorable payment terms
- High penalties
- Short notice periods

Return ONLY valid JSON:
{"score": "Low/Medium/High", "reasons": []}"""
    }
}

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text[:8000]  # limit to 8k chars

async def fetch_pdf_from_url(url: str) -> str:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(url)
        return extract_text_from_pdf_bytes(resp.content)

def call_gemini_with_retry(prompt: str, max_retries: int = 2) -> dict:
    for attempt in range(max_retries + 1):
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except (json.JSONDecodeError, Exception):
            if attempt == max_retries:
                return {}
            time.sleep(1)
    return {}

async def run_pretrained_agent(agent_type: str, pdf_bytes: bytes = None, document_url: str = None) -> dict:
    """
    Type 2: Run fixed pretrained pipeline for invoice/vendor/contract.
    Returns full result with auditLog.
    """
    config = AGENT_CONFIGS.get(agent_type)
    if not config:
        return {"error": f"Unknown agent type: {agent_type}"}

    # Extract text
    if pdf_bytes:
        doc_text = extract_text_from_pdf_bytes(pdf_bytes)
    elif document_url:
        doc_text = await fetch_pdf_from_url(document_url)
    else:
        return {"error": "No document provided"}

    audit_log = []
    retry_count = 0

    # Agent 1: Extraction
    t0 = time.time()
    extracted = call_gemini_with_retry(f"{config['extract_prompt']}\n\nDOCUMENT:\n{doc_text}")
    audit_log.append({
        "agent": "Extraction Agent",
        "output": extracted,
        "timeTakenSec": round(time.time() - t0, 2),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    })

    # Agent 2: Compliance (with self-correction)
    t0 = time.time()
    compliance = {}
    for attempt in range(3):
        compliance = call_gemini_with_retry(
            f"{config['compliance_prompt']}\n\nEXTRACTED DATA:\n{json.dumps(extracted)}"
        )
        if "passed" in compliance:
            break
        retry_count += 1
    audit_log.append({
        "agent": "Compliance Agent",
        "output": compliance,
        "timeTakenSec": round(time.time() - t0, 2),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    })

    # Agent 3: Risk
    t0 = time.time()
    risk = call_gemini_with_retry(
        f"{config['risk_prompt']}\n\nDATA:\n{json.dumps(extracted)}\nCOMPLIANCE:\n{json.dumps(compliance)}"
    )
    audit_log.append({
        "agent": "Risk Agent",
        "output": risk,
        "timeTakenSec": round(time.time() - t0, 2),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    })

    return {
        "extractedData": extracted,
        "complianceResult": compliance,
        "riskResult": risk,
        "auditLog": audit_log,
        "retryCount": retry_count,
        "finalOutput": {
            "summary": f"Processed {agent_type.replace('_', ' ')} document.",
            "extractedFields": len(extracted) if isinstance(extracted, dict) else 0,
            "compliancePassed": compliance.get("passed", False),
            "riskScore": risk.get("score", "Unknown"),
        }
    }
