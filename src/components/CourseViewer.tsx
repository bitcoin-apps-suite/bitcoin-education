import React, { useState, useEffect } from 'react';
import { Course, CourseModule, Lesson, CourseService, StudentProgress } from '../services/CourseService';
import './CourseViewer.css';

interface CourseViewerProps {
  course: Course;
  courseService: CourseService;
  studentId?: string;
  isInstructor?: boolean;
  onBack: () => void;
}

const CourseViewer: React.FC<CourseViewerProps> = ({ 
  course, 
  courseService, 
  studentId,
  isInstructor = false,
  onBack 
}) => {
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string | number }>({});

  useEffect(() => {
    if (course.modules.length > 0) {
      setSelectedModule(course.modules[0]);
      if (course.modules[0].lessons.length > 0) {
        setSelectedLesson(course.modules[0].lessons[0]);
      }
    }

    if (studentId) {
      const studentProgress = courseService.getStudentProgress(studentId, course.id);
      setProgress(studentProgress);
    }
  }, [course, studentId]);

  const handleLessonComplete = () => {
    if (!studentId || !selectedLesson) return;

    courseService.updateLessonProgress(studentId, course.id, selectedLesson.id);
    
    // Refresh progress
    const updatedProgress = courseService.getStudentProgress(studentId, course.id);
    setProgress(updatedProgress);

    // Auto-advance to next lesson
    const currentModuleIndex = course.modules.findIndex(m => m.id === selectedModule?.id);
    const currentLessonIndex = selectedModule?.lessons.findIndex(l => l.id === selectedLesson.id) || 0;

    if (selectedModule && currentLessonIndex < selectedModule.lessons.length - 1) {
      // Next lesson in same module
      setSelectedLesson(selectedModule.lessons[currentLessonIndex + 1]);
    } else if (currentModuleIndex < course.modules.length - 1) {
      // First lesson of next module
      const nextModule = course.modules[currentModuleIndex + 1];
      setSelectedModule(nextModule);
      if (nextModule.lessons.length > 0) {
        setSelectedLesson(nextModule.lessons[0]);
      }
    }
  };

  const handleQuizSubmit = () => {
    if (!selectedModule?.quiz || !studentId) return;

    let score = 0;
    selectedModule.quiz.questions.forEach(question => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        score += question.points;
      }
    });

    const totalPoints = selectedModule.quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (score / totalPoints) * 100;

    courseService.recordQuizScore(studentId, course.id, selectedModule.quiz.id, percentage);
    
    alert(`Quiz completed! Score: ${percentage.toFixed(1)}%`);
    setShowQuiz(false);
    setQuizAnswers({});
  };

  const handleRequestCertificate = async () => {
    if (!studentId || !progress || progress.progressPercentage < 100) return;

    const certificate = await courseService.issueCertificate(
      studentId, 
      course.id, 
      'Student Name' // This should come from user profile
    );

    if (certificate) {
      alert(`Certificate issued! Verification code: ${certificate.verificationCode}`);
    }
  };

  const renderLessonContent = () => {
    if (!selectedLesson) return null;

    switch (selectedLesson.type) {
      case 'video':
        return (
          <div className="lesson-video">
            <video controls src={selectedLesson.content} />
          </div>
        );
      
      case 'text':
        return (
          <div className="lesson-text" dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
        );
      
      case 'interactive':
        return (
          <div className="lesson-interactive">
            <iframe src={selectedLesson.content} title={selectedLesson.title} />
          </div>
        );
      
      case 'assignment':
        return (
          <div className="lesson-assignment">
            <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
            <textarea 
              placeholder="Submit your assignment here..."
              className="assignment-input"
            />
            <button className="submit-btn">Submit Assignment</button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderQuiz = () => {
    if (!selectedModule?.quiz) return null;

    return (
      <div className="quiz-container">
        <h3>Module Quiz</h3>
        {selectedModule.quiz.questions.map((question, index) => (
          <div key={question.id} className="quiz-question">
            <h4>{index + 1}. {question.question}</h4>
            {question.type === 'multiple-choice' && question.options && (
              <div className="quiz-options">
                {question.options.map((option, optIndex) => (
                  <label key={optIndex}>
                    <input
                      type="radio"
                      name={question.id}
                      value={optIndex}
                      onChange={(e) => setQuizAnswers({
                        ...quizAnswers,
                        [question.id]: parseInt(e.target.value)
                      })}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
            {question.type === 'true-false' && (
              <div className="quiz-options">
                <label>
                  <input
                    type="radio"
                    name={question.id}
                    value="true"
                    onChange={(e) => setQuizAnswers({
                      ...quizAnswers,
                      [question.id]: e.target.value
                    })}
                  />
                  True
                </label>
                <label>
                  <input
                    type="radio"
                    name={question.id}
                    value="false"
                    onChange={(e) => setQuizAnswers({
                      ...quizAnswers,
                      [question.id]: e.target.value
                    })}
                  />
                  False
                </label>
              </div>
            )}
            {question.type === 'short-answer' && (
              <input
                type="text"
                className="short-answer"
                onChange={(e) => setQuizAnswers({
                  ...quizAnswers,
                  [question.id]: e.target.value
                })}
              />
            )}
          </div>
        ))}
        <button className="submit-quiz-btn" onClick={handleQuizSubmit}>
          Submit Quiz
        </button>
      </div>
    );
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress?.completedLessons.includes(lessonId) || false;
  };

  return (
    <div className="course-viewer">
      <div className="course-header">
        <button onClick={onBack} className="back-btn">← Back to Courses</button>
        <h1>{course.title}</h1>
        {progress && (
          <div className="overall-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
            <span>{progress.progressPercentage}% Complete</span>
            {progress.progressPercentage === 100 && !progress.certificateIssued && (
              <button onClick={handleRequestCertificate} className="certificate-btn">
                Get Certificate
              </button>
            )}
          </div>
        )}
      </div>

      <div className="course-content">
        <div className="course-sidebar">
          <h3>Course Modules</h3>
          {course.modules.map((module, moduleIndex) => (
            <div key={module.id} className="module-section">
              <h4 
                className={selectedModule?.id === module.id ? 'active' : ''}
                onClick={() => setSelectedModule(module)}
              >
                {moduleIndex + 1}. {module.title}
              </h4>
              <ul className="lesson-list">
                {module.lessons.map((lesson, lessonIndex) => (
                  <li 
                    key={lesson.id}
                    className={`
                      ${selectedLesson?.id === lesson.id ? 'active' : ''}
                      ${isLessonCompleted(lesson.id) ? 'completed' : ''}
                    `}
                    onClick={() => {
                      setSelectedModule(module);
                      setSelectedLesson(lesson);
                      setShowQuiz(false);
                    }}
                  >
                    <span className="lesson-number">{lessonIndex + 1}</span>
                    <span className="lesson-title">{lesson.title}</span>
                    {lesson.duration && (
                      <span className="lesson-duration">{lesson.duration} min</span>
                    )}
                    {isLessonCompleted(lesson.id) && (
                      <span className="checkmark">✓</span>
                    )}
                  </li>
                ))}
                {module.quiz && (
                  <li 
                    className={showQuiz && selectedModule?.id === module.id ? 'active' : ''}
                    onClick={() => {
                      setSelectedModule(module);
                      setShowQuiz(true);
                      setSelectedLesson(null);
                    }}
                  >
                    <span className="lesson-number">Q</span>
                    <span className="lesson-title">Module Quiz</span>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="lesson-container">
          {showQuiz ? (
            renderQuiz()
          ) : selectedLesson ? (
            <>
              <h2>{selectedLesson.title}</h2>
              {renderLessonContent()}
              
              {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                <div className="lesson-resources">
                  <h3>Resources</h3>
                  <ul>
                    {selectedLesson.resources.map(resource => (
                      <li key={resource.id}>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.title} ({resource.type})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {studentId && !isLessonCompleted(selectedLesson.id) && (
                <button onClick={handleLessonComplete} className="complete-lesson-btn">
                  Mark as Complete
                </button>
              )}
            </>
          ) : (
            <div className="no-content">
              <p>Select a lesson to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;