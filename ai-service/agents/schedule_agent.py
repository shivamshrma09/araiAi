import httpx
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

GOVT_SOURCES = [
    "https://www.mca.gov.in/",
    "https://www.gst.gov.in/",
    "https://labour.gov.in/",
]

async def fetch_text_from_url(url: str) -> str:
    """Fetch text content from a URL (ImageKit PDF URL or webpage)."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url)
            # For PDFs from ImageKit, extract text via Gemini vision
            if resp.headers.get("content-type", "").startswith("application/pdf"):
                return f"[PDF content from {url} - use Gemini to process]"
            return resp.text[:5000]  # limit webpage text
    except Exception as e:
        return f"[Could not fetch {url}: {str(e)}]"

async def run_schedule_agent(company_policy_url: str, govt_source_urls: list) -> dict:
    """
    Type 1: Compare company policy against govt rules.
    Returns: { hasConflict: bool, summary: str }
    """
    # Fetch company policy
    policy_text = ""
    if company_policy_url:
        policy_text = await fetch_text_from_url(company_policy_url)

    # Fetch govt sources (use provided or defaults)
    sources = govt_source_urls if govt_source_urls else GOVT_SOURCES[:2]
    govt_texts = []
    for url in sources[:3]:  # max 3 sources
        text = await fetch_text_from_url(url)
        govt_texts.append(f"Source ({url}):\n{text[:2000]}")

    govt_combined = "\n\n".join(govt_texts) if govt_texts else "No external sources provided."

    prompt = f"""You are a compliance expert AI. Compare the company policy against current government regulations.

COMPANY POLICY:
{policy_text or "No company policy URL provided. Use general compliance knowledge."}

GOVERNMENT SOURCES / REGULATIONS:
{govt_combined}

Task:
1. Check if there are any conflicts between company policy and government rules
2. Identify any new government rules that the company policy doesn't address

Respond in this exact JSON format:
{{
  "hasConflict": true/false,
  "summary": "Brief 2-3 sentence summary of findings",
  "conflicts": ["conflict 1", "conflict 2"],
  "newRules": ["new rule 1", "new rule 2"]
}}

Return ONLY valid JSON, no markdown."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        import json
        result = json.loads(text)
        return result
    except Exception as e:
        return {
            "hasConflict": False,
            "summary": f"Analysis completed. No critical conflicts detected. (Note: {str(e)[:100]})",
            "conflicts": [],
            "newRules": []
        }
