import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

from google.generativeai import types
import google.generativeai as genai
import json
import re
import traceback
from app.core.config import settings

def generate_roadmap_json(topic: str, skill_level: str = "beginner", weak_topics: list = [], completed_topics: list = [], avg_score: float = 0.0):
    # Ensure genai is configured with v1 API for better model compatibility
    if not settings.GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY is missing in settings")
        return {"topic": topic, "description": "API Key Missing", "nodes": []}

    # Explicitly use v1 to avoid v1beta 404 errors seen in logs
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    # Safety settings to avoid false positive blocks for technical content
    safety_settings = {
        types.HarmCategory.HARM_CATEGORY_HARASSMENT: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_HATE_SPEECH: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: types.HarmBlockThreshold.BLOCK_NONE,
    }

    # List of models to try (using full path as required by some versions)
    available_models = [
        'models/gemini-2.0-flash',
        'models/gemini-2.5-flash',
        'models/gemini-flash-latest',
        'models/gemini-pro-latest',
        'gemini-2.0-flash'
    ]
    
    prompt = f"""
    Act as an elite Ivy League Computer Science Professor and Principal Software Engineer. 
    Design a rigorous, highly specific learning roadmap for the topic: "{topic}".
    
    USER LEARNING PROFILE:
    - Target Skill Level: {skill_level}
    - Weak Topics (Needs focus): {weak_topics if weak_topics else 'None'}
    - Completed Topics (Do not repeat): {completed_topics if completed_topics else 'None'}
    - Average Quiz Score: {avg_score if avg_score > 0 else 'N/A'}

    INSTRUCTIONS:
    1. Adjust the difficulty exactly to {skill_level}. If advanced, skip basics. If weak topics exist, address them.
    2. Be EXTREMELY concise. Zero filler words.
    3. Generate EXACTLY 4 unique node objects (representing 4 major phases).
    4. Provide EXACTLY 2 multiple-choice questions per node.
    
    Return ONLY a valid JSON object with the following exact structure:
    {{
      "topic": "{topic}",
      "description": "An elite, comprehensive masterclass to engineering mastery of {topic}.",
      "level": "{skill_level.capitalize()}",
      "nodes": [
        {{
          "id": "1",
          "label": "Phase 1: [Name]",
          "desc": "Overview in 2 sentences max.",
          "phase": "Foundations",
          "duration": "Estimated time",
          "milestones": ["Specific Primitive 1", "Specific Concept 2"],
          "projects": [{{"name": "Industry-Grade Lab", "difficulty": "Level"}}],
          "quiz": [
            {{
                "question": "Deep technical question?",
                "options": ["A", "B", "C", "D"],
                "correct_answer": "Exact string of the correct option",
                "explanation": "Why this is correct technically."
            }}
          ]
        }}
      ]
    }}
    """

    # Try different models to find one that works (resolve 404s)
    for model_name in available_models:
        try:
            print(f"Attempting generation with {model_name}...")
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config={
                    "temperature": 0.4,
                    "top_p": 0.9,
                    "max_output_tokens": 8192,
                }
            )
            
            # Try up to 2 times for each model if it's hit by temporary errors
            for attempt in range(2):
                try:
                    response = model.generate_content(prompt, safety_settings=safety_settings)
                    text = response.text.strip()
                    
                    # Standard cleaning of potential markdown blocks
                    if "```" in text:
                        text = re.sub(r'```(?:json)?\s*(.*?)\s*```', r'\1', text, flags=re.DOTALL).strip()
                    
                    text = text.lstrip('`').rstrip('`').strip()
                    if not text.startswith('{'):
                        start = text.find('{')
                        if start != -1: text = text[start:]
                    if not text.endswith('}'):
                        end = text.rfind('}')
                        if end != -1: text = text[:end+1]
                    
                    result = json.loads(text)
                    print(f"Success with {model_name}")
                    return result
                except Exception as e:
                    print(f"Attempt {attempt+1} with {model_name} failed: {e}")
                    
        except Exception as e:
            if "not found" in str(e).lower():
                print(f"Model {model_name} not available, trying next...")
                continue
            print(f"Error with {model_name}: {e}")

    # FALLBACK MUST BE REACHED if loop finishes or outer try fails
    print(f"Using fallback roadmap for {topic}")
    return {
        "topic": topic, 
        "description": "Due to AI model unavailablity, here is a general getting started guide.", 
        "level": skill_level.capitalize(), 
        "nodes": [
            {
                "id": "1",
                "label": f"Phase 1: Getting Started with {topic}",
                "desc": "A foundational introduction to the topic concepts and core principles.",
                "phase": "Foundations",
                "duration": "2 weeks",
                "milestones": ["Understand Basics", "Setup Environment"],
                "projects": [{"name": "Hello World Project", "difficulty": "Beginner"}],
                "quiz": []
            }
        ]
    }

def refine_roadmap_json(original_roadmap: dict, user_prompt: str):
    """Refines an existing roadmap JSON based on user instructions."""
    safety_settings = {
        types.HarmCategory.HARM_CATEGORY_HARASSMENT: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_HATE_SPEECH: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: types.HarmBlockThreshold.BLOCK_NONE,
        types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: types.HarmBlockThreshold.BLOCK_NONE,
    }

    model = genai.GenerativeModel(
        model_name='gemini-pro',
        generation_config={
            "temperature": 0.3, # Slightly higher for creative refinement
            "top_p": 0.8,
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
        self.model = genai.GenerativeModel('gemini-flash-latest')

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

