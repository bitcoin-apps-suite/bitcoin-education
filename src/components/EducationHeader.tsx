import React from 'react';
import { HandCashUser } from '../services/HandCashService';
import './EducationHeader.css';

interface EducationHeaderProps {
  userRole: 'student' | 'instructor';
  onRoleChange: (role: 'student' | 'instructor') => void;
  currentUser: HandCashUser | null;
  activeView: string;
  onViewChange: (view: 'dashboard' | 'my-courses' | 'browse' | 'create') => void;
}

const EducationHeader: React.FC<EducationHeaderProps> = ({
  userRole,
  onRoleChange,
  currentUser,
  activeView,
  onViewChange
}) => {
  return (
    <header className="education-header">
      <div className="header-main">
        <div className="header-left">
          <div className="logo-section">
            <img src="/logo.svg" alt="Bitcoin Education" className="header-logo" />
            <div className="brand-info">
              <h1>Bitcoin Education</h1>
              <span className="tagline">Learn Blockchain Technology</span>
            </div>
          </div>
        </div>

        <div className="header-center">
          <nav className="main-navigation">
            <button 
              className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => onViewChange('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-btn ${activeView === 'browse' ? 'active' : ''}`}
              onClick={() => onViewChange('browse')}
            >
              Browse Courses
            </button>
            <button 
              className={`nav-btn ${activeView === 'my-courses' ? 'active' : ''}`}
              onClick={() => onViewChange('my-courses')}
            >
              My Courses
            </button>
            {userRole === 'instructor' && (
              <button 
                className={`nav-btn create-btn ${activeView === 'create' ? 'active' : ''}`}
                onClick={() => onViewChange('create')}
              >
                Create Course
              </button>
            )}
          </nav>
        </div>

        <div className="header-right">
          <div className="user-controls">
            <div className="role-selector">
              <label>Mode:</label>
              <select 
                value={userRole} 
                onChange={(e) => onRoleChange(e.target.value as 'student' | 'instructor')}
                className="role-dropdown"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
            
            {currentUser && (
              <div className="user-info">
                <img 
                  src={currentUser.avatarUrl || '/favicon.svg'} 
                  alt={currentUser.displayName} 
                  className="user-avatar"
                />
                <span className="user-name">{currentUser.displayName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="header-secondary">
        <div className="breadcrumb">
          <span className="breadcrumb-home">Bitcoin Education</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">
            {activeView === 'dashboard' && 'Dashboard'}
            {activeView === 'browse' && 'Browse Courses'}
            {activeView === 'my-courses' && 'My Courses'}
            {activeView === 'create' && 'Create Course'}
          </span>
        </div>

        <div className="header-actions">
          {userRole === 'student' && (
            <div className="student-stats">
              <span className="stat-item">
                <span className="stat-label">Progress:</span>
                <span className="stat-value">0%</span>
              </span>
              <span className="stat-item">
                <span className="stat-label">Certificates:</span>
                <span className="stat-value">0</span>
              </span>
            </div>
          )}
          
          {userRole === 'instructor' && (
            <div className="instructor-stats">
              <span className="stat-item">
                <span className="stat-label">My Courses:</span>
                <span className="stat-value">0</span>
              </span>
              <span className="stat-item">
                <span className="stat-label">Students:</span>
                <span className="stat-value">0</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default EducationHeader;