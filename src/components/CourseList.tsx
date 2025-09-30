import React, { useState, useEffect } from 'react';
import { CourseService, Course } from '../services/CourseService';
import './CourseList.css';

interface CourseListProps {
  courseService: CourseService;
  onCourseSelect: (course: Course) => void;
  isInstructor?: boolean;
  studentId?: string;
  filterType?: 'all' | 'enrolled' | 'available';
}

const CourseList: React.FC<CourseListProps> = ({ 
  courseService, 
  onCourseSelect, 
  isInstructor = false,
  studentId,
  filterType = 'all'
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'available'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCourses();
  }, [filter, categoryFilter, searchTerm]);

  const loadCourses = () => {
    let filteredCourses = courseService.getPublishedCourses();

    // Apply filters
    if (filter === 'enrolled' && studentId) {
      filteredCourses = courseService.getStudentCourses(studentId);
    } else if (filter === 'available' && studentId) {
      const enrolledCourses = courseService.getStudentCourses(studentId);
      const enrolledIds = new Set(enrolledCourses.map(c => c.id));
      filteredCourses = filteredCourses.filter(c => !enrolledIds.has(c.id));
    }

    if (categoryFilter !== 'all') {
      filteredCourses = filteredCourses.filter(c => c.category === categoryFilter);
    }

    if (searchTerm) {
      filteredCourses = filteredCourses.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setCourses(filteredCourses);
  };

  const handleEnroll = async (course: Course) => {
    if (studentId) {
      const enrolled = await courseService.enrollStudent(course.id, studentId);
      if (enrolled) {
        alert(`Successfully enrolled in ${course.title}`);
        loadCourses();
      }
    }
  };

  const getProgressForCourse = (courseId: string): number => {
    if (!studentId) return 0;
    const progress = courseService.getStudentProgress(studentId, courseId);
    return progress?.progressPercentage || 0;
  };

  const categories = ['all', 'blockchain', 'bitcoin', 'smart-contracts', 'defi', 'nfts', 'mining', 'trading'];

  return (
    <div className="course-list-container">
      <div className="course-filters">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        {studentId && (
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All Courses
            </button>
            <button 
              className={filter === 'enrolled' ? 'active' : ''}
              onClick={() => setFilter('enrolled')}
            >
              My Courses
            </button>
            <button 
              className={filter === 'available' ? 'active' : ''}
              onClick={() => setFilter('available')}
            >
              Available
            </button>
          </div>
        )}

        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="category-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="courses-grid">
        {courses.map(course => {
          const progress = getProgressForCourse(course.id);
          const isEnrolled = studentId ? course.enrolledStudents.includes(studentId) : false;

          return (
            <div key={course.id} className="course-card">
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="course-thumbnail" />
              )}
              
              <div className="course-info">
                <h3>{course.title}</h3>
                <p className="course-instructor">by {course.instructor}</p>
                <p className="course-description">{course.description}</p>
                
                <div className="course-meta">
                  <span className="difficulty">{course.difficulty}</span>
                  <span className="duration">{course.estimatedHours} hours</span>
                  <span className="modules">{course.modules.length} modules</span>
                  <span className="students">{course.enrolledStudents.length} students</span>
                </div>

                {isEnrolled && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    />
                    <span className="progress-text">{progress}% Complete</span>
                  </div>
                )}

                <div className="course-price">
                  {course.price === 0 ? 'Free' : `${course.price / 100000000} BSV`}
                </div>

                <div className="course-actions">
                  {isEnrolled ? (
                    <button 
                      className="continue-btn"
                      onClick={() => onCourseSelect(course)}
                    >
                      Continue Learning
                    </button>
                  ) : (
                    <>
                      <button 
                        className="view-btn"
                        onClick={() => onCourseSelect(course)}
                      >
                        View Course
                      </button>
                      {studentId && (
                        <button 
                          className="enroll-btn"
                          onClick={() => handleEnroll(course)}
                        >
                          Enroll Now
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="no-courses">
          <p>No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CourseList;