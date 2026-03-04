import json
import google.generativeai as genai
from pydantic import BaseModel
from app.core.config import settings

# Initialize Gemini specifically for the predictive engine
genai.configure(api_key=settings.GEMINI_API_KEY)

# Use Flash for speed, Pro for complex reasoning if preferred. Using Flash here for real-time recommendations.
model = genai.GenerativeModel("gemini-flash-latest")

class PredictResponse(BaseModel):
    skill_gaps: list[str]
    recommended_topics: list[str]
    reasoning: str

def generate_predictions(skill_profile: dict, weak_topics: list, current_level: int) -> dict:
    """
    Analyzes the user's current progress and predicts next best topics and skill gaps.
    """
    prompt = f"""
    You are an expert AI Career Coach and Learning Predictor.
    Analyze the following user profile and predict their skill gaps and recommend the exact next topics they should learn.

    USER PROFILE:
    - Current Level: {current_level}
    - Skill Profile (Mastered): {json.dumps(skill_profile)}
    - Identified Weak Topics: {json.dumps(weak_topics)}

    Provide exactly 3 predicted skill gaps the user implicitly has based on their current profile.
    Provide exactly 3 recommended hyper-specific topics they should learn next to advance their career.
    Provide a 2-sentence encouraging reasoning.

    Return the response STRICTLY as a valid JSON object matching this schema. NO markdown formatting, just raw JSON:
    {{
        "skill_gaps": ["gap1", "gap2", "gap3"],
        "recommended_topics": ["topic1", "topic2", "topic3"],
        "reasoning": "string"
    }}
    """
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up any potential markdown formatting
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"Prediction Engine Error: {e}")
        return {
            "skill_gaps": ["Advanced System Design", "Production Deployments", "Security Architecture"],
            "recommended_topics": ["Docker & Kubernetes", "CI/CD Pipelines", "Cloud Native Apps"],
            "reasoning": "Based on your current trajectory, focusing on deployment and architecture will round out your skillset."
        }
