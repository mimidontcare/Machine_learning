import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import joblib

from app.config import (
    SAVED_MODELS_DIR,
    MODEL_NAMES,
    MODEL_DISPLAY_NAMES,
    FEATURE_NAMES,
)
from app.models import ModelSummary, ModelComparisonItem

logger = logging.getLogger(__name__)


def compute_tree_feature_importance(tree, n_features: int = 7) -> np.ndarray:
    """Calculate feature importance based on weighted impurity decrease for DecisionTree."""
    importances = np.zeros(n_features, dtype=np.float64)
    if not hasattr(tree, "root") or tree.root is None:
        return importances

    total_samples = tree.root.n_samples
    if total_samples <= 0:
        return importances

    def _traverse(node):
        if node is None or node.is_leaf:
            return
        if node.feature_index is not None and node.left is not None and node.right is not None:
            n_node = node.n_samples
            n_l = node.left.n_samples
            n_r = node.right.n_samples
            imp_parent = node.impurity
            imp_l = node.left.impurity
            imp_r = node.right.impurity

            decrease = (n_node / total_samples) * (imp_parent - (n_l / n_node) * imp_l - (n_r / n_node) * imp_r)
            if decrease > 0:
                importances[node.feature_index] += decrease

        _traverse(node.left)
        _traverse(node.right)

    _traverse(tree.root)
    total_imp = np.sum(importances)
    if total_imp > 0:
        importances = importances / total_imp
    return importances


def compute_forest_feature_importance(forest, n_features: int = 7) -> np.ndarray:
    """Calculate feature importance for RandomForest by averaging individual trees."""
    if not hasattr(forest, "trees_") or not forest.trees_:
        return np.zeros(n_features, dtype=np.float64)
    tree_importances = [compute_tree_feature_importance(t, n_features) for t in forest.trees_]
    mean_imp = np.mean(tree_importances, axis=0)
    total = np.sum(mean_imp)
    return mean_imp / total if total > 0 else mean_imp


class ModelRegistry:
    _instance: Optional["ModelRegistry"] = None

    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.metadata: Dict[str, Dict[str, Any]] = {}
        self.feature_importances: Dict[str, Dict[str, float]] = {}

    @classmethod
    def get_instance(cls) -> "ModelRegistry":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_all(self, directory: Optional[Path] = None) -> None:
        """Load all 3 models and metadata files into memory."""
        models_dir = directory or SAVED_MODELS_DIR
        logger.info(f"Loading models from: {models_dir}")

        for name in MODEL_NAMES:
            joblib_path = models_dir / f"{name}.joblib"
            json_path = models_dir / f"{name}.json"

            if not joblib_path.exists():
                logger.warning(f"Model file not found: {joblib_path}")
                continue
            if not json_path.exists():
                logger.warning(f"Metadata file not found: {json_path}")
                continue

            # Load model and JSON metadata
            try:
                model = joblib.load(joblib_path)
                with open(json_path, "r", encoding="utf-8") as f:
                    meta = json.load(f)

                # Compute feature importances
                if name == "random_forest":
                    fi = compute_forest_feature_importance(model, len(FEATURE_NAMES))
                else:
                    fi = compute_tree_feature_importance(model, len(FEATURE_NAMES))

                fi_dict = {feat: float(fi[idx]) for idx, feat in enumerate(FEATURE_NAMES)}
                meta["metrics"]["feature_importance"] = fi_dict

                self.models[name] = model
                self.metadata[name] = meta
                self.feature_importances[name] = fi_dict
                logger.info(f"Loaded model '{name}' successfully.")
            except Exception as e:
                logger.error(f"Error loading model '{name}': {e}", exc_info=True)

    def get_model(self, name: str) -> Optional[Any]:
        return self.models.get(name)

    def get_metadata(self, name: str) -> Optional[Dict[str, Any]]:
        return self.metadata.get(name)

    def list_models(self) -> List[ModelSummary]:
        summaries = []
        for name in MODEL_NAMES:
            meta = self.metadata.get(name)
            if not meta:
                continue
            metrics = meta.get("metrics", {})
            test_metrics = metrics.get("test", {})
            summaries.append(
                ModelSummary(
                    id=name,
                    name=name,
                    display_name=MODEL_DISPLAY_NAMES.get(name, name),
                    trained_at=meta.get("trained_at", ""),
                    hyperparameters=meta.get("hyperparameters", {}),
                    test_accuracy=float(test_metrics.get("accuracy", 0.0)),
                    val_accuracy=float(metrics.get("val_accuracy", 0.0)),
                    train_accuracy=float(metrics.get("train_accuracy", 0.0)),
                )
            )
        return summaries

    def get_comparison(self) -> List[ModelComparisonItem]:
        comparison = []
        for name in MODEL_NAMES:
            meta = self.metadata.get(name)
            if not meta:
                continue
            metrics = meta.get("metrics", {})
            test_metrics = metrics.get("test", {})
            macro_avg = test_metrics.get("per_class", {}).get("macro_avg", {})

            comparison.append(
                ModelComparisonItem(
                    id=name,
                    display_name=MODEL_DISPLAY_NAMES.get(name, name),
                    train_accuracy=float(metrics.get("train_accuracy", 0.0)),
                    val_accuracy=float(metrics.get("val_accuracy", 0.0)),
                    test_accuracy=float(test_metrics.get("accuracy", 0.0)),
                    macro_precision=float(macro_avg.get("precision", 0.0)),
                    macro_recall=float(macro_avg.get("recall", 0.0)),
                    macro_f1=float(macro_avg.get("f1", 0.0)),
                    hyperparameters=meta.get("hyperparameters", {}),
                )
            )
        return comparison


# Singleton getter
model_registry = ModelRegistry.get_instance()
