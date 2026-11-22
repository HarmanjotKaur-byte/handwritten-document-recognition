import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.api.routes import router
from app.services.vision_service import VisionService
from app.services.usage_service import UsageService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("simplehtr.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes Vision service and usage tracking upon application startup."""
    logger.info("Initializing SimpleHTR Vision Backend Service...")
    vision_service = VisionService.get_instance()
    usage_service = UsageService.get_instance()
    
    if vision_service.is_configured():
        logger.info(f"Vision Service ready. Model: {vision_service.model_name}")
    else:
        logger.warning("Vision Service started without GEMINI_API_KEY. Predictions will be disabled until key is provided.")

    status = usage_service.get_status()
    logger.info(f"Monthly Budget Tracker: {status['used_units']}/{status['monthly_limit']} units used.")
    yield
    logger.info("Shutting down SimpleHTR Vision Backend Service.")


def create_app() -> FastAPI:
    """FastAPI Application factory."""
    app = FastAPI(
        title="SimpleHTR Vision API Service",
        description="Production REST API for handwriting recognition powered by Google Gemini Vision.",
        version="2.0.0",
        lifespan=lifespan
    )

    # Enable CORS for React frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router)
    return app


app = create_app()
