from typing import List
from fastapi import APIRouter, HTTPException

from app.models import ModelSummary, ModelMetricsResponse, ModelComparisonItem
from app.services.model_loader import model_registry
from app.config import MODEL_DISPLAY_NAMES

router = APIRouter(prefix="/api/models", tags=["Models"])


@router.get("", response_model=List[ModelSummary], summary="Danh sách 3 mô hình")
def list_models():
    """Liệt kê 3 mô hình (Tiền tỉa, Hậu tỉa, Rừng ngẫu nhiên) kèm tóm tắt siêu tham số & độ chính xác."""
    return model_registry.list_models()


@router.get("/comparison", response_model=List[ModelComparisonItem], summary="Bảng so sánh 3 mô hình")
def compare_models():
    """Trả về bảng dữ liệu so sánh side-by-side của 3 mô hình phục vụ Dashboard."""
    return model_registry.get_comparison()


@router.get("/{name}/metrics", response_model=ModelMetricsResponse, summary="Chỉ số chi tiết của mô hình")
def get_model_metrics(name: str):
    """
    Trả về toàn bộ metadata và metrics đã lưu của mô hình:
    - Báo cáo phân loại (precision, recall, f1, support)
    - Ma trận nhầm lẫn (Confusion Matrix)
    - Quá trình quét siêu tham số (max_depth_sweep hoặc alpha_path)
    - Độ quan trọng đặc trưng (feature_importance)
    """
    meta = model_registry.get_metadata(name)
    if not meta:
        raise HTTPException(
            status_code=404,
            detail=f"Mô hình '{name}' không tồn tại hoặc chưa được nạp.",
        )
    return ModelMetricsResponse(
        name=meta.get("name", name),
        display_name=MODEL_DISPLAY_NAMES.get(name, name),
        trained_at=meta.get("trained_at", ""),
        hyperparameters=meta.get("hyperparameters", {}),
        metrics=meta.get("metrics", {}),
    )
