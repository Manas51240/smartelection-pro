"""
Main application module for the Election Assistant API.
Initializes the FastAPI application, middleware, rate limiting, and routers.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Dict, Any

from app.api import chat

# Initialize rate limiter using client IP address
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Election Assistant API", 
    version="2.0",
    description="Backend API for the Election Assistant Pro application."
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include application routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

from functools import lru_cache

@app.get("/health", response_model=Dict[str, str])
@limiter.limit("10/minute")
@lru_cache(maxsize=1)
def health_check(request: Request) -> Dict[str, str]:
    """
    Health check endpoint to verify API status.
    
    Args:
        request (Request): The incoming HTTP request.
        
    Returns:
        Dict[str, str]: A dictionary indicating the API status.
    """
    return {"status": "ok"}
