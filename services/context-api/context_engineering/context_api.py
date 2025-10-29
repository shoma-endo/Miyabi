import asyncio
import json
import logging
import os
import time
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import (
    Depends,
    FastAPI,
    Header,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from starlette.status import (
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_429_TOO_MANY_REQUESTS,
)

from context_models import (
    ContextWindow, ContextElement, ContextType, ContextSession,
    PromptTemplate, PromptTemplateType, MultimodalContext, RAGContext
)
from context_analyzer import ContextAnalyzer, MultimodalAnalyzer, RAGAnalyzer
from template_manager import TemplateManager, ContextTemplateIntegrator
from context_optimizer import ContextOptimizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_KEY_HEADER = "X-API-Key"
RATE_LIMIT_MAX_REQUESTS = int(os.getenv("CONTEXT_API_RATE_LIMIT", "120"))
RATE_LIMIT_WINDOW_SECONDS = 60
MAX_CONTEXT_TEXT_LENGTH = int(os.getenv("CONTEXT_MAX_TEXT", "6000"))
MAX_MULTIMODAL_ITEMS = int(os.getenv("CONTEXT_MAX_MODAL_ITEMS", "10"))


class RateLimiter:
    """Simple per-key sliding window rate limiter."""

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._records: Dict[str, deque[float]] = {}
        self._lock = asyncio.Lock()

    async def allow(self, key: str) -> bool:
        now = time.monotonic()
        async with self._lock:
            bucket = self._records.setdefault(key, deque())
            while bucket and now - bucket[0] > self.window_seconds:
                bucket.popleft()
            if len(bucket) >= self.max_requests:
                return False
            bucket.append(now)
            return True


def _load_api_keys() -> set[str]:
    raw = os.getenv("CONTEXT_API_KEYS", "")
    keys = {entry.strip() for entry in raw.split(",") if entry.strip()}
    return keys


API_KEYS = _load_api_keys()
rate_limiter = RateLimiter(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS)

# リクエスト・レスポンスモデル
class ContextElementRequest(BaseModel):
    content: str
    type: str = "user"
    role: Optional[str] = None
    metadata: Dict[str, Any] = {}
    tags: List[str] = []
    priority: int = 5

class ContextWindowRequest(BaseModel):
    max_tokens: int = 8192
    reserved_tokens: int = 512

class TemplateRequest(BaseModel):
    name: str
    description: str
    template: str
    type: str = "completion"
    category: str = "general"
    tags: List[str] = []

class TemplateRenderRequest(BaseModel):
    template_id: str
    variables: Dict[str, Any]

class OptimizationRequest(BaseModel):
    goals: List[str]
    constraints: Dict[str, Any] = {}

class MultimodalContextRequest(BaseModel):
    text_content: str = ""
    image_urls: List[str] = []
    audio_urls: List[str] = []
    video_urls: List[str] = []
    document_urls: List[str] = []
    metadata: Dict[str, Any] = {}

class RAGRequest(BaseModel):
    query: str
    documents: List[Dict[str, Any]] = []
    max_tokens: int = 2000

# WebSocket管理
class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn)

# グローバル変数
sessions_storage: Dict[str, ContextSession] = {}
websocket_manager = WebSocketManager()


async def _authenticate_api_key(raw_key: Optional[str]) -> str:
    if not API_KEYS:
        logger.error("CONTEXT_API_KEYS environment variable is not configured")
        raise HTTPException(status_code=500, detail="API keys are not configured")

    if not raw_key:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=f"Missing {API_KEY_HEADER} header",
        )

    if raw_key not in API_KEYS:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="Invalid API key",
        )

    if not await rate_limiter.allow(raw_key):
        raise HTTPException(
            status_code=HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
        )

    return raw_key


async def enforce_security(x_api_key: Optional[str] = Header(default=None)) -> str:
    """FastAPI dependency to enforce API key auth and rate limiting."""

    return await _authenticate_api_key(x_api_key)


