import React from 'react';
import {
  Sparkles,
  Database,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Wheat,
} from 'lucide-react';
import type { DatasetInfoResponse, ModelSummary } from '../types/api';
import { MetricCard } from '../components/MetricCard';

interface IntroPageProps {
  datasetInfo: DatasetInfoResponse | null;
  models: ModelSummary[];
  onStartPredict: () => void;
}

export const IntroPage: React.FC<IntroPageProps> = ({
  datasetInfo,
  models,
  onStartPredict,
}) => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <Sparkles size={14} />
          <span>Đồ án Học Máy — Phân loại Giống lúa</span>
        </div>
        <h2 className="hero-title">
          Phân loại Giống lúa <br />
          <span className="hero-gradient-text">Cammeo & Osmancik</span>
        </h2>
        <p className="hero-subtitle">
          Ứng dụng kỹ thuật máy học giám sát tự xây dựng (Decision Tree & Random Forest) để nhận dạng và phân loại chính xác hai giống lúa chất lượng cao của Thổ Nhĩ Kỳ từ 7 đặc trưng hình thái học trích xuất qua xử lý ảnh.
        </p>

        <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button id="hero-btn-predict" className="btn btn-primary" onClick={onStartPredict}>
            <span>Bắt đầu Thử nghiệm Dự đoán</span>
            <ArrowRight size={16} />
          </button>
          <a
            href="https://archive.ics.uci.edu/dataset/545/rice+cammeo+and+osmancik"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
          >
            <span>Tài liệu UCI Dataset #545</span>
          </a>
        </div>
      </section>

      {/* Dataset KPI Summary */}
      <div className="stat-grid">
        <MetricCard
          label="Tổng số hạt lúa"
          value={datasetInfo?.total_samples.toLocaleString() ?? '3,810'}
          sublabel="Ảnh mẫu thực tế trích xuất"
          icon={<Database size={22} />}
          variant="cyan"
        />
        <MetricCard
          label="Giống lúa Cammeo"
          value={datasetInfo?.class_distribution?.Cammeo?.toLocaleString() ?? '1,630'}
          sublabel="Chiếm 42.8% tổng tập dữ liệu"
          icon={<Wheat size={22} />}
          variant="emerald"
        />
        <MetricCard
          label="Giống lúa Osmancik"
          value={datasetInfo?.class_distribution?.Osmancik?.toLocaleString() ?? '2,180'}
          sublabel="Chiếm 57.2% tổng tập dữ liệu"
          icon={<Wheat size={22} />}
          variant="amber"
        />
        <MetricCard
          label="Độ chính xác cao nhất"
          value={
            models.length > 0
              ? `${(Math.max(...models.map((m) => m.test_accuracy)) * 100).toFixed(2)}%`
              : '91.07%'
          }
          sublabel="Mô hình Rừng ngẫu nhiên (Test)"
          icon={<TrendingUp size={22} />}
          variant="emerald"
        />
      </div>

      {/* 3 Machine Learning Approaches */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Ba Phương Pháp Máy Học Trong Nghiên Cứu
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Hệ thống triển khai thuần (from-scratch CART) không phụ thuộc các thư viện cây đen có sẵn để đối chiếu hiệu quả cắt tỉa và kết hợp mô hình:
        </p>

        <div className="grid-3">
          <div className="glass-card glass-card-interactive">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-400)' }}>
                <Sliders size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>1. Cây Tiền Tỉa (Pre-pruned)</h4>
                <span className="badge badge-emerald">Dừng sớm (Early Stop)</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Áp dụng giới hạn độ sâu tối đa <code>max_depth</code> (quét từ 1 đến 20) để ngăn cây phát triển quá mức gây hiện tượng overfitting trên tập huấn luyện.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🎯 Test Accuracy: <strong style={{ color: 'var(--emerald-400)' }}>90.37%</strong> (max_depth = 6)
            </div>
          </div>

          <div className="glass-card glass-card-interactive">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan-500)' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>2. Cây Hậu Tỉa (Post-pruned)</h4>
                <span className="badge badge-cyan">CCP Pruning (α)</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Huấn luyện cây đầy đủ (full tree) sau đó tỉa ngược bằng thuật toán <em>Cost-Complexity Pruning</em> với tham số phạt độ phức tạp $\alpha$ tối ưu qua tập validation.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🎯 Test Accuracy: <strong style={{ color: 'var(--cyan-500)' }}>90.89%</strong> (14 lá tối ưu)
            </div>
          </div>

          <div className="glass-card glass-card-interactive">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber-400)' }}>
                <Layers size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>3. Rừng Ngẫu Nhiên (Random Forest)</h4>
                <span className="badge badge-amber">Bagging + Subsampling</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Kết hợp 100 cây quyết định độc lập thông qua kỹ thuật lấy mẫu có hoàn lại (bootstrap) và chọn ngẫu nhiên tập con đặc trưng (căn bậc hai số đặc trưng) ở mỗi nút phân chia, bỏ phiếu đa số.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🎯 Test Accuracy: <strong style={{ color: 'var(--amber-400)' }}>91.07%</strong> (Hiệu năng cao nhất)
            </div>
          </div>
        </div>
      </div>

      {/* Feature Dictionary */}
      <div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Từ Điển 7 Đặc Trưng Hình Thái Hạt Lúa
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Ý nghĩa hình học và khoảng giá trị của 7 thông số được trích xuất từ ảnh hạt lúa:
        </p>

        <div className="custom-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tên đặc trưng</th>
                <th>Tên tiếng Việt</th>
                <th>Đơn vị</th>
                <th>Mô tả hình học & vật lý</th>
                <th>Khoảng giá trị (Min - Max)</th>
                <th>Mẫu Cammeo</th>
                <th>Mẫu Osmancik</th>
              </tr>
            </thead>
            <tbody>
              {datasetInfo?.features?.map((feat) => (
                <tr key={feat.name}>
                  <td>
                    <code style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>{feat.name}</code>
                  </td>
                  <td style={{ fontWeight: 600 }}>{feat.vietnamese_name}</td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {feat.unit}
                    </span>
                  </td>
                  <td style={{ maxWidth: '320px', whiteSpace: 'normal', color: 'var(--text-secondary)' }}>
                    {feat.description}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {feat.min.toLocaleString()} — {feat.max.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
                    {feat.sample_cammeo.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber-400)' }}>
                    {feat.sample_osmancik.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
