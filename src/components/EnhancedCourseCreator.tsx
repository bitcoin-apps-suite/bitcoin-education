import React, { useState } from 'react';
import { CourseService, Course, CourseModule, Lesson, Quiz, Question } from '../services/CourseService';
import './EnhancedCourseCreator.css';

interface EnhancedCourseCreatorProps {
  courseService: CourseService;
  instructorId: string;
  onCourseCreated: (course: Course) => void;
  onCancel: () => void;
}

const EnhancedCourseCreator: React.FC<EnhancedCourseCreatorProps> = ({
  courseService,
  instructorId,
  onCourseCreated,
  onCancel
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: 'blockchain',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimatedHours: 0,
    price: 0,
    thumbnail: '',
    learningObjectives: [''],
    prerequisites: [''],
    tags: ['']
  });

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [currentModule, setCurrentModule] = useState<Partial<CourseModule>>({
    title: '',
    description: '',
    lessons: [],
    order: 0
  });

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);

  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({
    title: '',
    type: 'text',
    content: '',
    duration: 0,
    order: 0,
    resources: []
  });

  const steps = [
    { id: 1, title: 'Course Information', icon: '📋' },
    { id: 2, title: 'Course Structure', icon: '🏗️' },
    { id: 3, title: 'Content Creation', icon: '✍️' },
    { id: 4, title: 'Review & Publish', icon: '🚀' }
  ];

  const addLearningObjective = () => {
    setCourseData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const updateLearningObjective = (index: number, value: string) => {
    setCourseData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((obj, i) => 
        i === index ? value : obj
      )
    }));
  };

  const removeLearningObjective = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }));
  };

  const addPrerequisite = () => {
    setCourseData(prev => ({
      ...prev,
      prerequisites: [...prev.prerequisites, '']
    }));
  };

  const updatePrerequisite = (index: number, value: string) => {
    setCourseData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.map((prereq, i) => 
        i === index ? value : prereq
      )
    }));
  };

  const removePrerequisite = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    setCourseData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateTag = (index: number, value: string) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => 
        i === index ? value : tag
      )
    }));
  };

  const removeTag = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

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
      resources: currentLesson.resources || [],
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
      order: 0,
      resources: []
    });
    setShowLessonForm(false);
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
      price: courseData.price * 100000000,
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

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Course Information</h2>
            
            <div className="form-grid">
              <div className="form-group span-2">
                <label>Course Title *</label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  placeholder="Introduction to Bitcoin and Blockchain Technology"
                />
              </div>

              <div className="form-group span-2">
                <label>Course Description *</label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  placeholder="Comprehensive course covering Bitcoin fundamentals, blockchain technology, and practical applications..."
                  rows={4}
                />
              </div>

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
                <label>Difficulty Level</label>
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

              <div className="form-group span-2">
                <label>Thumbnail URL</label>
                <input
                  type="url"
                  value={courseData.thumbnail}
                  onChange={(e) => setCourseData({ ...courseData, thumbnail: e.target.value })}
                  placeholder="https://example.com/course-thumbnail.jpg"
                />
              </div>
            </div>

            <div className="objectives-section">
              <h3>Learning Objectives</h3>
              {courseData.learningObjectives.map((objective, index) => (
                <div key={index} className="dynamic-input">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => updateLearningObjective(index, e.target.value)}
                    placeholder="What will students learn?"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeLearningObjective(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addLearningObjective} className="add-btn">
                + Add Learning Objective
              </button>
            </div>

            <div className="prerequisites-section">
              <h3>Prerequisites</h3>
              {courseData.prerequisites.map((prerequisite, index) => (
                <div key={index} className="dynamic-input">
                  <input
                    type="text"
                    value={prerequisite}
                    onChange={(e) => updatePrerequisite(index, e.target.value)}
                    placeholder="Basic computer skills"
                  />
                  <button 
                    type="button" 
                    onClick={() => removePrerequisite(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addPrerequisite} className="add-btn">
                + Add Prerequisite
              </button>
            </div>

            <div className="tags-section">
              <h3>Tags</h3>
              {courseData.tags.map((tag, index) => (
                <div key={index} className="dynamic-input">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    placeholder="bitcoin, blockchain, cryptocurrency"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeTag(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addTag} className="add-btn">
                + Add Tag
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Course Structure</h2>
            
            <div className="modules-overview">
              <div className="modules-list">
                {modules.map((module, index) => (
                  <div key={module.id} className="module-card">
                    <div className="module-header">
                      <h3>Module {index + 1}: {module.title}</h3>
                      <div className="module-actions">
                        <button onClick={() => {
                          setCurrentModule(module);
                          setEditingModuleIndex(index);
                          setShowModuleForm(true);
                        }}>Edit</button>
                        <button onClick={() => {
                          setModules(modules.filter((_, i) => i !== index));
                        }}>Remove</button>
                      </div>
                    </div>
                    <p>{module.description}</p>
                    <div className="module-stats">
                      <span>{module.lessons.length} lessons</span>
                      {module.quiz && <span>• Quiz included</span>}
                    </div>
                  </div>
                ))}
              </div>

              {!showModuleForm && (
                <button onClick={() => setShowModuleForm(true)} className="add-module-btn">
                  + Add New Module
                </button>
              )}
            </div>

            {showModuleForm && (
              <div className="module-form-container">
                <div className="module-form">
                  <h3>{editingModuleIndex !== null ? 'Edit Module' : 'Create New Module'}</h3>
                  
                  <div className="form-group">
                    <label>Module Title *</label>
                    <input
                      type="text"
                      value={currentModule.title}
                      onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                      placeholder="Introduction to Bitcoin"
                    />
                  </div>

                  <div className="form-group">
                    <label>Module Description *</label>
                    <textarea
                      value={currentModule.description}
                      onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
                      rows={3}
                      placeholder="This module covers the basic concepts and history of Bitcoin..."
                    />
                  </div>

                  <div className="lessons-management">
                    <h4>Lessons</h4>
                    <div className="lessons-list">
                      {currentModule.lessons?.map((lesson, index) => (
                        <div key={lesson.id} className="lesson-item">
                          <div className="lesson-info">
                            <span className="lesson-number">{index + 1}.</span>
                            <span className="lesson-title">{lesson.title}</span>
                            <span className="lesson-type">({lesson.type})</span>
                            <span className="lesson-duration">{lesson.duration}min</span>
                          </div>
                          <button onClick={() => {
                            setCurrentModule({
                              ...currentModule,
                              lessons: currentModule.lessons?.filter((_, i) => i !== index)
                            });
                          }}>Remove</button>
                        </div>
                      ))}
                    </div>

                    {!showLessonForm && (
                      <button onClick={() => setShowLessonForm(true)} className="add-lesson-btn">
                        + Add Lesson
                      </button>
                    )}

                    {showLessonForm && (
                      <div className="lesson-form">
                        <h5>Add New Lesson</h5>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Lesson Title</label>
                            <input
                              type="text"
                              value={currentLesson.title}
                              onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                              placeholder="What is Bitcoin?"
                            />
                          </div>

                          <div className="form-group">
                            <label>Lesson Type</label>
                            <select
                              value={currentLesson.type}
                              onChange={(e) => setCurrentLesson({ ...currentLesson, type: e.target.value as 'video' | 'text' | 'interactive' | 'assignment' })}
                            >
                              <option value="text">Text Content</option>
                              <option value="video">Video</option>
                              <option value="interactive">Interactive</option>
                              <option value="assignment">Assignment</option>
                            </select>
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
                              min="1"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Content {currentLesson.type === 'video' ? '(Video URL)' : ''}</label>
                          <textarea
                            value={currentLesson.content}
                            onChange={(e) => setCurrentLesson({ ...currentLesson, content: e.target.value })}
                            rows={6}
                            placeholder={
                              currentLesson.type === 'video' 
                                ? 'https://youtube.com/watch?v=...' 
                                : 'Enter your lesson content here...'
                            }
                          />
                        </div>

                        <div className="lesson-form-actions">
                          <button onClick={handleAddLesson} className="save-btn">Add Lesson</button>
                          <button onClick={() => setShowLessonForm(false)} className="cancel-btn">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="module-form-actions">
                    <button onClick={handleAddModule} className="save-btn">
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
                    }} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>Content Creation Tools</h2>
            <div className="content-tools">
              <div className="tool-card">
                <h3>📝 Rich Text Editor</h3>
                <p>Create engaging text content with formatting, images, and links.</p>
                <button className="tool-btn">Open Editor</button>
              </div>
              <div className="tool-card">
                <h3>🎥 Video Integration</h3>
                <p>Embed videos from YouTube, Vimeo, or upload directly.</p>
                <button className="tool-btn">Add Video</button>
              </div>
              <div className="tool-card">
                <h3>🧩 Interactive Elements</h3>
                <p>Add quizzes, simulations, and interactive exercises.</p>
                <button className="tool-btn">Create Interactive</button>
              </div>
              <div className="tool-card">
                <h3>📊 Assessments</h3>
                <p>Design quizzes and assignments to test understanding.</p>
                <button className="tool-btn">Create Quiz</button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Review & Publish</h2>
            
            <div className="course-preview">
              <div className="preview-header">
                <h3>Course Preview</h3>
                <div className="preview-stats">
                  <span>{modules.length} modules</span>
                  <span>{modules.reduce((acc, mod) => acc + mod.lessons.length, 0)} lessons</span>
                  <span>{courseData.estimatedHours}h estimated</span>
                </div>
              </div>

              <div className="course-summary">
                <h4>{courseData.title}</h4>
                <p>{courseData.description}</p>
                
                <div className="course-details">
                  <div className="detail-item">
                    <strong>Category:</strong> {courseData.category}
                  </div>
                  <div className="detail-item">
                    <strong>Difficulty:</strong> {courseData.difficulty}
                  </div>
                  <div className="detail-item">
                    <strong>Price:</strong> {courseData.price > 0 ? `${courseData.price} BSV` : 'Free'}
                  </div>
                </div>

                <div className="modules-summary">
                  <h5>Course Structure:</h5>
                  {modules.map((module, index) => (
                    <div key={module.id} className="module-summary">
                      <strong>Module {index + 1}: {module.title}</strong>
                      <span>({module.lessons.length} lessons)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="publish-options">
                <div className="publish-option">
                  <input type="radio" id="draft" name="publish" value="draft" defaultChecked />
                  <label htmlFor="draft">
                    <strong>Save as Draft</strong>
                    <span>Course will be saved but not visible to students</span>
                  </label>
                </div>
                <div className="publish-option">
                  <input type="radio" id="publish" name="publish" value="publish" />
                  <label htmlFor="publish">
                    <strong>Publish Immediately</strong>
                    <span>Course will be available to students right away</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="enhanced-course-creator">
      <div className="creator-header">
        <h1>Create New Course</h1>
        <button onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>

      <div className="creator-progress">
        <div className="steps-nav">
          {steps.map((step) => (
            <button
              key={step.id}
              className={`step-btn ${activeStep === step.id ? 'active' : ''} ${activeStep > step.id ? 'completed' : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              <span className="step-icon">{step.icon}</span>
              <span className="step-title">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="creator-content">
        {renderStepContent()}
      </div>

      <div className="creator-actions">
        <div className="nav-buttons">
          {activeStep > 1 && (
            <button 
              onClick={() => setActiveStep(activeStep - 1)}
              className="nav-btn prev"
            >
              ← Previous
            </button>
          )}
          
          {activeStep < 4 ? (
            <button 
              onClick={() => setActiveStep(activeStep + 1)}
              className="nav-btn next"
            >
              Next →
            </button>
          ) : (
            <button 
              onClick={handleCreateCourse}
              className="create-btn"
            >
              Create Course
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCourseCreator;