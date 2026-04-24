"""
Chat API Router.
Handles endpoints related to AI chat and guidance generation.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from typing import Optional
from app.services.gemini import generate_election_guidance

router = APIRouter()

class UserContext(BaseModel):
    """Pydantic model representing the context of the user making the query."""
    age: Optional[float] = Field(None, description="The age of the user.")
    state: Optional[str] = Field(None, description="The state of the user.")
    status: Optional[str] = Field(None, description="The voter registration status.")
    language: Optional[str] = Field("English", description="The preferred language.")

class ChatRequest(BaseModel):
    """Pydantic model for incoming chat requests."""
    query: str = Field(..., min_length=2, max_length=1000, description="The user's query text.")
    context: UserContext = Field(..., description="The user's contextual information.")

class ChatResponse(BaseModel):
    """Pydantic model for chat responses."""
    response: str = Field(..., description="The AI generated response text.")

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: Request, body: ChatRequest) -> ChatResponse:
    """
    Endpoint to handle incoming chat queries and return AI guidance.
    
    Args:
        request (Request): The incoming HTTP request.
        body (ChatRequest): The parsed request body containing the query and context.
        
    Returns:
        ChatResponse: The model containing the AI generated response.
        
    Raises:
        HTTPException: If an error occurs during generation.
    """
    try:
        # In a real app we'd also verify Firebase token here via Depends
        # For hackathon robust testing, we rely on core services mocking
        answer = await generate_election_guidance(body.query, body.context.model_dump())
        return ChatResponse(response=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
