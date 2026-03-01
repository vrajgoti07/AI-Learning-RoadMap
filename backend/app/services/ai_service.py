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
        model_name='gemini-1.5-flash',
        generation_config={
            "temperature": 0.2,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 4096,
        }
    )
    
    prompt = f"""
    Create a professional, highly detailed 12-week learning roadmap for the topic: "{topic}".
    The goal is to take someone from absolute zero to job-ready mastery.
    
    Return ONLY a valid JSON object with this exact structure:
    {{
      "topic": "{topic}",
      "description": "A complete 12-week intensive guide to mastering {topic}.",
      "nodes": [
        {{
          "id": "1",
          "label": "Week 1-2: Foundations & Core Setup",
          "desc": "A deep dive into the absolute basics. Learn the syntax, environment setup, and fundamental concepts of {topic}.",
          "phase": "Phase 1: Foundations",
          "duration": "Duration (2 Weeks)",
          "milestones": ["Environment Setup", "Base Syntax", "Core Library A", "Variable Scoping"],
          "projects": [{{"name": "Initial Application Build", "difficulty": "Beginner"}}]
        }},
        ... (Generate 8 total nodes representing a full 12-week curriculum)
      ]
    }}
    
    Rules:
    - Each 'desc' must be educational and at least 3 sentences long.
    - Provide specific 'milestones' and at least one 'project' for every node.
    - Return ONLY valid JSON. No conversational text.
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
                    traceback.print_exc()
    except Exception as e:
        print(f"Error in generation loop for {topic}: {e}")
        traceback.print_exc()
        
    # FALLBACK MUST BE REACHED if loop finishes or outer try fails
    print(f"Using fallback roadmap for {topic}")
    return {
        "topic": topic,
        "description": "Custom detailed roadmap for " + topic,
        "nodes": [
            {"id": "1", "label": f"Phase 1: Introduction to {topic}", "desc": f"Master the prerequisites and core setup for {topic}. Understand the architecture and basic syntax.", "phase": "Foundations", "duration": "Week 1-2", "milestones": ["Environment Setup", "Variable Scoping", "Basic Data Types"], "projects": [{"name": "Starting Out", "difficulty": "Beginner"}]},
            {"id": "2", "label": "Phase 2: Fundamental Application", "desc": f"Learn how to apply {topic} to real-world scenarios. Focus on control flow and core libraries.", "phase": "Development", "duration": "Week 3-4", "milestones": ["Logic Implementation", "Working with Collections"], "projects": [{"name": "Mini Project: Console Utility", "difficulty": "Intermediate"}]},
            {"id": "3", "label": "Phase 3: Advanced Optimization", "desc": "Optimize your workflows and learn deep patterns.", "phase": "Advanced", "duration": "Week 5-8", "milestones": ["Error Handling", "Async Operations"], "projects": [{"name": "Complex System", "difficulty": "Advanced"}]},
            {"id": "4", "label": "Phase 4: Mastery & Capstone", "desc": "Final polishing and high-scale implementation.", "phase": "Mastery", "duration": "Week 9-12", "milestones": ["Deployment", "Performance Tuning"], "projects": [{"name": "Final Professional Portfolio", "difficulty": "Expert"}]}
        ]
    }
