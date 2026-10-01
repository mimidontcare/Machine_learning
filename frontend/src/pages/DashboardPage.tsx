import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Trophy,
  Layers,
  LineChart as LineChartIcon,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

import type {
  ModelComparisonItem,
  ModelMetricsResponse,
  ModelName,
} from '../types/api';
import { apiClient } from '../api/client';
import { ConfusionMatrix } from '../components/ConfusionMatrix';

interface DashboardPageProps {
  comparison: ModelComparisonItem[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ comparison }) => {
  const [selectedModel, setSelectedModel] = useState<ModelName>('random_forest');
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getModelMetrics(selectedModel);
        if (isMounted) setMetrics(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Không thể tải chỉ số mô hình.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMetrics();
    return () => {
      isMounted = false;
    };
  }, [selectedModel]);

  // Format Feature Importance for Recharts
  const featureImportanceData = React.useMemo(() => {
    if (!metrics?.metrics?.feature_importance) return [];
    return Object.entries(metrics.metrics.feature_importance)
      .map(([name, score]) => ({
        name,
        importance: Number((score * 100).toFixed(2)),
      }))
      .sort((a, b) => b.importance - a.importance);
  }, [metrics]);

  // Format Sweep Data for Recharts
  const sweepData = React.useMemo(() => {
    if (selectedModel === 'pre_pruned_tree') {
      return (metrics?.metrics?.max_depth_sweep || []).map((pt) => ({
        label: pt.max_depth === null ? 'None' : `d=${pt.max_depth}`,
        val_accuracy: Number((pt.val_accuracy * 100).toFixed(2)),
      }));
    }
    if (selectedModel === 'post_pruned_tree') {
      return (metrics?.metrics?.alpha_path || [])
        .filter((_, idx, arr) => idx % Math.max(1, Math.floor(arr.length / 25)) === 0)
        .map((pt) => ({
          label: `${pt.n_leaves} lá`,
          val_accuracy: Number((pt.val_accuracy * 100).toFixed(2)),
          alpha: pt.alpha,
        }));
    }
    if (selectedModel === 'random_forest') {
      return (metrics?.metrics?.max_depth_sweep || []).map((pt) => ({
        label: pt.max_depth === null ? 'None' : `depth=${pt.max_depth}`,
        val_accuracy: Number((pt.val_accuracy * 100).toFixed(2)),
      }));
    }
    return [];
  }, [metrics, selectedModel]);

  const bestModel = comparison.reduce((prev, curr) =>
    curr.test_accuracy > (prev?.test_accuracy || 0) ? curr : prev,
    comparison[0]
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <BarChart3 style={{ color: 'var(--emerald-400)' }} />
          <span>Dashboard Đánh Giá & Model Card</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
          So sánh hiệu năng side-by-side của cả 3 mô hình máy học, phân tích ma trận nhầm lẫn, báo cáo F1-score và đường cong quét tham số.
        </p>
      </div>

      {/* 1. Side-by-Side Model Comparison Benchmark */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber-400)' }}>
              <Trophy size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Bảng Đối Sánh Hiệu Năng 3 Mô Hình (Benchmark)
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tập Train (70%), Val (15%), Test (15% — 571 mẫu)
              </span>
            </div>
          </div>

          {bestModel && (
            <span className="badge badge-amber" style={{ fontSize: '0.78rem' }}>
              👑 Mô hình dẫn đầu: {bestModel.display_name} ({(bestModel.test_accuracy * 100).toFixed(2)}%)
            </span>
          )}
        </div>

        <div className="custom-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Mô hình</th>
                <th>Train Acc</th>
                <th>Val Acc</th>
                <th>Test Acc</th>
                <th>Macro Precision</th>
                <th>Macro Recall</th>
                <th>Macro F1</th>
                <th>Siêu tham số tối ưu</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((item) => {
                const isBest = item.id === bestModel?.id;
                const isSelected = item.id === selectedModel;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedModel(item.id as ModelName)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(16, 185, 129, 0.08)' : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isSelected ? (
                        <CheckCircle size={15} style={{ color: 'var(--emerald-400)' }} />
                      ) : (
                        <span style={{ width: 15 }} />
                      )}
                      <span style={{ color: isSelected ? 'var(--emerald-400)' : 'var(--text-main)' }}>
                        {item.display_name}
                      </span>
                      {isBest && <span className="badge badge-amber">Top 1</span>}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{(item.train_accuracy * 100).toFixed(2)}%</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{(item.val_accuracy * 100).toFixed(2)}%</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--emerald-400)' }}>
                      {(item.test_accuracy * 100).toFixed(2)}%
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{(item.macro_precision * 100).toFixed(2)}%</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{(item.macro_recall * 100).toFixed(2)}%</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber-400)' }}>
                      {(item.macro_f1 * 100).toFixed(2)}%
                    </td>
                    <td>
                      <code style={{ fontSize: '0.78rem', color: 'var(--cyan-500)' }}>
                        {JSON.stringify(item.hyperparameters).replace(/[{}"]/g, '')}
                      </code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Model Card Detail View */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Chi Tiết Model Card: <span style={{ color: 'var(--emerald-400)' }}>{metrics?.display_name || selectedModel}</span>
        </h3>

        {/* Tab switcher for model detail */}
        <div className="nav-tabs" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
          {[
            { id: 'pre_pruned_tree' as ModelName, label: 'Cây Tiền Tỉa' },
            { id: 'post_pruned_tree' as ModelName, label: 'Cây Hậu Tỉa' },
            { id: 'random_forest' as ModelName, label: 'Rừng Ngẫu Nhiên' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab-btn ${selectedModel === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedModel(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fca5a5', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Đang nạp thông số và biểu đồ của mô hình...
        </div>
      ) : metrics ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Row 1: Confusion Matrix & Per-Class Metrics */}
          <div className="grid-2">
            {/* Confusion Matrix */}
            <div className="glass-card">
              <ConfusionMatrix
                matrix={metrics.metrics.test.confusion_matrix}
                labels={metrics.metrics.test.labels}
              />
            </div>

            {/* Per-class Metrics Table */}
            <div className="glass-card">
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Báo cáo Phân loại Chi tiết (Classification Report)
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Đánh giá chất lượng phân loại cho từng lớp giống lúa:
              </p>

              <div className="custom-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Lớp (Class)</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>F1-Score</th>
                      <th>Số mẫu (Support)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Cammeo', 'Osmancik', 'macro_avg'].map((clsKey) => {
                      const data = metrics.metrics.test.per_class[clsKey];
                      if (!data) return null;
                      const isMacro = clsKey === 'macro_avg';
                      return (
                        <tr key={clsKey} style={{ fontWeight: isMacro ? 700 : 500 }}>
                          <td>
                            {isMacro ? (
                              <span style={{ color: 'var(--cyan-500)' }}>Trung bình Macro</span>
                            ) : clsKey === 'Cammeo' ? (
                              <span style={{ color: 'var(--emerald-400)' }}>🌾 Cammeo</span>
                            ) : (
                              <span style={{ color: 'var(--amber-400)' }}>🌾 Osmancik</span>
                            )}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{(data.precision * 100).toFixed(1)}%</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{(data.recall * 100).toFixed(1)}%</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
                            {(data.f1 * 100).toFixed(1)}%
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{data.support}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Siêu tham số đã tối ưu:{' '}
                <code style={{ color: 'var(--amber-400)' }}>
                  {JSON.stringify(metrics.hyperparameters)}
                </code>
              </div>
            </div>
          </div>

          {/* Row 2: Hyperparameter Tuning Curve & Feature Importance */}
          <div className="grid-2">
            {/* Tuning Curve */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <LineChartIcon size={18} style={{ color: 'var(--emerald-400)' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Đường cong Quét Siêu tham số (Tuning Curve)
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                {selectedModel === 'pre_pruned_tree'
                  ? 'Độ chính xác trên tập Validation theo độ sâu max_depth (tối ưu tại max_depth = 6).'
                  : selectedModel === 'post_pruned_tree'
                  ? 'Độ chính xác Validation theo số lá còn lại sau tỉa phạt α (tối ưu tại 14 lá).'
                  : 'Độ chính xác Validation theo các mốc max_depth của rừng 100 cây.'}
              </p>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sweepData} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="label"
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    />
                    <YAxis
                      domain={[88, 96]}
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val}%`, 'Độ chính xác Val']}
                    />
                    <Line
                      type="monotone"
                      dataKey="val_accuracy"
                      stroke="var(--emerald-400)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--emerald-400)', r: 4 }}
                      activeDot={{ r: 7, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Importance BarChart */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Layers size={18} style={{ color: 'var(--amber-400)' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Độ Quan Trọng Của 7 Đặc Trưng (Feature Importance)
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Mức độ đóng góp giảm impurity (vẩn đục Gini) của các đặc trưng vào phân loại:
              </p>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={featureImportanceData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      type="number"
                      domain={[0, 'dataMax + 5']}
                      unit="%"
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="var(--text-muted)"
                      tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val}%`, 'Đóng góp (Impurity)']}
                    />
                    <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                      {featureImportanceData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index < 3 ? 'var(--emerald-400)' : 'var(--amber-400)'}
                          opacity={1 - index * 0.1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
