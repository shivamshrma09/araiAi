import json
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

def build_system_prompt(employee_data: dict, company_name: str, agent_tone: str, fields_to_collect: list) -> str:
    pending_fields = [f for f in fields_to_collect if not f.get("collected")]
    collected_fields = [f for f in fields_to_collect if f.get("collected")]

    tone_instruction = (
        "Be warm, friendly, and conversational. Use simple language."
        if agent_tone == "friendly"
        else "Be professional, formal, and concise."
    )

    pending_str = "\n".join([f"- {f['field']}: {f['question']}" for f in pending_fields]) or "All fields collected!"
    collected_str = "\n".join([f"- {f['field']}: {f.get('value', 'collected')}" for f in collected_fields]) or "None yet"

    return f"""You are Aria, the AI onboarding assistant for {company_name or "the company"}.

Employee Details:
- Name: {employee_data.get('name', 'Employee')}
- Role: {employee_data.get('role', 'Team Member')}
- Department: {employee_data.get('department', '')}
- Joining Date: {employee_data.get('joiningDate', '')}
- Reporting Manager: {employee_data.get('reportingManager', '')}

Tone: {tone_instruction}

Your job is to collect the following information from the employee through natural conversation:

STILL NEED TO COLLECT:
{pending_str}

ALREADY COLLECTED:
{collected_str}

Instructions:
1. Greet the employee by name on first message
2. Ask for one field at a time in a natural way
3. When employee provides information, acknowledge it warmly and ask for the next field
4. If all fields are collected, congratulate them and say HR will be in touch
5. Answer any questions about company policies if asked

IMPORTANT: After each response, if the employee provided a value for any field, include at the END of your response (hidden from display) a JSON marker like:
[COLLECTED:{{"field": "field_name", "value": "the_value"}}]

Keep responses concise (2-3 sentences max)."""

def parse_collected_fields(reply: str) -> tuple[str, list]:
    """Extract collected field markers from AI reply."""
    import re
    collected = []
    pattern = r'\[COLLECTED:(\{.*?\})\]'
    matches = re.findall(pattern, reply)
    for match in matches:
        try:
            collected.append(json.loads(match))
        except:
            pass
    # Remove markers from visible reply
    clean_reply = re.sub(r'\[COLLECTED:\{.*?\}\]', '', reply).strip()
    return clean_reply, collected

async def chat_with_employee(
    message: str,
    employee_data: dict,
    company_name: str,
    company_policy_url: str,
    agent_tone: str,
    fields_to_collect: list,
    chat_history: list
) -> dict:
    """
    Type 3: Handle employee chat message.
    Returns: { reply: str, collectedFields: list }
    """
    system_prompt = build_system_prompt(employee_data, company_name, agent_tone, fields_to_collect)

    # Build conversation history for Gemini
    history_text = ""
    for msg in chat_history[-8:]:  # last 8 messages
        role = "Employee" if msg["role"] == "user" else "Aria"
        history_text += f"{role}: {msg['content']}\n"

    full_prompt = f"""{system_prompt}

CONVERSATION SO FAR:
{history_text}
Employee: {message}

Aria:"""

    try:
        response = model.generate_content(full_prompt)
        raw_reply = response.text.strip()
        clean_reply, collected_fields = parse_collected_fields(raw_reply)
        return {
            "reply": clean_reply,
            "collectedFields": collected_fields
        }
    except Exception as e:
        return {
            "reply": f"I'm sorry, I'm having trouble right now. Please try again in a moment.",
            "collectedFields": []
        }
