import ipaddress
import logging
import os
import socket
from typing import Dict, List, Optional, Any
from urllib.parse import urlparse

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

# --- Configuration and Logging ---

APP_NAME = os.getenv("APP_NAME", "MCP AI Guides Server")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
LOG_LEVEL = os.getenv("LOG_LEVEL", "info").upper()

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# --- Data Source (Hardcoded for demonstration) ---

AI_GUIDES_DATA: List[Dict[str, str | List[str]]] = [
    {
        "title": "OpenAI: GPT Best Practices",
        "publisher": "OpenAI",
        "description": "Comprehensive guide on best practices for prompting and using GPT models effectively.",
        "topics": ["prompt engineering", "LLM usage", "AI best practices"],
        "download_url": "https://example.com/openai-gpt-best-practices.pdf"
    },
    {
        "title": "Google: Introduction to Generative AI",
        "publisher": "Google",
        "description": "An introductory course to generative AI concepts and applications.",
        "topics": ["generative AI", "AI fundamentals", "machine learning"],
        "download_url": "https://example.com/google-intro-gen-ai.pdf"
    },
    {
        "title": "Anthropic: Constitutional AI",
        "publisher": "Anthropic",
        "description": "Exploration of Constitutional AI for building safe and helpful AI systems.",
        "topics": ["AI safety", "AI ethics", "constitutional AI"],
        "download_url": "https://example.com/anthropic-constitutional-ai.pdf"
    },
    {
        "title": "OpenAI: AI Agent Construction Guidelines",
        "publisher": "OpenAI",
        "description": "A detailed guide on constructing robust and intelligent AI agents.",
        "topics": ["AI agents", "agent architecture", "AI development"],
        "download_url": "https://example.com/openai-ai-agents.pdf"
    },
    {
        "title": "Google: Enterprise AI Deployment Strategies",
        "publisher": "Google",
        "description": "Strategies and best practices for deploying AI solutions at enterprise scale.",
        "topics": ["enterprise AI", "AI deployment", "MLOps"],
        "download_url": "https://example.com/google-enterprise-ai.pdf"
    }
]

# --- Request/Response Models ---

class GuideComparisonRequest(BaseModel):
    guide_titles: List[str]

class GeminiSearchRequest(BaseModel):
    query: str
    use_grounding: bool = True

# --- FastAPI Application Instance ---

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="A centralized repository and search interface for a curated collection of free AI-related guides from OpenAI, Google, and Anthropic. Enhanced with Gemini AI for intelligent search and analysis."
)

# --- Helper Functions ---

def _find_guide_by_title(title: str) -> Optional[Dict[str, str | List[str]]]:
    """Finds an AI guide by its exact title (case-insensitive for comparison)."""
    for guide in AI_GUIDES_DATA:
        if guide["title"].lower() == title.lower():
            return guide
    return None


def _validate_external_url(raw_url: str) -> str:
    """Validate that the supplied URL targets an external HTTP(S) endpoint."""
    try:
        parsed = urlparse(raw_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="URL is malformed") from exc

    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(status_code=400, detail="Only http/https URLs are allowed")

    if not parsed.netloc:
        raise HTTPException(status_code=400, detail="URL netloc is missing")

    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="Hostname could not be determined")

    if hostname.endswith((".local", ".lan")):
        raise HTTPException(status_code=400, detail="Local network hostnames are not allowed")

    if parsed.port and parsed.port not in {80, 443}:
        raise HTTPException(status_code=400, detail="Only ports 80 and 443 are permitted")

    try:
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        raise HTTPException(status_code=400, detail="Hostname could not be resolved") from exc

    for family, _, _, _, sockaddr in addr_info:
        ip_str = sockaddr[0]
        try:
            ip_obj = ipaddress.ip_address(ip_str)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid IP address for hostname")

        if any([
            ip_obj.is_private,
            ip_obj.is_loopback,
            ip_obj.is_link_local,
            ip_obj.is_reserved,
            ip_obj.is_multicast,
            ip_obj.is_unspecified,
        ]):
            raise HTTPException(status_code=400, detail="URL resolves to a disallowed address range")

    return parsed.geturl()

# --- API Endpoints ---

@app.get("/health", summary="Health Check", response_model=Dict[str, str])
async def health_check() -> Dict[str, str]:
    """Returns a simple status to indicate the server is running."""
    logger.info("Health check requested.")
    return {"status": "ok", "service": APP_NAME, "version": APP_VERSION}


@app.get(
    "/guides",
    response_model=List[Dict[str, str | List[str]]],
    summary="List all AI guides"
)
async def list_ai_guides() -> List[Dict[str, str | List[str]]]:
    """Lists all available AI guides with their titles, publishers, descriptions, and topics.

    Returns:
        A list of dictionaries, each representing an AI guide's metadata.
    """
    logger.info("Listing all AI guides.")
    return AI_GUIDES_DATA


@app.get(
    "/guides/search",
    response_model=List[Dict[str, str | List[str]]],
    summary="Search for AI guides"
)
async def search_ai_guides(query: str) -> List[Dict[str, str | List[str]]]:
    """Searches for AI guides based on keywords or topics in their title or description.

    Args:
        query: The keyword or topic to search for.

    Returns:
        A list of dictionaries for matching AI guides.
    """
    logger.info(f"Searching AI guides with query: '{query}'.")
    query_lower = query.lower()
    results = []
    for guide in AI_GUIDES_DATA:
        title_match = query_lower in guide["title"].lower()
        desc_match = query_lower in guide["description"].lower()
        topics_match = any(query_lower in topic.lower() for topic in guide.get("topics", []))

        if title_match or desc_match or topics_match:
            results.append(guide)
    return results


