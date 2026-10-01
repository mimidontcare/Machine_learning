from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ModelNameEnum(str, Enum):
    PRE_PRUNED_TREE = "pre_pruned_tree"
    POST_PRUNED_TREE = "post_pruned_tree"
    RANDOM_FOREST = "random_forest"


class RiceFeatures(BaseModel):
    Area: float = Field(..., gt=0, description="Diện tích hạt lúa (pixel)")
    Perimeter: float = Field(..., gt=0, description="Chu vi bao quanh hạt lúa")
    Major_Axis_Length: float = Field(..., gt=0, description="Chiều dài trục chính")
    Minor_Axis_Length: float = Field(..., gt=0, description="Chiều dài trục phụ")
    Eccentricity: float = Field(..., ge=0.0, le=1.0, description="Độ lệch tâm hình elip (0 <= e <= 1)")
    Convex_Area: float = Field(..., gt=0, description="Diện tích đa giác lồi nhỏ nhất bao quanh hạt")
    Extent: float = Field(..., ge=0.0, le=1.0, description="Tỉ lệ diện tích hạt so với hình chữ nhật bao quanh (0 <= Extent <= 1)")

    class Config:
        json_schema_extra = {
            "example": {
                "Area": 12056.0,
                "Perimeter": 452.85,
                "Major_Axis_Length": 178.36,
                "Minor_Axis_Length": 86.87,
                "Eccentricity": 0.874,
                "Convex_Area": 12397.0,
                "Extent": 0.658,
            }
        }


class PredictRequest(BaseModel):
    model_name: ModelNameEnum = Field(..., description="Tên mô hình dùng để suy luận")
    features: RiceFeatures = Field(..., description="7 đặc trưng hình thái hạt lúa")


class PredictResponse(BaseModel):
    model_name: str
    model_display_name: str
    prediction: str
    probabilities: Dict[str, float]
    latency_ms: float


class ModelSummary(BaseModel):
    id: str
    name: str
    display_name: str
    trained_at: str
    hyperparameters: Dict[str, Any]
    test_accuracy: float
    val_accuracy: float
    train_accuracy: float


class ModelMetricsResponse(BaseModel):
    name: str
    display_name: str
    trained_at: str
    hyperparameters: Dict[str, Any]
    metrics: Dict[str, Any]


class ModelComparisonItem(BaseModel):
    id: str
    display_name: str
    train_accuracy: float
    val_accuracy: float
    test_accuracy: float
    macro_precision: float
    macro_recall: float
    macro_f1: float
    hyperparameters: Dict[str, Any]


class FeatureMetadata(BaseModel):
    name: str
    vietnamese_name: str
    unit: str
    description: str
    min: float
    max: float
    mean: float
    sample_cammeo: float
    sample_osmancik: float


class DatasetInfoResponse(BaseModel):
    name: str
    uci_id: int
    description: str
    total_samples: int
    features_count: int
    classes: List[str]
    class_distribution: Dict[str, int]
    features: List[FeatureMetadata]
    sample_presets: Dict[str, Dict[str, float]]
