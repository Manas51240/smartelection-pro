from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from app.services.gemini import generate_election_guidance

router = APIRouter()

class UserContext(BaseModel):
    age: float | None = None
    state: str | None = None
    status: str | None = None
    language: str | None = "English"

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000)
    context: UserContext

class ChatResponse(BaseModel):
    response: str

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: Request, body: ChatRequest):
    try:
        # In a real app we'd also verify Firebase token here via Depends
        # For hackathon robust testing, we rely on core services mocking
        answer = await generate_election_guidance(body.query, body.context.dict())
        return ChatResponse(response=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
