import React from 'react';
import './CourseSidebar.css';

interface CourseSidebarProps {
  activeView: string;
  onViewChange: (view: 'dashboard' | 'my-courses' | 'browse' | 'create') => void;
  userRole: 'student' | 'instructor';
  coursesCount: number;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  activeView,
  onViewChange,
  userRole,
  coursesCount
}) => {
  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview & Stats'
    },
    {
      id: 'browse',
      label: 'Browse Courses',
      icon: '🔍',
      description: 'Discover New Content'
    },
    {
      id: 'my-courses',
      label: 'My Courses',
      icon: '📚',
      description: userRole === 'instructor' ? 'Courses I Created' : 'Enrolled Courses',
      badge: coursesCount > 0 ? coursesCount.toString() : undefined
    }
  ];

  if (userRole === 'instructor') {
    sidebarItems.push({
      id: 'create',
      label: 'Create Course',
      icon: '➕',
      description: 'Build New Course'
    });
  }

  const categories = [
    { name: 'Blockchain Basics', count: 12, color: '#2563EB' },
    { name: 'Bitcoin Fundamentals', count: 8, color: '#10B981' },
    { name: 'Smart Contracts', count: 6, color: '#8B5CF6' },
    { name: 'DeFi', count: 4, color: '#F59E0B' },
    { name: 'Mining', count: 3, color: '#EF4444' },
    { name: 'Trading', count: 5, color: '#06B6D4' }
  ];

  return (
    <aside className="course-sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Navigation</h3>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id as any)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <div className="sidebar-content">
                <span className="sidebar-label">{item.label}</span>
                <span className="sidebar-description">{item.description}</span>
              </div>
              {item.badge && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Categories</h3>
        <div className="categories-list">
          {categories.map((category) => (
            <div key={category.name} className="category-item">
              <div className="category-info">
                <div 
                  className="category-color" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="category-name">{category.name}</span>
              </div>
              <span className="category-count">{category.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Quick Stats</h3>
        <div className="quick-stats">
          <div className="stat-row">
            <span className="stat-label">Total Courses</span>
            <span className="stat-value">38</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Active Students</span>
            <span className="stat-value">1,247</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Certificates Issued</span>
            <span className="stat-value">892</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Blockchain Txs</span>
            <span className="stat-value">2,156</span>
          </div>
        </div>
      </div>

      {userRole === 'instructor' && (
        <div className="sidebar-section">
          <h3 className="sidebar-title">Instructor Tools</h3>
          <div className="instructor-tools">
            <button className="tool-btn">
              <span>📊</span>
              Analytics
            </button>
            <button className="tool-btn">
              <span>👥</span>
              Students
            </button>
            <button className="tool-btn">
              <span>🎓</span>
              Certificates
            </button>
            <button className="tool-btn">
              <span>💰</span>
              Earnings
            </button>
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="blockchain-status">
          <div className="status-indicator online"></div>
          <span>BSV Blockchain Connected</span>
        </div>
      </div>
    </aside>
  );
};

export default CourseSidebar;