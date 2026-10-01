"""Automated test script to verify all backend API endpoints."""
import sys
from pathlib import Path

# Add backend and root to sys.path
BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent
sys.path.insert(0, str(REPO_ROOT))
sys.path.insert(0, str(BASE_DIR))

from fastapi.testclient import TestClient
from app.main import app
from app.services.model_loader import model_registry


def run_tests():
    # Force load models
    model_registry.load_all()

    with TestClient(app) as client:
        print("[TEST] 1. GET /")
        r = client.get("/")
        assert r.status_code == 200, f"Root failed: {r.text}"
        print("  -> OK:", r.json())

        print("\n[TEST] 2. GET /api/health")
        r = client.get("/api/health")
        assert r.status_code == 200, f"Health check failed: {r.text}"
        data = r.json()
        assert data["models_count"] == 3, f"Expected 3 models, got {data['models_count']}"
        print("  -> OK, models loaded:", data["loaded_models"])

        print("\n[TEST] 3. GET /api/models")
        r = client.get("/api/models")
        assert r.status_code == 200, f"List models failed: {r.text}"
        models = r.json()
        assert len(models) == 3
        for m in models:
            print(f"  -> Model {m['id']}: test_acc={m['test_accuracy']:.4f}, params={m['hyperparameters']}")

        print("\n[TEST] 4. GET /api/models/comparison")
        r = client.get("/api/models/comparison")
        assert r.status_code == 200
        comp = r.json()
        assert len(comp) == 3
        print(f"  -> OK, comparison items count: {len(comp)}")

        print("\n[TEST] 5. GET /api/models/pre_pruned_tree/metrics")
        r = client.get("/api/models/pre_pruned_tree/metrics")
        assert r.status_code == 200
        metrics_data = r.json()
        assert "confusion_matrix" in metrics_data["metrics"]["test"]
        assert "max_depth_sweep" in metrics_data["metrics"]
        assert "feature_importance" in metrics_data["metrics"]
        print("  -> OK, feature importance keys:", list(metrics_data["metrics"]["feature_importance"].keys()))

        print("\n[TEST] 6. GET /api/dataset/info")
        r = client.get("/api/dataset/info")
        assert r.status_code == 200
        ds_info = r.json()
        assert ds_info["total_samples"] == 3810
        assert len(ds_info["features"]) == 7
        print(f"  -> OK, dataset total samples: {ds_info['total_samples']}, presets: {list(ds_info['sample_presets'].keys())}")

        print("\n[TEST] 7. POST /api/predict for all 3 models")
        payload_cammeo = {
            "model_name": "pre_pruned_tree",
            "features": ds_info["sample_presets"]["Cammeo"]
        }
        for model_name in ["pre_pruned_tree", "post_pruned_tree", "random_forest"]:
            payload = {"model_name": model_name, "features": ds_info["sample_presets"]["Cammeo"]}
            r = client.post("/api/predict", json=payload)
            assert r.status_code == 200, f"Predict failed for {model_name}: {r.text}"
            res = r.json()
            assert res["prediction"] == "Cammeo"
            print(f"  -> {model_name}: pred={res['prediction']}, proba={res['probabilities']}, latency={res['latency_ms']}ms")

        payload_osmancik = {
            "model_name": "random_forest",
            "features": ds_info["sample_presets"]["Osmancik"]
        }
        r = client.post("/api/predict", json=payload_osmancik)
        assert r.status_code == 200
        res = r.json()
        assert res["prediction"] == "Osmancik"
        print(f"  -> Osmancik test with random_forest: pred={res['prediction']}, proba={res['probabilities']}")

    print("\n ALL 7 TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    run_tests()
