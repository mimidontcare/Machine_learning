import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { IntroPage } from './pages/IntroPage';
import { PredictPage } from './pages/PredictPage';
import { DashboardPage } from './pages/DashboardPage';
import { apiClient } from './api/client';
import type { DatasetInfoResponse, ModelSummary, ModelComparisonItem } from './types/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'intro' | 'predict' | 'dashboard'>('intro');
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfoResponse | null>(null);
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [comparison, setComparison] = useState<ModelComparisonItem[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        const [health, dsInfo, modelList, compList] = await Promise.all([
          apiClient.checkHealth().catch(() => ({ status: 'offline', loaded_models: [], models_count: 0 })),
          apiClient.getDatasetInfo().catch(() => null),
          apiClient.getModels().catch(() => []),
          apiClient.getModelComparison().catch(() => []),
        ]);

        if (!isMounted) return;

        setIsBackendHealthy(health.status === 'healthy');
        if (dsInfo) setDatasetInfo(dsInfo);
        if (modelList) setModels(modelList);
        if (compList) setComparison(compList);
      } catch (err) {
        console.error('Initial data fetch error:', err);
        if (isMounted) setIsBackendHealthy(false);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    initData();

    // Check health periodically every 15s
    const interval = setInterval(async () => {
      try {
        const health = await apiClient.checkHealth();
        if (isMounted) setIsBackendHealthy(health.status === 'healthy');
      } catch {
        if (isMounted) setIsBackendHealthy(false);
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendHealthy={isBackendHealthy}
      />

      <main className="main-content">
        {!isBackendHealthy && (
          <div
            className="glass-card"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.08)',
              color: '#fef3c7',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
            }}
          >
            <div>
              ⚠️ <strong>Cảnh báo kết nối:</strong> Không thể kết nối tới Backend FastAPI (cổng 8000). Hãy đảm bảo server backend đang chạy qua lệnh:
              <code style={{ marginLeft: '0.5rem', padding: '0.2rem 0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                cd backend && uvicorn main:app --reload
              </code>
            </div>
          </div>
        )}

        {initialLoading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              🌾 Đang khởi động Rice Variety AI Studio...
            </div>
            <p style={{ fontSize: '0.875rem' }}>Nạp dữ liệu mô hình và đặc trưng từ máy chủ...</p>
          </div>
        ) : (
          <>
            {activeTab === 'intro' && (
              <IntroPage
                datasetInfo={datasetInfo}
                models={models}
                onStartPredict={() => setActiveTab('predict')}
              />
            )}

            {activeTab === 'predict' && (
              <PredictPage datasetInfo={datasetInfo} models={models} />
            )}

            {activeTab === 'dashboard' && (
              <DashboardPage comparison={comparison} />
            )}
          </>
        )}
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          background: 'rgba(10, 14, 23, 0.95)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>Rice Variety Classification AI System</strong> — Đồ án Học Máy (Machine Learning)
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Backend: FastAPI + Python 3.11</span>
            <span>Frontend: React + Vite + Recharts</span>
            <span>Dataset: UCI Rice #545</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