def _ensure_reasonable_length(value: str, limit: int, field_name: str) -> None:
    if len(value) > limit:
        raise HTTPException(
            status_code=413,
            detail=f"{field_name} exceeds maximum length of {limit} characters",
        )


def _ensure_list_size(items: List[Any], limit: int, field_name: str) -> None:
    if len(items) > limit:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} contains too many items (max {limit})",
        )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # アプリケーション起動時
    logger.info("Context Engineering API Server starting...")
    await initialize_components()
    yield
    # アプリケーション終了時
    logger.info("Context Engineering API Server shutting down...")

app = FastAPI(
    title="Context Engineering API",
    description="Complete Context Engineering system with AI-powered analysis, optimization, and template management",
    version="2.0.0",
    lifespan=lifespan
)

# コンポーネント初期化
async def initialize_components():
    global context_analyzer, template_manager, context_optimizer
    global multimodal_analyzer, rag_analyzer, template_integrator
    
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY environment variable is required")
    
    context_analyzer = ContextAnalyzer(gemini_api_key)
    template_manager = TemplateManager(gemini_api_key)
    context_optimizer = ContextOptimizer(gemini_api_key)
    multimodal_analyzer = MultimodalAnalyzer(gemini_api_key)
    rag_analyzer = RAGAnalyzer(gemini_api_key)
    template_integrator = ContextTemplateIntegrator(template_manager)

# ダッシュボード
@app.get("/", response_class=HTMLResponse, dependencies=[Depends(enforce_security)])
async def dashboard():
    """Context Engineering ダッシュボード"""
    return HTMLResponse(content="""
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Context Engineering Platform</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .header { text-align: center; margin-bottom: 40px; }
            .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .feature { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .feature h3 { color: #333; margin-top: 0; }
            .endpoint { background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0; font-family: monospace; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🧠 Context Engineering Platform</h1>
            <p>Complete AI-powered context management and optimization system</p>
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>📝 Context Management</h3>
                <p>Create, analyze, and optimize context windows</p>
                <div class="endpoint">POST /api/sessions</div>
                <div class="endpoint">GET /api/sessions/{session_id}</div>
                <div class="endpoint">POST /api/contexts/{window_id}/elements</div>
            </div>
            
            <div class="feature">
                <h3>🔍 Analysis Engine</h3>
                <p>Comprehensive context analysis with AI insights</p>
                <div class="endpoint">POST /api/contexts/{window_id}/analyze</div>
                <div class="endpoint">GET /api/analysis/{analysis_id}</div>
            </div>
            
            <div class="feature">
                <h3>📋 Template Management</h3>
                <p>Create, manage, and optimize prompt templates</p>
                <div class="endpoint">POST /api/templates</div>
                <div class="endpoint">POST /api/templates/generate</div>
                <div class="endpoint">POST /api/templates/{template_id}/render</div>
            </div>
            
            <div class="feature">
                <h3>⚡ Optimization Engine</h3>
                <p>AI-powered context optimization</p>
                <div class="endpoint">POST /api/contexts/{window_id}/optimize</div>
                <div class="endpoint">GET /api/optimization/{task_id}</div>
            </div>
            
            <div class="feature">
                <h3>🎨 Multimodal Support</h3>
                <p>Handle text, images, audio, video, documents</p>
                <div class="endpoint">POST /api/multimodal</div>
                <div class="endpoint">POST /api/multimodal/{context_id}/analyze</div>
            </div>
            
            <div class="feature">
                <h3>🔗 RAG Integration</h3>
                <p>Retrieval-Augmented Generation context management</p>
                <div class="endpoint">POST /api/rag</div>
                <div class="endpoint">POST /api/rag/{context_id}/analyze</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
            <p><a href="/docs">📚 API Documentation</a> | <a href="/ws">🔌 WebSocket Test</a></p>
        </div>
    </body>
    </html>
    """)