@app.get(
    "/guides/{title}",
    response_model=Dict[str, str | List[str]],
    summary="Get details of a specific AI guide"
)
async def get_ai_guide_details(title: str) -> Dict[str, str | List[str]]:
    """Retrieves the full details of a specific AI guide by its exact title.

    Args:
        title: The exact title of the AI guide.

    Returns:
        A dictionary containing the full details of the AI guide.

    Raises:
        HTTPException: If the AI guide is not found (status code 404).
    """
    logger.info(f"Fetching details for AI guide: '{title}'.")
    guide = _find_guide_by_title(title)
    if guide is None:
        logger.warning(f"AI guide not found: '{title}'.")
        raise HTTPException(status_code=404, detail="AI guide not found")
    return guide


@app.get(
    "/guides/{title}/download-url",
    response_model=Dict[str, str],
    summary="Get download URL for a specific AI guide"
)
async def get_ai_guide_download_url(title: str) -> Dict[str, str]:
    """Provides the direct download URL for a specific AI guide by its title.

    Args:
        title: The exact title of the AI guide.

    Returns:
        A dictionary containing the download URL.

    Raises:
        HTTPException: If the AI guide is not found (status code 404).
    """
    logger.info(f"Fetching download URL for AI guide: '{title}'.")
    guide = _find_guide_by_title(title)
    if guide is None:
        logger.warning(f"AI guide not found for download URL: '{title}'.")
        raise HTTPException(status_code=404, detail="AI guide not found")
    
    # The type hint `str | List[str]` on AI_GUIDES_DATA forces a check here
    download_url_value = guide.get("download_url")
    if isinstance(download_url_value, str):
        return {"download_url": download_url_value}
    else:
        logger.error(f"Download URL for '{title}' is not a string: {download_url_value}")
        raise HTTPException(status_code=500, detail="Download URL not available or malformed")


# --- Gemini-Enhanced Endpoints ---

@app.post(
    "/guides/search/gemini",
    response_model=Dict[str, Any],
    summary="Search guides using Gemini AI with grounding"
)
async def search_guides_with_gemini(request: GeminiSearchRequest) -> Dict[str, Any]:
    """Uses Gemini AI's grounding capabilities for intelligent semantic search across guides.
    
    Args:
        request: Search request with query and grounding option
        
    Returns:
        Search results with relevance scores and reasoning
    """
    try:
        from gemini_service import get_gemini_service
        gemini = get_gemini_service()
        
        logger.info(f"Gemini search requested: '{request.query}' (grounding: {request.use_grounding})")
        
        if request.use_grounding:
            result = await gemini.search_with_grounding(request.query, AI_GUIDES_DATA)
        else:
            # Fallback to regular search if grounding not requested
            guides = await search_ai_guides(request.query)
            result = {
                "success": True,
                "grounded_search": False,
                "results": {
                    "matched_guides": [g["title"] for g in guides],
                    "search_reasoning": "Standard keyword-based search"
                }
            }
        
        return result
        
    except Exception as e:
        logger.error(f"Gemini search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gemini search failed: {str(e)}")


@app.get(
    "/guides/{title}/analyze",
    response_model=Dict[str, Any],
    summary="Analyze guide content using Gemini AI"
)
async def analyze_guide_with_gemini(title: str) -> Dict[str, Any]:
    """Analyzes a guide's content using Gemini AI to extract insights and summaries.
    
    Args:
        title: The exact title of the AI guide
        
    Returns:
        Enhanced analysis including summary, learning objectives, and recommendations
    """
    try:
        guide = _find_guide_by_title(title)
        if guide is None:
            raise HTTPException(status_code=404, detail="AI guide not found")
        
        from gemini_service import get_gemini_service
        gemini = get_gemini_service()
        
        logger.info(f"Analyzing guide with Gemini: '{title}'")
        result = await gemini.generate_guide_summary(guide)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Gemini analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gemini analysis failed: {str(e)}")


@app.post(
    "/guides/analyze-url",
    response_model=Dict[str, Any],
    summary="Analyze guide content from URL using Gemini AI"
)
async def analyze_url_with_gemini(url: str = Query(..., description="URL of the guide to analyze")) -> Dict[str, Any]:
    """Fetches and analyzes content from a guide URL using Gemini AI.
    
    Args:
        url: URL of the guide to analyze
        
    Returns:
        Content analysis including topics, takeaways, and recommendations
    """
    try:
        safe_url = _validate_external_url(url)
        from gemini_service import get_gemini_service
        gemini = get_gemini_service()
        
        logger.info(f"Analyzing URL with Gemini: '{safe_url}'")
        result = await gemini.analyze_guide_url(safe_url)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"URL analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"URL analysis failed: {str(e)}")


@app.post(
    "/guides/compare",
    response_model=Dict[str, Any],
    summary="Compare multiple guides using Gemini AI"
)
async def compare_guides_with_gemini(request: GuideComparisonRequest) -> Dict[str, Any]:
    """Compares multiple AI guides to identify differences, overlaps, and recommendations.
    
    Args:
        request: List of guide titles to compare
        
    Returns:
        Comprehensive comparison including differences, overlaps, and reading order
    """
    try:
        if len(request.guide_titles) < 2:
            raise HTTPException(status_code=400, detail="At least 2 guides required for comparison")
        
        if len(request.guide_titles) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 guides can be compared at once")
        
        from gemini_service import get_gemini_service
        gemini = get_gemini_service()
        
        logger.info(f"Comparing {len(request.guide_titles)} guides with Gemini")
        result = await gemini.compare_guides(request.guide_titles, AI_GUIDES_DATA)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Guide comparison error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Guide comparison failed: {str(e)}")
