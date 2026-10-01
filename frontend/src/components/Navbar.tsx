import React from 'react';
import { Sparkles, BookOpen, Cpu, BarChart3, Activity } from 'lucide-react';

interface NavbarProps {
  activeTab: 'intro' | 'predict' | 'dashboard';
  setActiveTab: (tab: 'intro' | 'predict' | 'dashboard') => void;
  isBackendHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendHealthy,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-badge" onClick={() => setActiveTab('intro')}>
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>
          <div className="brand-text">
            <h1>Rice Variety AI Studio</h1>
            <p>Phân loại Giống lúa Học máy</p>
          </div>
        </div>

        <nav className="nav-tabs" role="tablist">
          <button
            id="tab-intro"
            role="tab"
            aria-selected={activeTab === 'intro'}
            className={`nav-tab-btn ${activeTab === 'intro' ? 'active' : ''}`}
            onClick={() => setActiveTab('intro')}
          >
            <BookOpen size={16} />
            <span>1. Giới thiệu & Phạm vi</span>
          </button>

          <button
            id="tab-predict"
            role="tab"
            aria-selected={activeTab === 'predict'}
            className={`nav-tab-btn ${activeTab === 'predict' ? 'active' : ''}`}
            onClick={() => setActiveTab('predict')}
          >
            <Cpu size={16} />
            <span>2. Thao tác Dự đoán</span>
          </button>

          <button
            id="tab-dashboard"
            role="tab"
            aria-selected={activeTab === 'dashboard'}
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={16} />
            <span>3. Dashboard & Model Card</span>
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            className={`badge ${isBackendHealthy ? 'badge-emerald' : 'badge-amber'}`}
            style={{ fontSize: '0.72rem' }}
          >
            <Activity size={12} className={isBackendHealthy ? 'animate-pulse' : ''} />
            {isBackendHealthy ? 'Backend API 8000 Sẵn sàng' : 'Mất kết nối API'}
          </span>
        </div>
      </div>
    </header>
  );
};