# セッション管理
@app.post("/api/sessions", dependencies=[Depends(enforce_security)])
async def create_session(name: str = "New Session", description: str = "") -> Dict[str, Any]:
    """新しいコンテキストセッションを作成"""
    _ensure_reasonable_length(name, 256, "Session name")
    _ensure_reasonable_length(description, MAX_CONTEXT_TEXT_LENGTH, "Session description")
    session = ContextSession(name=name, description=description)
    sessions_storage[session.id] = session
    
    await websocket_manager.broadcast({
        "type": "session_created",
        "session_id": session.id,
        "name": session.name
    })
    
    return {
        "session_id": session.id,
        "name": session.name,
        "description": session.description,
        "created_at": session.created_at.isoformat()
    }

@app.get("/api/sessions", dependencies=[Depends(enforce_security)])
async def list_sessions() -> Dict[str, Any]:
    """セッション一覧を取得"""
    sessions = []
    for session in sessions_storage.values():
        sessions.append({
            "id": session.id,
            "name": session.name,
            "description": session.description,
            "windows_count": len(session.windows),
            "created_at": session.created_at.isoformat(),
            "last_accessed": session.last_accessed.isoformat()
        })
    
    return {"sessions": sessions}

@app.get("/api/sessions/{session_id}", dependencies=[Depends(enforce_security)])
async def get_session(session_id: str) -> Dict[str, Any]:
    """特定のセッションを取得"""
    if session_id not in sessions_storage:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions_storage[session_id]
    session.last_accessed = datetime.now()
    
    return {
        "id": session.id,
        "name": session.name,
        "description": session.description,
        "windows": [
            {
                "id": window.id,
                "elements_count": len(window.elements),
                "current_tokens": window.current_tokens,
                "utilization_ratio": window.utilization_ratio,
                "created_at": window.created_at.isoformat()
            }
            for window in session.windows
        ],
        "active_window_id": session.active_window_id,
        "created_at": session.created_at.isoformat(),
        "last_accessed": session.last_accessed.isoformat()
    }

# コンテキストウィンドウ管理
@app.post(
    "/api/sessions/{session_id}/windows",
    dependencies=[Depends(enforce_security)],
)
async def create_context_window(session_id: str, request: ContextWindowRequest) -> Dict[str, Any]:
    """新しいコンテキストウィンドウを作成"""
    if session_id not in sessions_storage:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions_storage[session_id]
    window = session.create_window(request.max_tokens)
    window.reserved_tokens = request.reserved_tokens
    
    await websocket_manager.broadcast({
        "type": "window_created",
        "session_id": session_id,
        "window_id": window.id
    })
    
    return {
        "window_id": window.id,
        "max_tokens": window.max_tokens,
        "reserved_tokens": window.reserved_tokens,
        "created_at": window.created_at.isoformat()
    }

# コンテキスト要素管理
@app.post(
    "/api/contexts/{window_id}/elements",
    dependencies=[Depends(enforce_security)],
)
async def add_context_element(window_id: str, request: ContextElementRequest) -> Dict[str, Any]:
    """コンテキスト要素を追加"""
    window = find_window_by_id(window_id)
    if not window:
        raise HTTPException(status_code=404, detail="Context window not found")

    _ensure_reasonable_length(request.content, MAX_CONTEXT_TEXT_LENGTH, "Context element content")

    element = ContextElement(
        content=request.content,
        type=ContextType(request.type),
        role=request.role,
        metadata=request.metadata,
        tags=request.tags,
        priority=request.priority
    )
    
    if not window.add_element(element):
        raise HTTPException(status_code=400, detail="Cannot add element: token limit exceeded")
    
    await websocket_manager.broadcast({
        "type": "element_added",
        "window_id": window_id,
        "element_id": element.id,
        "current_tokens": window.current_tokens
    })
    
    return {
        "element_id": element.id,
        "current_tokens": window.current_tokens,
        "utilization_ratio": window.utilization_ratio
    }

