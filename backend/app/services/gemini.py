"""
Gemini AI Service Module.
Handles configuration and interaction with Google's Generative AI models.
"""
import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()

# Initialize here for actual deployment, mocked in tests
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "DUMMY"))
model = genai.GenerativeModel('gemini-3-flash-preview')

async def generate_election_guidance(query: str, context: Dict[str, Any]) -> str:
    """
    Generate election guidance based on user query and context using Gemini.
    
    Args:
        query (str): The user's input query.
        context (Dict[str, Any]): A dictionary containing user context like age, state, and status.
        
    Returns:
        str: The AI-generated guidance string.
    """
    # Security/Validation pre-check to prevent prompt injection
    if "ignore previous instructions" in query.lower():
        return "I am an Election Assistant. I cannot comply with that request."
        
    system_prompt = f"""
    You are 'Election Assistant Pro', an expert guide for Indian elections.
    User Context: Age {context.get('age')}, State {context.get('state')}, Status: {context.get('status')}.
    
    CRITICAL RULES:
    1. Base all advice strictly on official Election Commission of India (ECI) guidelines.
    2. Give step-by-step actionable advice using clear formatting (bullet points, bold text).
    3. Do NOT hallucinate dates, deadlines, or forms. If you don't know the exact current deadline, state: "Please verify the exact deadline on the official ECI portal."
    4. Refuse non-election queries gracefully but firmly: "I am specifically designed to assist with election-related queries in India. I cannot help with that."
    5. Be encouraging and promote democratic participation.
    6. ALWAYS respond in the user's preferred language: {context.get('language', 'English')}.
    """
    
    prompt = f"{system_prompt}\n\nUser Query: {query}\nResponse:"
    
    try:
        if os.getenv("GEMINI_API_KEY", "DUMMY") == "DUMMY":
            # Provide a smart mock response if no API key is configured
            return f"Mock AI Response: Yes, as an {context.get('age', 'unknown')} year old from {context.get('state', 'your state')}, you are eligible to vote. Please fill out Form 6 on the NVSP portal."
            
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return f"AI Connection Error: {str(e)}. (Please ensure GEMINI_API_KEY is set in your .env file)"
