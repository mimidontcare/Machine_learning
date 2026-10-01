import json
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException

from app.config import DATA_DIR
from app.models import DatasetInfoResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dataset", tags=["Dataset"])


@router.get("/info", response_model=DatasetInfoResponse, summary="Thông tin tập dữ liệu")
def get_dataset_info():
    """
    Trả về thông tin chi tiết về tập dữ liệu Rice (Cammeo and Osmancik),
    bao gồm thống kê 7 đặc trưng, mô tả ý nghĩa vật lý và các bộ dữ liệu mẫu (presets).
    """
    cache_path = DATA_DIR / "dataset_info.json"
    if cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return DatasetInfoResponse(**data)
        except Exception as e:
            logger.error(f"Error reading dataset cache: {e}")

    raise HTTPException(
        status_code=500,
        detail="Dataset info cache is not available.",
    )
