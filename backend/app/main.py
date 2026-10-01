import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.services.model_loader import model_registry
from app.routers import predict, models, dataset

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load models and metadata into memory
    logger.info("Starting up FastAPI application...")
    model_registry.load_all()
    logger.info(f"Loaded {len(model_registry.models)} models into registry.")
    yield
    # Shutdown: Clean up resources if needed
    logger.info("Shutting down FastAPI application...")


app = FastAPI(
    title="Rice Variety Classification API",
    description="API phục vụ phân loại 2 giống lúa (Cammeo và Osmancik) sử dụng Cây quyết định và Rừng ngẫu nhiên.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(predict.router)
app.include_router(models.router)
app.include_router(dataset.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Rice Variety Classification API",
        "status": "online",
        "docs_url": "/docs",
        "models_available": list(model_registry.models.keys()),
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "loaded_models": list(model_registry.models.keys()),
        "models_count": len(model_registry.models),
    }
