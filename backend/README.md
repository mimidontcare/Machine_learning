# Backend API — Phân loại Giống lúa (FastAPI)

FastAPI REST API phục vụ suy luận và trực quan hóa mô hình phân loại giống lúa (Cammeo vs Osmancik) sử dụng Cây quyết định (Pre-pruning, Post-pruning CCP) và Rừng ngẫu nhiên (Random Forest).

## Cài đặt & Khởi chạy

### 1. Kích hoạt môi trường ảo
```bash
# Trên Windows PowerShell
.\.venv\Scripts\Activate.ps1

# Hoặc dùng trực tiếp python trong .venv
```

### 2. Cài đặt dependencies (nếu cần cập nhật)
```bash
.\.venv\Scripts\pip.exe install -r backend/requirements.txt
```

### 3. Chạy Server
Từ thư mục gốc dự án:
```bash
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
Hoặc từ thư mục `backend/`:
```bash
cd backend
..\.venv\Scripts\uvicorn.exe main:app --reload --port 8000
```

### 4. Tài liệu API (Swagger UI)
Sau khi server khởi động, truy cập:
- Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Danh sách API Endpoints

- `GET /api/health`: Kiểm tra trạng thái server và số lượng mô hình đã nạp.
- `GET /api/models`: Danh sách 3 mô hình kèm tóm tắt siêu tham số & độ chính xác.
- `GET /api/models/{name}/metrics`: Metadata chi tiết của mô hình (Confusion Matrix, Precision/Recall/F1 per class, Hyperparameter sweep curve, Feature Importance).
- `GET /api/models/comparison`: Dữ liệu bảng so sánh side-by-side của cả 3 mô hình.
- `GET /api/dataset/info`: Thông tin metadata tập dữ liệu lúa UCI (3810 mẫu, 7 đặc trưng, phân bố nhãn, preset mẫu).
- `POST /api/predict`: Dự đoán giống lúa dựa trên 7 đặc trưng và trả về xác suất từng giống.

---

## Chạy kiểm thử tự động
```bash
.\.venv\Scripts\python.exe backend/test_backend.py
```
