import time
from typing import Dict
import numpy as np
from fastapi import HTTPException

from app.config import MODEL_DISPLAY_NAMES, FEATURE_NAMES
from app.models import RiceFeatures, PredictResponse
from app.services.model_loader import model_registry


def predict_variety(model_name: str, features: RiceFeatures) -> PredictResponse:
    """Perform inference on input features with the selected model."""
    model = model_registry.get_model(model_name)
    if model is None:
        raise HTTPException(
            status_code=404,
            detail=f"Model '{model_name}' is not found or not loaded.",
        )

    # Convert features to numpy array (1, 7)
    feature_vector = np.array(
        [[getattr(features, feat) for feat in FEATURE_NAMES]],
        dtype=np.float64,
    )

    start_time = time.perf_counter()
    try:
        preds = model.predict(feature_vector)
        predicted_class = str(preds[0])

        # Get probabilities
        probabilities: Dict[str, float] = {}
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(feature_vector)[0]
            classes = getattr(model, "classes_", ["Cammeo", "Osmancik"])
            for cls_name, p in zip(classes, probs):
                probabilities[str(cls_name)] = round(float(p), 4)
        else:
            # Fallback if no predict_proba
            probabilities[predicted_class] = 1.0

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return PredictResponse(
            model_name=model_name,
            model_display_name=MODEL_DISPLAY_NAMES.get(model_name, model_name),
            prediction=predicted_class,
            probabilities=probabilities,
            latency_ms=latency_ms,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference error with model '{model_name}': {str(e)}",
        )
