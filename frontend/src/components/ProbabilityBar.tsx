import React from 'react';

interface ProbabilityBarProps {
  probabilities: {
    Cammeo?: number;
    Osmancik?: number;
    [key: string]: number | undefined;
  };
  prediction: string;
}

export const ProbabilityBar: React.FC<ProbabilityBarProps> = ({
  probabilities,
  prediction,
}) => {
  const pCammeo = (probabilities.Cammeo ?? 0) * 100;
  const pOsmancik = (probabilities.Osmancik ?? 0) * 100;

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}
      >
        <span style={{ color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald-400)' }} />
          Cammeo: {pCammeo.toFixed(1)}%
        </span>
        <span style={{ color: 'var(--amber-400)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          Osmancik: {pOsmancik.toFixed(1)}%
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber-400)' }} />
        </span>
      </div>

      {/* Dual Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '14px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            width: `${pCammeo}%`,
            background: 'linear-gradient(90deg, var(--emerald-600), var(--emerald-400))',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: pCammeo > 0 ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
          }}
        />
        <div
          style={{
            width: `${pOsmancik}%`,
            background: 'linear-gradient(90deg, var(--amber-400), var(--amber-600))',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: pOsmancik > 0 ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.4rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>Ngưỡng phân định: 50%</span>
        <span>
          Độ tin cậy cao nhất:{' '}
          <strong style={{ color: prediction === 'Cammeo' ? 'var(--emerald-400)' : 'var(--amber-400)' }}>
            {Math.max(pCammeo, pOsmancik).toFixed(1)}%
          </strong>
        </span>
      </div>
    </div>
  );
};