@app.get(
    "/api/contexts/{window_id}",
    dependencies=[Depends(enforce_security)],
)
async def get_context_window(window_id: str) -> Dict[str, Any]:
    """コンテキストウィンドウを取得"""
    window = find_window_by_id(window_id)
    if not window:
        raise HTTPException(status_code=404, detail="Context window not found")
    
    return {
        "id": window.id,
        "max_tokens": window.max_tokens,
        "current_tokens": window.current_tokens,
        "available_tokens": window.available_tokens,
        "utilization_ratio": window.utilization_ratio,
        "reserved_tokens": window.reserved_tokens,
        "elements": [element.to_dict() for element in window.elements],
        "quality_metrics": window.quality_metrics,
        "created_at": window.created_at.isoformat()
    }

# コンテキスト分析
@app.post(
    "/api/contexts/{window_id}/analyze",
    dependencies=[Depends(enforce_security)],
)
async def analyze_context(window_id: str) -> Dict[str, Any]:
    """コンテキスト分析を実行"""
    window = find_window_by_id(window_id)
    if not window:
        raise HTTPException(status_code=404, detail="Context window not found")
    
    try:
        analysis = await context_analyzer.analyze_context_window(window)
        
        await websocket_manager.broadcast({
            "type": "analysis_completed",
            "window_id": window_id,
            "quality_score": analysis.quality_score
        })
        
        return analysis.to_dict()
        
    except Exception as e:
        logger.error(f"Context analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# テンプレート管理
@app.post("/api/templates", dependencies=[Depends(enforce_security)])
async def create_template(request: TemplateRequest) -> Dict[str, Any]:
    """新しいテンプレートを作成"""
    _ensure_reasonable_length(request.name, 256, "Template name")
    _ensure_reasonable_length(request.description, MAX_CONTEXT_TEXT_LENGTH, "Template description")
    _ensure_reasonable_length(request.template, MAX_CONTEXT_TEXT_LENGTH, "Template body")
    try:
        template = PromptTemplate(
            name=request.name,
            description=request.description,
            template=request.template,
            type=PromptTemplateType(request.type),
            category=request.category,
            tags=request.tags
        )
        
        template_id = template_manager.create_template(template)
        
        return {
            "template_id": template_id,
            "name": template.name,
            "variables": template.variables
        }
        
    except Exception as e:
        logger.error(f"Template creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/templates", dependencies=[Depends(enforce_security)])
async def list_templates(category: Optional[str] = None, tags: Optional[str] = None) -> Dict[str, Any]:
    """テンプレート一覧を取得"""
    tag_list = tags.split(",") if tags else None
    templates = template_manager.list_templates(category, tag_list)
    
    return {
        "templates": [
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "type": t.type.value,
                "category": t.category,
                "tags": t.tags,
                "usage_count": t.usage_count,
                "quality_score": t.quality_score,
                "variables": t.variables
            }
            for t in templates
        ]
    }

@app.post(
    "/api/templates/{template_id}/render",
    dependencies=[Depends(enforce_security)],
)
async def render_template(template_id: str, request: TemplateRenderRequest) -> Dict[str, Any]:
    """テンプレートをレンダリング"""
    try:
        rendered = template_manager.render_template(template_id, request.variables)
        if not rendered:
            raise HTTPException(status_code=404, detail="Template not found")
        
        return {"rendered_content": rendered}
        
    except Exception as e:
        logger.error(f"Template rendering failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/templates/generate", dependencies=[Depends(enforce_security)])
