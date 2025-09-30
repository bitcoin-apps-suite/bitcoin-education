// Bitcoin Education Course Service
// Manages courses on the blockchain

import { HandCashService } from './HandCashService';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  modules: CourseModule[];
  price: number; // in satoshis
  enrolledStudents: string[];
  createdAt: Date;
  updatedAt: Date;
  certificateTemplate?: string;
  blockchainTxId?: string;
  isPublished: boolean;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  thumbnail?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  quiz?: Quiz;
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'interactive' | 'assignment';
  content: string;
  resources?: Resource[];
  duration?: number; // in minutes
  order: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'download' | 'code';
  url: string;
}

export interface Quiz {
  id: string;
  questions: Question[];
  passingScore: number;
  attempts: number;
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
}

export interface StudentProgress {
  studentId: string;
  courseId: string;
  completedLessons: string[];
  quizScores: { quizId: string; score: number; attempts: number }[];
  certificateIssued: boolean;
  certificateTxId?: string;
  enrollmentDate: Date;
  completionDate?: Date;
  progressPercentage: number;
}

export interface Certificate {
  id: string;
  studentName: string;
  courseName: string;
  issueDate: Date;
  instructorName: string;
  blockchainTxId: string;
  verificationCode: string;
}

export class CourseService {
  private courses: Course[] = [];
  private studentProgress: Map<string, StudentProgress[]> = new Map();
  private handcashService: HandCashService;

  constructor(handcashService: HandCashService) {
    this.handcashService = handcashService;
    this.loadCourses();
  }

  private loadCourses(): void {
    // Load from localStorage or blockchain
    const stored = localStorage.getItem('courses');
    if (stored) {
      this.courses = JSON.parse(stored);
    }
  }

  private saveCourses(): void {
    localStorage.setItem('courses', JSON.stringify(this.courses));
  }

