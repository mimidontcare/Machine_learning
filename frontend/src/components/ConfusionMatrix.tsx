import React from 'react';

interface ConfusionMatrixProps {
  matrix: number[][]; // 2x2
  labels: string[]; // ["Cammeo", "Osmancik"]
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ matrix, labels }) => {
  if (!matrix || matrix.length < 2 || !matrix[0] || matrix[0].length < 2) {
    return <div style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu ma trận nhầm lẫn.</div>;
  }

  const label0 = labels[0] || 'Cammeo';
  const label1 = labels[1] || 'Osmancik';

  const c00 = matrix[0][0]; // True label0
  const c01 = matrix[0][1]; // False label1
  const c10 = matrix[1][0]; // False label0
  const c11 = matrix[1][1]; // True label1

  const total = c00 + c01 + c10 + c11 || 1;
  const correct = c00 + c11;
  const accuracy = (correct / total) * 100;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Ma trận nhầm lẫn (Confusion Matrix)
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Tập kiểm thử Test (571 mẫu) — Độ chính xác: <strong style={{ color: 'var(--emerald-400)' }}>{accuracy.toFixed(2)}%</strong>
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 1fr',
          gap: '8px',
          alignItems: 'stretch',
          textAlign: 'center',
        }}
      >
        {/* Header corner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Thực tế \ Dự đoán
        </div>

        {/* Col headers */}
        <div style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--emerald-400)', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)' }}>
          Dự đoán: {label0}
        </div>
        <div style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--amber-400)', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-sm)' }}>
          Dự đoán: {label1}
        </div>

        {/* Row 1: Actual label0 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--emerald-400)', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
          Thực tế: {label0}
        </div>

        {/* Cell [0][0] - Correct Cammeo */}
        <div
          className="cm-cell"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(16, 185, 129, 0.15))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
          }}
        >
          <div className="cm-cell-count" style={{ color: 'var(--emerald-400)' }}>
            {c00}
          </div>
          <div className="cm-cell-label" style={{ color: 'var(--emerald-400)' }}>
            Đúng {label0} ({((c00 / (c00 + c01)) * 100).toFixed(1)}%)
          </div>
        </div>

        {/* Cell [0][1] - Misclassified as label1 */}
        <div
          className="cm-cell"
          style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.08))',
            border: '1px solid rgba(244, 63, 94, 0.3)',
          }}
        >
          <div className="cm-cell-count" style={{ color: '#fda4af' }}>
            {c01}
          </div>
          <div className="cm-cell-label" style={{ color: '#fda4af' }}>
            Nhầm sang {label1}
          </div>
        </div>

        {/* Row 2: Actual label1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--amber-400)', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
          Thực tế: {label1}
        </div>

        {/* Cell [1][0] - Misclassified as label0 */}
        <div
          className="cm-cell"
          style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.08))',
            border: '1px solid rgba(244, 63, 94, 0.3)',
          }}
        >
          <div className="cm-cell-count" style={{ color: '#fda4af' }}>
            {c10}
          </div>
          <div className="cm-cell-label" style={{ color: '#fda4af' }}>
            Nhầm sang {label0}
          </div>
        </div>

        {/* Cell [1][1] - Correct Osmancik */}
        <div
          className="cm-cell"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(245, 158, 11, 0.15))',
            border: '1px solid rgba(245, 158, 11, 0.4)',
          }}
        >
          <div className="cm-cell-count" style={{ color: 'var(--amber-400)' }}>
            {c11}
          </div>
          <div className="cm-cell-label" style={{ color: 'var(--amber-400)' }}>
            Đúng {label1} ({((c11 / (c10 + c11)) * 100).toFixed(1)}%)
          </div>
        </div>
      </div>
    </div>
  );
};
