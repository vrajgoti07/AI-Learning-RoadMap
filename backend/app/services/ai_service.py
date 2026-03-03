from google.generativeai import types
import google.generativeai as genai
import json
import traceback
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

def generate_roadmap_json(topic):
    # Safety settings to avoid false positive blocks for technical content
    safety_settings = {
        types.HarmCategory.HARM_CATEGORY_HARASSMENT: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_HATE_SPEECH: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: types.HarmBlockThreshold.BLOCK_NONE,
    }

    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        generation_config={
            "temperature": 0.2, # Keep hallucination extremely low for high technical accuracy
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 8192,
        }
    )
    
    prompt = f"""
    Act as an elite Ivy League Computer Science Professor and Principal Software Engineer. 
    Design a rigorous, industry-grade, highly specific learning roadmap for the topic: "{topic}".
    Your goal is to take a learner from base prerequisites directly to elite, job-ready mastery, focusing heavily on modern, real-world applications and deep technical mental models.
    
    Return ONLY a valid JSON object with the following exact structure:
    {{
      "topic": "{topic}",
      "description": "An elite, comprehensive masterclass to engineering mastery of {topic}.",
      "level": "Choose one: Beginner, Intermediate, or Advanced based on the topic",
      "nodes": [
        {{
          "id": "1",
          "label": "Phase 1: [Specific Foundation Name, e.g., 'Core Virtual DOM Architecture']",
          "desc": "A 'Masterclass Overview' (3-5 sentences). Explain the deep 'why' behind this phase. What specific engineering problems does it solve? Name the exact algorithms, patterns, or advanced syntaxes they will master. NEVER use generic phrases like 'learn the basics'.",
          "phase": "Foundations",
          "duration": "Estimated time (e.g., 2 Weeks, 1 Month)",
          "milestones": ["Specific Primitive 1", "Specific Architecture Concept 2", "Vital Engineering Skill 3"],
          "projects": [{"name": "Industry-Grade Lab (e.g., Custom State Management Library)", "difficulty": "Beginner/Intermediate/Advanced"}]
        }}
      ]
    }}
    
    CRITICAL RULES:
    1. ZERO FLUFF. Do not use generic, unhelpful filler text. Every word must sound like it is coming from a Senior Staff Engineer teaching a junior.
    2. Give highly specific names to milestones and projects (e.g., 'Writing a Custom JWT Authenticator' instead of 'Auth Project').
    3. Return ONLY valid JSON. Absolutely no conversational filler text. Code formatting blocks (```json) are acceptable but nothing else.
    4. Generate between 5 and 7 unique node objects inside the "nodes" array list, depending on how deeply complex the topic is. Ensure a smooth, logical progression from theory to extreme mastery.
    """
    
    # Try 3 times to get a valid response
    try:
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = model.generate_content(prompt, safety_settings=safety_settings)
                text = response.text.strip()
                
                # Clean up potential markdown blocks
                if "```" in text:
                    if "```json" in text:
                        text = text.split("```json")[1].split("```")[0].strip()
                    else:
                        text = text.split("```")[1].split("```")[0].strip()
                
                return json.loads(text)
            except Exception as e:
                print(f"Attempt {attempt+1} failed for {topic}: {e}")
                if attempt == max_retries - 1:
                    print(f"Max retries reached for {topic}. Falling back.")
    except Exception as e:
        print(f"Error in generation loop for {topic}: {e}")
        
    # FALLBACK MUST BE REACHED if loop finishes or outer try fails
    print(f"Using fallback roadmap for {topic}")
    return {"topic": topic, "description": "Fallback", "level": "Beginner", "nodes": []}

def refine_roadmap_json(original_roadmap: dict, user_prompt: str):
    """Refines an existing roadmap JSON based on user instructions."""
    safety_settings = {
        types.HarmCategory.HARM_CATEGORY_HARASSMENT: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_HATE_SPEECH: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: types.HarmBlockThreshold.BLOCK_NONE,
    }

    model = genai.GenerativeModel(
        model_name='gemini-2.0-flash',
        generation_config={
            "temperature": 0.3, # Slightly higher for creative refinement
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 8192,
        }
    )
    
    prompt = f"""
    Act as an elite Ivy League Computer Science Professor and Principal Software Engineer. 
    You have previously designed a learning roadmap. Your student has now requested a change to the curriculum.
    
    CURRENT ROADMAP JSON:
    {json.dumps(original_roadmap)}
    
    STUDENT'S REQUEST:
    "{user_prompt}"
    
    Modify the JSON structure to satisfy the student's request while maintaining the elite, highly-technical quality of the remaining nodes.
    You may add, remove, or completely rewrite nodes and descriptions based on the prompt. If the topic shifts slightly, update the 'topic' field to reflect the new focus.
    
    Return ONLY a valid JSON object matching the original structure exactly:
    {{
      "topic": "The (possibly updated) topic",
      "description": "An elite, comprehensive masterclass...",
      "level": "Beginner, Intermediate, or Advanced",
      "nodes": [ ... ]
    }}
    
    CRITICAL RULES:
    1. Output strictly valid JSON.
    2. Maintain the extremely high-quality, professional, "zero fluff" engineering tone established previously.
    3. Ensure IDs remain clean strings starting from "1" and iterating upwards.
    """
    
    try:
        response = model.generate_content(prompt, safety_settings=safety_settings)
        text = response.text.strip()
        
        if "```" in text:
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            else:
                text = text.split("```")[1].split("```")[0].strip()
        
        return json.loads(text)
    except Exception as e:
        print(f"Error refining roadmap: {e}")
        # In case of catastrophic failure, return the exact original to prevent corruption
        return original_roadmap

class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    async def generate_email_reply(self, user_content: str) -> str:
        """
        Generates a professional and helpful email reply based on the user's message.
        """
        try:
            prompt = f"""
            You are 'PathFinder AI Support', a helpful and professional AI assistant for an AI-powered learning roadmap platform.
            A user has sent an email to our support team with the following content:
            
            ---
            {user_content}
            ---
            
            Please write a professional, concise, and helpful reply. 
            - Acknowledge their message.
            - Provide a relevant answer or guidance if they are asking a question.
            - If they are reporting a bug or requesting a feature, thank them and let them know the engineering team will review it.
            - Maintain a friendly and encouraging tone.
            - Sign off as 'The PathFinder AI Team'.
            - Do not include any placeholder brackets like [Name]. If you don't know the name, just use 'Hi there'.
            
            Write ONLY the body of the email.
            """
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"AI Email Reply Generation failed: {e}")
            return "Thank you for reaching out to PathFinder AI! We have received your message and our team will get back to you shortly."

ai_service = AIService()