  // Course Management
  async createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'enrolledStudents'>): Promise<Course> {
    const newCourse: Course = {
      ...course,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      enrolledStudents: [],
      isPublished: false
    };

    this.courses.push(newCourse);
    this.saveCourses();

    // Store on blockchain if published
    if (course.isPublished) {
      await this.publishToBlockchain(newCourse);
    }

    return newCourse;
  }

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course | null> {
    const index = this.courses.findIndex(c => c.id === courseId);
    if (index === -1) return null;

    this.courses[index] = {
      ...this.courses[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveCourses();
    return this.courses[index];
  }

  async deleteCourse(courseId: string): Promise<boolean> {
    const index = this.courses.findIndex(c => c.id === courseId);
    if (index === -1) return false;

    this.courses.splice(index, 1);
    this.saveCourses();
    return true;
  }

  getCourse(courseId: string): Course | null {
    return this.courses.find(c => c.id === courseId) || null;
  }

  getAllCourses(): Course[] {
    return this.courses;
  }

  getPublishedCourses(): Course[] {
    return this.courses.filter(c => c.isPublished);
  }

  getCoursesByInstructor(instructorId: string): Course[] {
    return this.courses.filter(c => c.instructor === instructorId);
  }

  getCoursesByCategory(category: string): Course[] {
    return this.courses.filter(c => c.category === category);
  }

  // Student Enrollment
  async enrollStudent(courseId: string, studentId: string): Promise<boolean> {
    const course = this.getCourse(courseId);
    if (!course) return false;

    if (course.enrolledStudents.includes(studentId)) {
      return false; // Already enrolled
    }

    course.enrolledStudents.push(studentId);
    
    // Initialize student progress
    const progress: StudentProgress = {
      studentId,
      courseId,
      completedLessons: [],
      quizScores: [],
      certificateIssued: false,
      enrollmentDate: new Date(),
      progressPercentage: 0
    };

    if (!this.studentProgress.has(studentId)) {
      this.studentProgress.set(studentId, []);
    }
    this.studentProgress.get(studentId)!.push(progress);

    this.saveCourses();
    this.saveProgress();

    return true;
  }

  // Progress Tracking
  updateLessonProgress(studentId: string, courseId: string, lessonId: string): void {
    const progressList = this.studentProgress.get(studentId);
    if (!progressList) return;

    const progress = progressList.find(p => p.courseId === courseId);
    if (!progress) return;

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      progress.progressPercentage = this.calculateProgress(courseId, progress.completedLessons);
      this.saveProgress();
    }
  }

  recordQuizScore(studentId: string, courseId: string, quizId: string, score: number): void {
    const progressList = this.studentProgress.get(studentId);
    if (!progressList) return;

    const progress = progressList.find(p => p.courseId === courseId);
    if (!progress) return;

    const existingScore = progress.quizScores.find(q => q.quizId === quizId);
    if (existingScore) {
      existingScore.score = Math.max(existingScore.score, score);
      existingScore.attempts++;
    } else {
      progress.quizScores.push({ quizId, score, attempts: 1 });
    }

    this.saveProgress();
  }

  getStudentProgress(studentId: string, courseId: string): StudentProgress | null {
    const progressList = this.studentProgress.get(studentId);
    if (!progressList) return null;

    return progressList.find(p => p.courseId === courseId) || null;
  }

  getStudentCourses(studentId: string): Course[] {
    return this.courses.filter(c => c.enrolledStudents.includes(studentId));
  }

  // Certificate Management
  async issueCertificate(studentId: string, courseId: string, studentName: string): Promise<Certificate | null> {
    const course = this.getCourse(courseId);
    const progress = this.getStudentProgress(studentId, courseId);
    
    if (!course || !progress || progress.progressPercentage < 100) {
      return null;
    }

    const certificate: Certificate = {
      id: this.generateId(),
      studentName,
      courseName: course.title,
      issueDate: new Date(),
      instructorName: course.instructor,
      blockchainTxId: '',
      verificationCode: this.generateVerificationCode()
    };

    // Store on blockchain
    if (this.handcashService.isAuthenticated()) {
      try {
        const txId = await this.storeCertificateOnBlockchain(certificate);
        certificate.blockchainTxId = txId;
        progress.certificateTxId = txId;
        progress.certificateIssued = true;
        progress.completionDate = new Date();
      } catch (error) {
        console.error('Failed to store certificate on blockchain:', error);
      }
    }

    this.saveProgress();
    return certificate;
  }

  verifyCertificate(verificationCode: string): Certificate | null {
    // In a real implementation, this would verify against the blockchain
    // For now, we'll search in local storage
    const allCertificates = JSON.parse(localStorage.getItem('certificates') || '[]');
    return allCertificates.find((c: Certificate) => c.verificationCode === verificationCode) || null;
  }

  // Blockchain Integration
  private async publishToBlockchain(course: Course): Promise<string> {
    // Serialize course data
    const courseData = JSON.stringify({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      modules: course.modules.length,
      price: course.price,
      timestamp: Date.now()
    });

    // In a real implementation, this would use BSV SDK to store on chain
    // For now, simulate with a mock transaction ID
    const txId = 'mock_tx_' + this.generateId();
    course.blockchainTxId = txId;
    
    return txId;
  }

  private async storeCertificateOnBlockchain(certificate: Certificate): Promise<string> {
    // Serialize certificate data
    const certData = JSON.stringify({
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      issueDate: certificate.issueDate,
      instructorName: certificate.instructorName,
      verificationCode: certificate.verificationCode
    });

    // Mock blockchain storage
    const txId = 'cert_tx_' + this.generateId();
    
    // Store certificate locally as well
    const certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
    certificates.push({ ...certificate, blockchainTxId: txId });
    localStorage.setItem('certificates', JSON.stringify(certificates));
    
    return txId;
  }

  // Helper Methods
  private calculateProgress(courseId: string, completedLessons: string[]): number {
    const course = this.getCourse(courseId);
    if (!course) return 0;

    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    if (totalLessons === 0) return 0;

    return Math.round((completedLessons.length / totalLessons) * 100);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateVerificationCode(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private saveProgress(): void {
    const progressData: any = {};
    this.studentProgress.forEach((progress, studentId) => {
      progressData[studentId] = progress;
    });
    localStorage.setItem('studentProgress', JSON.stringify(progressData));
  }

  private loadProgress(): void {
    const stored = localStorage.getItem('studentProgress');
    if (stored) {
      const progressData = JSON.parse(stored);
      Object.entries(progressData).forEach(([studentId, progress]) => {
        this.studentProgress.set(studentId, progress as StudentProgress[]);
      });
    }
  }
}