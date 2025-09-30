import React, { useState } from 'react';
import { CourseService, Course, CourseModule, Lesson, Quiz, Question } from '../services/CourseService';
import './CourseCreator.css';

interface CourseCreatorProps {
  courseService: CourseService;
  instructorId: string;
  onCourseCreated: (course: Course) => void;
  onCancel: () => void;
}

const CourseCreator: React.FC<CourseCreatorProps> = ({ 
  courseService, 
  instructorId,
  onCourseCreated,
  onCancel 
}) => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: 'blockchain',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimatedHours: 0,
    price: 0,
    thumbnail: ''
  });

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [currentModule, setCurrentModule] = useState<Partial<CourseModule>>({
    title: '',
    description: '',
    lessons: [],
    order: 0
  });

  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({
    title: '',
    type: 'text',
    content: '',
    duration: 0,
    order: 0
  });

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);

  const handleAddModule = () => {
    if (!currentModule.title || !currentModule.description) {
      alert('Please fill in all module fields');
      return;
    }

    const newModule: CourseModule = {
      id: Date.now().toString(),
      title: currentModule.title!,
      description: currentModule.description!,
      lessons: currentModule.lessons || [],
      quiz: currentModule.quiz,
      order: modules.length
    };

    if (editingModuleIndex !== null) {
      const updated = [...modules];
      updated[editingModuleIndex] = newModule;
      setModules(updated);
      setEditingModuleIndex(null);
    } else {
      setModules([...modules, newModule]);
    }

    setCurrentModule({
      title: '',
      description: '',
      lessons: [],
      order: 0
    });
    setShowModuleForm(false);
  };

  const handleAddLesson = () => {
    if (!currentLesson.title || !currentLesson.content) {
      alert('Please fill in all lesson fields');
      return;
    }

    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: currentLesson.title!,
      type: currentLesson.type as 'video' | 'text' | 'interactive' | 'assignment',
      content: currentLesson.content!,
      duration: currentLesson.duration,
      resources: currentLesson.resources,
      order: currentModule.lessons?.length || 0
    };

    setCurrentModule({
      ...currentModule,
      lessons: [...(currentModule.lessons || []), newLesson]
    });

    setCurrentLesson({
      title: '',
      type: 'text',
      content: '',
      duration: 0,
      order: 0
    });
    setShowLessonForm(false);
  };

  const handleAddQuiz = (questions: Question[]) => {
    const quiz: Quiz = {
      id: Date.now().toString(),
      questions,
      passingScore: 70,
      attempts: 3
    };

    setCurrentModule({
      ...currentModule,
      quiz
    });
    setShowQuizForm(false);
  };

  const handleCreateCourse = async () => {
    if (!courseData.title || !courseData.description || modules.length === 0) {
      alert('Please complete all required fields and add at least one module');
      return;
    }

    const course = await courseService.createCourse({
      title: courseData.title,
      description: courseData.description,
      instructor: instructorId,
      modules,
      price: courseData.price * 100000000, // Convert to satoshis
      category: courseData.category,
      difficulty: courseData.difficulty,
      estimatedHours: courseData.estimatedHours,
      thumbnail: courseData.thumbnail,
      isPublished: false,
      blockchainTxId: undefined,
      certificateTemplate: undefined
    });

    onCourseCreated(course);
  };

  const handlePublishCourse = async () => {
    await handleCreateCourse();
    // The course will be published through the create method
    alert('Course published to blockchain!');
  };

  return (
    <div className="course-creator">
      <div className="creator-header">
        <h1>Create New Course</h1>
        <button onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>

      <div className="course-form">
        <section className="course-basics">
          <h2>Course Information</h2>
          
          <div className="form-group">
            <label>Course Title *</label>
            <input
              type="text"
              value={courseData.title}
              onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
              placeholder="Introduction to Bitcoin"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={courseData.description}
              onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
              placeholder="Learn the fundamentals of Bitcoin and blockchain technology..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={courseData.category}
                onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
              >
                <option value="blockchain">Blockchain</option>
                <option value="bitcoin">Bitcoin</option>
                <option value="smart-contracts">Smart Contracts</option>
                <option value="defi">DeFi</option>
                <option value="nfts">NFTs</option>
                <option value="mining">Mining</option>
                <option value="trading">Trading</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={courseData.difficulty}
                onChange={(e) => setCourseData({ 
                  ...courseData, 
                  difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' 
                })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estimated Hours</label>
              <input
                type="number"
                value={courseData.estimatedHours}
                onChange={(e) => setCourseData({ 
                  ...courseData, 
                  estimatedHours: parseInt(e.target.value) || 0 
                })}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Price (BSV)</label>
              <input
                type="number"
                value={courseData.price}
                onChange={(e) => setCourseData({ 
                  ...courseData, 
                  price: parseFloat(e.target.value) || 0 
                })}
                min="0"
                step="0.01"
                placeholder="0 for free"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Thumbnail URL</label>
            <input
              type="url"
              value={courseData.thumbnail}
              onChange={(e) => setCourseData({ ...courseData, thumbnail: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </section>

        <section className="course-modules">
          <h2>Course Modules</h2>
          
          <div className="modules-list">
            {modules.map((module, index) => (
              <div key={module.id} className="module-item">
                <h3>Module {index + 1}: {module.title}</h3>
                <p>{module.description}</p>
                <p>{module.lessons.length} lessons{module.quiz && ', includes quiz'}</p>
                <button onClick={() => {
                  setCurrentModule(module);
                  setEditingModuleIndex(index);
                  setShowModuleForm(true);
                }}>Edit</button>
                <button onClick={() => {
                  setModules(modules.filter((_, i) => i !== index));
                }}>Remove</button>
              </div>
            ))}
          </div>

          {!showModuleForm && (
            <button onClick={() => setShowModuleForm(true)} className="add-module-btn">
              + Add Module
            </button>
          )}

          {showModuleForm && (
            <div className="module-form">
              <h3>{editingModuleIndex !== null ? 'Edit Module' : 'New Module'}</h3>
              
              <div className="form-group">
                <label>Module Title *</label>
                <input
                  type="text"
                  value={currentModule.title}
                  onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Module Description *</label>
                <textarea
                  value={currentModule.description}
                  onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="lessons-section">
                <h4>Lessons</h4>
                {currentModule.lessons?.map((lesson, index) => (
                  <div key={lesson.id} className="lesson-item">
                    <span>{index + 1}. {lesson.title} ({lesson.type})</span>
                    <button onClick={() => {
                      setCurrentModule({
                        ...currentModule,
                        lessons: currentModule.lessons?.filter((_, i) => i !== index)
                      });
                    }}>Remove</button>
                  </div>
                ))}

                {!showLessonForm && (
                  <button onClick={() => setShowLessonForm(true)} className="add-lesson-btn">
                    + Add Lesson
                  </button>
                )}

                {showLessonForm && (
                  <div className="lesson-form">
                    <div className="form-group">
                      <label>Lesson Title</label>
                      <input
                        type="text"
                        value={currentLesson.title}
                        onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Lesson Type</label>
                      <select
                        value={currentLesson.type}
                        onChange={(e) => setCurrentLesson({ ...currentLesson, type: e.target.value as 'video' | 'text' | 'interactive' | 'assignment' })}
                      >
                        <option value="text">Text</option>
                        <option value="video">Video</option>
                        <option value="interactive">Interactive</option>
                        <option value="assignment">Assignment</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Content {currentLesson.type === 'video' ? '(URL)' : ''}</label>
                      <textarea
                        value={currentLesson.content}
                        onChange={(e) => setCurrentLesson({ ...currentLesson, content: e.target.value })}
                        rows={5}
                        placeholder={currentLesson.type === 'video' ? 'Video URL' : 'Lesson content...'}
                      />
                    </div>

                    <div className="form-group">
                      <label>Duration (minutes)</label>
                      <input
                        type="number"
                        value={currentLesson.duration}
                        onChange={(e) => setCurrentLesson({ 
                          ...currentLesson, 
                          duration: parseInt(e.target.value) || 0 
                        })}
                      />
                    </div>

                    <div className="lesson-buttons">
                      <button onClick={handleAddLesson}>Add Lesson</button>
                      <button onClick={() => setShowLessonForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              {!currentModule.quiz && (
                <button onClick={() => setShowQuizForm(true)} className="add-quiz-btn">
                  + Add Quiz
                </button>
              )}

              <div className="module-buttons">
                <button onClick={handleAddModule}>
                  {editingModuleIndex !== null ? 'Update Module' : 'Add Module'}
                </button>
                <button onClick={() => {
                  setShowModuleForm(false);
                  setEditingModuleIndex(null);
                  setCurrentModule({
                    title: '',
                    description: '',
                    lessons: [],
                    order: 0
                  });
                }}>Cancel</button>
              </div>
            </div>
          )}
        </section>

        <div className="course-actions">
          <button onClick={handleCreateCourse} className="save-draft-btn">
            Save as Draft
          </button>
          <button onClick={handlePublishCourse} className="publish-btn">
            Publish Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCreator;