
// This file contains all the data types for the application.

export interface Student {
  id: string;
  register_number: string;
  name: string;
  class_name: string;
  password?: string; // Optional because we don't always want to expose it
}

export interface Faculty {
  id: string;
  faculty_id: string;
  name:string;
  department: string;
  password?: string; // Optional
}

export interface Question {
  id: string;
  text: string;
  order: number;
}

export interface ClassFacultyMapping {
  id: string;
  class_name: string;
  faculty_id: string;
  subject: string;
}

export interface Rating {
  question_id: string;
  rating: number;
}

export interface Feedback {
  id: string;
  student_id: string;
  faculty_id: string;
  class_name: string;
  subject: string;
  ratings: Rating[];
  comment: string | null;
  semester: string;
  submitted_at: Date;
}

    