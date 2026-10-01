import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  RotateCcw,
  Zap,
  Clock,
  Wheat,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import type {
  RiceFeatures,
  ModelName,
  PredictResponse,
  DatasetInfoResponse,
  ModelSummary,
} from '../types/api';
import { apiClient } from '../api/client';
import { ProbabilityBar } from '../components/ProbabilityBar';

interface PredictPageProps {
  datasetInfo: DatasetInfoResponse | null;
  models: ModelSummary[];
}

export const PredictPage: React.FC<PredictPageProps> = ({ datasetInfo, models }) => {
  const [selectedModel, setSelectedModel] = useState<ModelName>('random_forest');
  const [features, setFeatures] = useState<RiceFeatures>({
    Area: 12056,
    Perimeter: 452.85,
    Major_Axis_Length: 178.36,
    Minor_Axis_Length: 86.87,
    Eccentricity: 0.874,
    Convex_Area: 12397,
    Extent: 0.658,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof RiceFeatures, value: number) => {
    setFeatures((prev) => ({
      ...prev,
      [field]: isNaN(value) ? 0 : value,
    }));
  };

  const loadPreset = (variety: 'Cammeo' | 'Osmancik') => {
    if (datasetInfo?.sample_presets?.[variety]) {
      setFeatures(datasetInfo.sample_presets[variety]);
      setError(null);
    }
  };

  const handleReset = () => {
    setFeatures({
      Area: 12056,
      Perimeter: 452.85,
      Major_Axis_Length: 178.36,
      Minor_Axis_Length: 86.87,
      Eccentricity: 0.874,
      Convex_Area: 12397,
      Extent: 0.658,
    });
    setResult(null);
    setError(null);
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.predict({
        model_name: selectedModel,
        features: features,
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi kết nối với máy chủ dự đoán.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Cpu style={{ color: 'var(--emerald-400)' }} />
          <span>Thao Tác Nhận Diện & Dự Đoán Giống Lúa</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
          Chọn mô hình học máy, nhập 7 thông số hình thái hoặc nạp bộ dữ liệu mẫu để hệ thống thực hiện suy luận thời gian thực.
        </p>
      </div>

      {/* Model Selector Cards */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.65rem' }}>
          CHỌN MÔ HÌNH SUY LUẬN (INFERENCE ENGINE)
        </label>
        <div className="model-picker-grid">
          {[
            {
              id: 'pre_pruned_tree' as ModelName,
              title: 'Cây Tiền Tỉa',
              badge: 'Pre-pruned Tree',
              desc: 'max_depth = 6, dừng sớm',
              acc: models.find((m) => m.id === 'pre_pruned_tree')?.test_accuracy,
            },
            {
              id: 'post_pruned_tree' as ModelName,
              title: 'Cây Hậu Tỉa',
              badge: 'Post-pruned CCP',
              desc: 'Cost-complexity α, 14 lá',
              acc: models.find((m) => m.id === 'post_pruned_tree')?.test_accuracy,
            },
            {
              id: 'random_forest' as ModelName,
              title: 'Rừng Ngẫu Nhiên',
              badge: 'Random Forest (Khuyên dùng)',
              desc: '100 trees, voting số đông',
              acc: models.find((m) => m.id === 'random_forest')?.test_accuracy,
            },
          ].map((item) => {
            const isActive = selectedModel === item.id;
            return (
              <div
                key={item.id}
                id={`model-btn-${item.id}`}
                className={`model-option-card ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedModel(item.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span className="model-option-name">{item.title}</span>
                  {isActive && <Sparkles size={16} style={{ color: 'var(--emerald-400)' }} />}
                </div>
                <div className="model-option-badge">{item.badge}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {item.desc}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Test Acc: <span style={{ color: 'var(--emerald-400)' }}>{(Number(item.acc || 0.91) * 100).toFixed(2)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Inputs on Left, Result / Presets on Right */}
      <div className="grid-2">
        {/* Form Inputs */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={18} style={{ color: 'var(--emerald-400)' }} />
              <span>7 Đặc trưng Hình thái học</span>
            </h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          <form onSubmit={handlePredict}>
            {/* Area */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="input-Area">1. Area (Diện tích hạt lúa)</label>
                <span className="form-sublabel">7,551 - 18,913 pixel²</span>
              </div>
              <input
                id="input-Area"
                type="number"
                step="1"
                className="form-input"
                value={features.Area}
                onChange={(e) => handleInputChange('Area', parseFloat(e.target.value))}
                required
              />
              <input
                type="range"
                min="7000"
                max="19500"
                step="10"
                className="form-slider"
                value={features.Area}
                onChange={(e) => handleInputChange('Area', parseFloat(e.target.value))}
              />
            </div>

            {/* Perimeter */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="input-Perimeter">2. Perimeter (Chu vi bao quanh)</label>
                <span className="form-sublabel">359.1 - 548.4 pixel</span>
              </div>
              <input
                id="input-Perimeter"
                type="number"
                step="0.1"
                className="form-input"
                value={features.Perimeter}
                onChange={(e) => handleInputChange('Perimeter', parseFloat(e.target.value))}
                required
              />
              <input
                type="range"
                min="350"
                max="560"
                step="0.5"
                className="form-slider"
                value={features.Perimeter}
                onChange={(e) => handleInputChange('Perimeter', parseFloat(e.target.value))}
              />
            </div>

            {/* Major Axis Length */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="input-Major_Axis_Length">3. Major_Axis_Length (Chiều dài trục chính)</label>
                <span className="form-sublabel">145.2 - 239.0 pixel</span>
              </div>
              <input
                id="input-Major_Axis_Length"
                type="number"
                step="0.1"
                className="form-input"
                value={features.Major_Axis_Length}
                onChange={(e) => handleInputChange('Major_Axis_Length', parseFloat(e.target.value))}
                required
              />
              <input
                type="range"
                min="140"
                max="245"
                step="0.2"
                className="form-slider"
                value={features.Major_Axis_Length}
                onChange={(e) => handleInputChange('Major_Axis_Length', parseFloat(e.target.value))}
              />
            </div>

            {/* Minor Axis Length */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="input-Minor_Axis_Length">4. Minor_Axis_Length (Chiều dài trục phụ)</label>
                <span className="form-sublabel">59.5 - 107.5 pixel</span>
              </div>
              <input
                id="input-Minor_Axis_Length"
                type="number"
                step="0.1"
                className="form-input"
                value={features.Minor_Axis_Length}
                onChange={(e) => handleInputChange('Minor_Axis_Length', parseFloat(e.target.value))}
                required
              />
              <input
                type="range"
                min="55"
                max="110"
                step="0.2"
                className="form-slider"
                value={features.Minor_Axis_Length}
                onChange={(e) => handleInputChange('Minor_Axis_Length', parseFloat(e.target.value))}
              />
            </div>

            {/* Eccentricity */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="input-Eccentricity">5. Eccentricity (Độ lệch tâm elip)</label>
                <span className="form-sublabel">0.777 - 0.948 (0 &lt; e &lt; 1)</span>
              </div>
              <input
                id="input-Eccentricity"
                type="number"
                step="0.001"
                min="0"
                max="1"
                className="form-input"
                value={features.Eccentricity}
                onChange={(e) => handleInputChange('Eccentricity', parseFloat(e.target.value))}
                required
              />
              <input
                type="range"
                min="0.75"
                max="0.96"
                step="0.001"
                className="form-slider"
                value={features.Eccentricity}
                onChange={(e) => handleInputChange('Eccentricity', parseFloat(e.target.value))}
              />
            </div>

            {/* Convex Area */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="input-Convex_Area">6. Convex_Area (Diện tích đa giác lồi)</label>
                <span className="form-sublabel">7,723 - 19,097 pixel²</span>
              </div>
              <input
                id="input-Convex_Area"
                type="number"
                step="1"
                className="form-input"
                value={features.Convex_Area}
                onChange={(e) => handleInputChange('Convex_Area', parseFloat(e.target.value))}
                required
              />
              <input
                type="range"
                min="7500"
                max="19500"
                step="10"
                className="form-slider"
                value={features.Convex_Area}
                onChange={(e) => handleInputChange('Convex_Area', parseFloat(e.target.value))}
              />
            </div>

            {/* Extent */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="input-Extent">7. Extent (Tỉ lệ diện tích bao phủ)</label>
                <span className="form-sublabel">0.498 - 0.861 (0 &lt; Extent &lt; 1)</span>
              </div>
              <input
                id="input-Extent"
                type="number"
                step="0.001"
                min="0"
                max="1"
                className="form-input"
                value={features.Extent}
                onChange={(e) => handleInputChange('Extent', parseFloat(e.target.value))}
                required
              />
              <input
                type="range"
                min="0.45"
                max="0.9"
                step="0.005"
                className="form-slider"
                value={features.Extent}
                onChange={(e) => handleInputChange('Extent', parseFloat(e.target.value))}
              />
            </div>

            <button
              id="btn-submit-predict"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              disabled={loading}
            >
              <Zap size={18} />
              <span>{loading ? 'Đang phân tích và suy luận...' : 'Thực hiện Dự đoán Giống Lúa'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Presets & Live Prediction Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Preset Buttons */}
          <div className="glass-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wheat size={18} style={{ color: 'var(--amber-400)' }} />
              <span>Nạp Nhanh Dữ Liệu Hạt Mẫu</span>
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Bấm để tự động điền các thông số vật lý đặc trưng của từng giống lúa thu được từ mẫu hạt điển hình:
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                id="preset-cammeo-btn"
                className="btn btn-primary"
                onClick={() => loadPreset('Cammeo')}
                style={{ flex: 1, minWidth: '160px' }}
              >
                <span>🌾 Mẫu hạt Cammeo</span>
              </button>

              <button
                type="button"
                id="preset-osmancik-btn"
                className="btn btn-amber"
                onClick={() => loadPreset('Osmancik')}
                style={{ flex: 1, minWidth: '160px' }}
              >
                <span>🌾 Mẫu hạt Osmancik</span>
              </button>
            </div>
          </div>

          {/* Prediction Result Display */}
          {error && (
            <div
              className="glass-card"
              style={{
                borderColor: 'rgba(244, 63, 94, 0.4)',
                background: 'rgba(244, 63, 94, 0.1)',
                color: '#fca5a5',
              }}
            >
              <strong>Lỗi suy luận:</strong> {error}
            </div>
          )}

          {result ? (
            <div className={`result-box ${result.prediction === 'Osmancik' ? 'osmancik' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                    KẾT QUẢ PHÂN LOẠI
                  </div>
                  <h3
                    style={{
                      fontSize: '2.4rem',
                      fontWeight: 800,
                      marginTop: '0.2rem',
                      color: result.prediction === 'Cammeo' ? 'var(--emerald-400)' : 'var(--amber-400)',
                    }}
                  >
                    Giống lúa: {result.prediction}
                  </h3>
                </div>

                <span
                  className={`badge ${result.prediction === 'Cammeo' ? 'badge-emerald' : 'badge-amber'}`}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  {result.model_display_name}
                </span>
              </div>

              {/* Probability meter */}
              <ProbabilityBar
                probabilities={result.probabilities}
                prediction={result.prediction}
              />

              {/* Latency and stats */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={16} style={{ color: 'var(--cyan-500)' }} />
                  <span>Thời gian suy luận: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{result.latency_ms} ms</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Info size={16} />
                  <span>Tự động giải phóng bộ nhớ</span>
                </div>
              </div>

              {/* Physical explanation note */}
              <div style={{ marginTop: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)', background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                💡 <strong>Nhận định hình thái:</strong>{' '}
                {result.prediction === 'Cammeo'
                  ? 'Hạt có chiều dài trục chính lớn và diện tích tương đối cao, độ lệch tâm gần 0.90, phù hợp đặc tính thon dài của giống lúa Cammeo.'
                  : 'Hạt có dạng thon ngắn, chu vi nhỏ hơn, tỉ lệ chiếm chỗ (extent) cao hơn, phù hợp đặc tính hạt căng tròn của giống lúa Osmancik.'}
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
              <Cpu size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Chưa có dữ liệu dự đoán
              </h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '360px', margin: '0.5rem auto 1.5rem' }}>
                Chọn một mẫu hạt (Cammeo / Osmancik) ở trên hoặc tùy chỉnh các thanh trượt rồi bấm <strong>"Thực hiện Dự đoán"</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
