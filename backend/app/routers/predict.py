from fastapi import APIRouter
from app.models import PredictRequest, PredictResponse
from app.services.predictor import predict_variety

router = APIRouter(prefix="/api/predict", tags=["Predict"])


@router.post("", response_model=PredictResponse, summary="Dự đoán giống lúa")
def predict(request: PredictRequest):
    """
    Nhận 7 đặc trưng hình thái học hạt lúa và tên mô hình,
    trả về giống lúa dự đoán (Cammeo / Osmancik) kèm xác suất của từng giống.
    """
    return predict_variety(
        model_name=request.model_name.value,
        features=request.features,
    )
