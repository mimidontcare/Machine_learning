import sys
from pathlib import Path

# Add backend directory and repo root to sys.path
CURRENT_DIR = Path(__file__).resolve().parent
REPO_ROOT = CURRENT_DIR.parent

for p in [CURRENT_DIR, REPO_ROOT]:
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
