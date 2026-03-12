import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, metrics
from app.database.connection import engine, Base

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sales Intelligence API", version="1.0.0")

# CORS — reads comma-separated origins from env var.
# Example: ALLOWED_ORIGINS=https://your-app.vercel.app
# Falls back to "*" locally when env var is not set.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sales Intelligence API"}

@app.get("/health")
def health_check():
    """Health check endpoint for Railway."""
    return {"status": "ok"}
