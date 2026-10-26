"""
Main entry point for the AI-Based Complexity Prediction Tool application.
Serves both the API backend and the built frontend SPA as a unified website.
"""

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.api.routes import router

app = FastAPI(
    title="AI-Based Complexity Prediction Tool API",
    description="Locally hosted static AST analysis and algorithmic complexity estimation API.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for localhost development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes under /api
app.include_router(router)

# Mount the production frontend dist folder if available
BASE_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = BASE_DIR / "frontend" / "dist"

if DIST_DIR.exists() and (DIST_DIR / "index.html").exists():
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Allow standard API and Swagger documentation routes
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
            return None
        target_file = DIST_DIR / full_path
        if target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(DIST_DIR / "index.html")
else:
    @app.get("/")
    async def root_fallback():
        return {
            "message": "AI-Based Complexity Prediction Tool API is running.",
            "documentation": "/docs",
            "health": "/api/health",
            "examples": "/api/examples",
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
