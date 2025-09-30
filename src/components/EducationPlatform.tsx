import React, { useState } from 'react';
import { CourseService, Course } from '../services/CourseService';
import { HandCashUser } from '../services/HandCashService';
import CourseList from './CourseList';
import CourseViewer from './CourseViewer';
import EnhancedCourseCreator from './EnhancedCourseCreator';
import CourseSidebar from './CourseSidebar';
import EducationHeader from './EducationHeader';
import './EducationPlatform.css';

interface EducationPlatformProps {
  courseService: CourseService;
  currentUser: HandCashUser | null;
}

const EducationPlatform: React.FC<EducationPlatformProps> = ({
  courseService,
  currentUser
}) => {
  const [userRole, setUserRole] = useState<'student' | 'instructor'>('student');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseCreator, setShowCourseCreator] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'my-courses' | 'browse' | 'create'>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);

  const handleCourseCreated = (course: Course) => {
    setCourses(prev => [...prev, course]);
    setShowCourseCreator(false);
    setActiveView('my-courses');
  };

  const handleViewChange = (view: 'dashboard' | 'my-courses' | 'browse' | 'create') => {
    setActiveView(view);
    if (view === 'create') {
      setShowCourseCreator(true);
    } else {
      setShowCourseCreator(false);
    }
    setSelectedCourse(null);
  };

  const renderMainContent = () => {
    if (selectedCourse) {
      return (
        <CourseViewer
          course={selectedCourse}
          courseService={courseService}
          onBack={() => setSelectedCourse(null)}
          studentId={currentUser?.handle}
        />
      );
    }

    if (showCourseCreator) {
      return (
        <div className="course-creator-container">
          <EnhancedCourseCreator
            courseService={courseService}
            instructorId={currentUser?.handle || 'unknown'}
            onCourseCreated={handleCourseCreated}
            onCancel={() => {
              setShowCourseCreator(false);
              setActiveView('dashboard');
            }}
          />
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <div className="dashboard-welcome">
              <h2>Welcome to Bitcoin Education</h2>
              <p>Learn blockchain technology through interactive courses on the BSV blockchain.</p>
              
              <div className="dashboard-stats">
                <div className="stat-card">
                  <h3>Total Courses</h3>
                  <span className="stat-number">{courses.length}</span>
                </div>
                <div className="stat-card">
                  <h3>Your Progress</h3>
                  <span className="stat-number">0%</span>
                </div>
                <div className="stat-card">
                  <h3>Certificates</h3>
                  <span className="stat-number">0</span>
                </div>
              </div>

              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button 
                    className="action-btn primary"
                    onClick={() => handleViewChange('browse')}
                  >
                    Browse Courses
                  </button>
                  {userRole === 'instructor' && (
                    <button 
                      className="action-btn secondary"
                      onClick={() => handleViewChange('create')}
                    >
                      Create Course
                    </button>
                  )}
                  <button 
                    className="action-btn tertiary"
                    onClick={() => handleViewChange('my-courses')}
                  >
                    My Courses
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'my-courses':
      case 'browse':
        return (
          <div className="courses-content">
            <CourseList
              courseService={courseService}
              onCourseSelect={setSelectedCourse}
              isInstructor={userRole === 'instructor'}
              studentId={currentUser?.handle}
              filterType={activeView === 'my-courses' ? 'enrolled' : 'all'}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="education-platform">
      <EducationHeader
        userRole={userRole}
        onRoleChange={setUserRole}
        currentUser={currentUser}
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      
      <div className="platform-body">
        <CourseSidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          userRole={userRole}
          coursesCount={courses.length}
        />
        
        <main className="main-content">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default EducationPlatform;