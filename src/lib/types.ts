export interface Student {
  id: string; // register_number
  register_number: string;
  name: string;
  password?: string;
  class_name: string;
}

export interface Faculty {
  id: string; // faculty_id
  faculty_id: string;
  name: string;
  password?: string;
  department: string;
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

export interface Feedback {
  id: string;
  student_id: string;
  faculty_id: string;
  class_name: string;
  subject: string;
  ratings: { question_id: string; rating: number }[];
  comment: string | null;
  semester: string;
  submitted_at: Date;
}