async def generate_template(purpose: str, examples: List[str] = [], constraints: List[str] = []) -> Dict[str, Any]:
    """AIでテンプレートを自動生成"""
    _ensure_reasonable_length(purpose, MAX_CONTEXT_TEXT_LENGTH, "purpose")
    _ensure_list_size(examples, MAX_MULTIMODAL_ITEMS, "examples")
    _ensure_list_size(constraints, MAX_MULTIMODAL_ITEMS, "constraints")
    try:
        template = await template_manager.generate_template(purpose, examples, constraints)
        
        return {
            "template_id": template.id,
            "name": template.name,
            "template": template.template,
            "variables": template.variables
        }
        
    except Exception as e:
        logger.error(f"Template generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# コンテキスト最適化
@app.post(
    "/api/contexts/{window_id}/optimize",
    dependencies=[Depends(enforce_security)],
)
async def optimize_context(window_id: str, request: OptimizationRequest) -> Dict[str, Any]:
    """コンテキスト最適化を実行"""
    window = find_window_by_id(window_id)
    if not window:
        raise HTTPException(status_code=404, detail="Context window not found")
    
    try:
        task = await context_optimizer.optimize_context_window(
            window, request.goals, request.constraints
        )
        
        await websocket_manager.broadcast({
            "type": "optimization_started",
            "window_id": window_id,
            "task_id": task.id
        })
        
        return {
            "task_id": task.id,
            "status": task.status.value,
            "goals": request.goals
        }
        
    except Exception as e:
        logger.error(f"Context optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post(
    "/api/contexts/{window_id}/auto-optimize",
    dependencies=[Depends(enforce_security)],
)
async def auto_optimize_context(window_id: str) -> Dict[str, Any]:
    """コンテキストの自動最適化"""
    window = find_window_by_id(window_id)
    if not window:
        raise HTTPException(status_code=404, detail="Context window not found")
    
    try:
        result = await context_optimizer.auto_optimize_context(window)
        
        await websocket_manager.broadcast({
            "type": "auto_optimization_started",
            "window_id": window_id,
            "task_id": result["task_id"]
        })
        
        return result
        
    except Exception as e:
        logger.error(f"Auto optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get(
    "/api/optimization/{task_id}",
    dependencies=[Depends(enforce_security)],
)
async def get_optimization_task(task_id: str) -> Dict[str, Any]:
    """最適化タスクの状態を取得"""
    task = context_optimizer.get_optimization_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Optimization task not found")
    
    return {
        "id": task.id,
        "context_id": task.context_id,
        "optimization_type": task.optimization_type,
        "status": task.status.value,
        "progress": task.progress,
        "result": task.result,
        "error_message": task.error_message,
        "created_at": task.created_at.isoformat(),
        "started_at": task.started_at.isoformat() if task.started_at else None,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None
    }

# マルチモーダル機能
@app.post("/api/multimodal", dependencies=[Depends(enforce_security)])
async def create_multimodal_context(request: MultimodalContextRequest) -> Dict[str, Any]:
    """マルチモーダルコンテキストを作成"""
    _ensure_reasonable_length(request.text_content, MAX_CONTEXT_TEXT_LENGTH, "text_content")
    _ensure_list_size(request.image_urls, MAX_MULTIMODAL_ITEMS, "image_urls")
    _ensure_list_size(request.audio_urls, MAX_MULTIMODAL_ITEMS, "audio_urls")
    _ensure_list_size(request.video_urls, MAX_MULTIMODAL_ITEMS, "video_urls")
    _ensure_list_size(request.document_urls, MAX_MULTIMODAL_ITEMS, "document_urls")
    context = MultimodalContext(
        text_content=request.text_content,
        image_urls=request.image_urls,
        audio_urls=request.audio_urls,
        video_urls=request.video_urls,
        document_urls=request.document_urls,
        metadata=request.metadata
    )
    
    return {
        "context_id": context.id,
        "total_token_estimate": context.total_token_estimate,
        "modality_count": len([
            x for x in [context.text_content, context.image_urls, context.audio_urls, 
                       context.video_urls, context.document_urls] if x
        ])
    }

# RAG機能
@app.post("/api/rag", dependencies=[Depends(enforce_security)])
async def create_rag_context(request: RAGRequest) -> Dict[str, Any]:
    """RAGコンテキストを作成"""
    _ensure_list_size(request.documents, MAX_MULTIMODAL_ITEMS, "documents")
    _ensure_reasonable_length(request.query, MAX_CONTEXT_TEXT_LENGTH, "query")
    rag_context = RAGContext(query=request.query)
    
    # 文書を追加（簡易実装）
    for i, doc in enumerate(request.documents):
        score = 1.0 - (i * 0.1)  # 簡易スコア
        rag_context.add_retrieved_document(doc, score)
    
    # コンテキストを統合
    synthesized = rag_context.synthesize_context(request.max_tokens)
    
    return {
        "context_id": rag_context.id,
        "query": rag_context.query,
        "retrieved_count": len(rag_context.retrieved_documents),
        "synthesized_context": synthesized,
        "synthesized_tokens": len(synthesized.split()) * 1.3
    }

# WebSocket
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket接続エンドポイント"""
    api_key = websocket.headers.get(API_KEY_HEADER) or websocket.query_params.get("api_key")
    try:
        await _authenticate_api_key(api_key)
    except HTTPException as exc:
        await websocket.close(code=1008, reason=exc.detail)
        return

    await websocket_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

# 統計情報
@app.get("/api/stats", dependencies=[Depends(enforce_security)])
async def get_stats() -> Dict[str, Any]:
    """システム統計情報を取得"""
    total_sessions = len(sessions_storage)
    total_windows = sum(len(session.windows) for session in sessions_storage.values())
    total_elements = sum(
        len(window.elements) 
        for session in sessions_storage.values() 
        for window in session.windows
    )
    
    template_stats = template_manager.get_template_stats()
    
    return {
        "sessions": {
            "total": total_sessions,
            "active": len([s for s in sessions_storage.values() 
                          if (datetime.now() - s.last_accessed).seconds < 3600])
        },
        "contexts": {
            "total_windows": total_windows,
            "total_elements": total_elements,
            "avg_elements_per_window": total_elements / max(total_windows, 1)
        },
        "templates": template_stats,
        "optimization_tasks": len(context_optimizer.optimization_tasks)
    }

# ヘルパー関数
def find_window_by_id(window_id: str) -> Optional[ContextWindow]:
    """ウィンドウIDからコンテキストウィンドウを検索"""
    for session in sessions_storage.values():
        for window in session.windows:
            if window.id == window_id:
                return window
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9001)
    _ensure_reasonable_length(request.content, MAX_CONTEXT_TEXT_LENGTH, "Context element content")
    _ensure_reasonable_length(request.name, 256, "Template name")
    _ensure_reasonable_length(request.description, MAX_CONTEXT_TEXT_LENGTH, "Template description")
    _ensure_reasonable_length(request.template, MAX_CONTEXT_TEXT_LENGTH, "Template body")
    _ensure_reasonable_length(purpose, MAX_CONTEXT_TEXT_LENGTH, "purpose")
    _ensure_list_size(examples, MAX_MULTIMODAL_ITEMS, "examples")
    _ensure_list_size(constraints, MAX_MULTIMODAL_ITEMS, "constraints")
    _ensure_list_size(request.goals, MAX_MULTIMODAL_ITEMS, "goals")
    _ensure_reasonable_length(request.text_content, MAX_CONTEXT_TEXT_LENGTH, "text_content")
    _ensure_list_size(request.image_urls, MAX_MULTIMODAL_ITEMS, "image_urls")
    _ensure_list_size(request.audio_urls, MAX_MULTIMODAL_ITEMS, "audio_urls")
    _ensure_list_size(request.video_urls, MAX_MULTIMODAL_ITEMS, "video_urls")
    _ensure_list_size(request.document_urls, MAX_MULTIMODAL_ITEMS, "document_urls")
    _ensure_list_size(request.documents, MAX_MULTIMODAL_ITEMS, "documents")
