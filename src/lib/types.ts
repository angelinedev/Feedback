
export interface Student {
  id: string; // Corresponds to Firebase Auth UID
  register_number: string;
  name: string;
  class_name: string;
}

export interface Faculty {
  id: string; // Corresponds to Firebase Auth UID
  faculty_id: string;
  name:string;
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
