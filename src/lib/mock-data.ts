import type { Student, Faculty, Question, ClassFacultyMapping, Feedback } from './types';

export const mockStudents: Student[] = [];

export const mockFaculty: Faculty[] = [];

export const mockQuestions: Question[] = [
  { id: 'q1', text: 'Clarity of explanation', order: 1 },
  { id: 'q2', text: 'Punctuality and regularity', order: 2 },
  { id: 'q3', text: 'Subject knowledge', order: 3 },
  { id: 'q4', text: 'Interaction and engagement with students', order: 4 },
  { id: 'q5', text: 'Quality of learning materials provided', order: 5 },
  { id: 'q6', text: 'Fairness in evaluation', order: 6 },
];

export const mockClassFacultyMapping: ClassFacultyMapping[] = [];

export const mockFeedback: Feedback[] = [];
