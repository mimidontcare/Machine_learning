import sys
from pathlib import Path

# Paths
APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
REPO_ROOT = BACKEND_DIR.parent
SAVED_MODELS_DIR = REPO_ROOT / "ml" / "saved_models"
DATA_DIR = APP_DIR / "data"

# Ensure REPO_ROOT is in sys.path so joblib unpickles ml.models.* properly
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",
]

# Supported Models
MODEL_NAMES = [
    "pre_pruned_tree",
    "post_pruned_tree",
    "random_forest",
]

MODEL_DISPLAY_NAMES = {
    "pre_pruned_tree": "Cây quyết định tiền tỉa (Pre-pruned Tree)",
    "post_pruned_tree": "Cây quyết định hậu tỉa (Post-pruned CCP Tree)",
    "random_forest": "Rừng ngẫu nhiên (Random Forest)",
}

FEATURE_NAMES = [
    "Area",
    "Perimeter",
    "Major_Axis_Length",
    "Minor_Axis_Length",
    "Eccentricity",
    "Convex_Area",
    "Extent",
]
