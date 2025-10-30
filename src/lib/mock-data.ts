import type { Student, Faculty, Question, ClassFacultyMapping, Feedback } from './types';

export const mockStudents: Student[] = [
  { id: '1', register_number: '1111222233334441', name: 'Alice Johnson', password: 'password123', class_name: 'CS-A' },
  { id: '2', register_number: '1111222233334442', name: 'Bob Williams', password: 'password123', class_name: 'CS-A' },
  { id: '3', register_number: '1111222233334443', name: 'Charlie Brown', password: 'password123', class_name: 'CS-B' },
  { id: '4', register_number: '1111222233334444', name: 'Diana Miller', password: 'password123', class_name: 'EC-A' },
  { id: '5', register_number: '1111222233334445', name: 'Ethan Davis', password: 'password123', class_name: 'EC-A' },
];

export const mockFaculty: Faculty[] = [
  { id: '101', faculty_id: '101', name: 'Dr. Evelyn Reed', password: 'password123', department: 'Computer Science' },
  { id: '102', faculty_id: '102', name: 'Prof. Samuel Green', password: 'password123', department: 'Computer Science' },
  { id: '201', faculty_id: '201', name: 'Dr. Olivia White', password: 'password123', department: 'Electronics' },
  { id: '202', faculty_id: '202', name: 'Prof. David Black', password: 'password123', department: 'Electronics' },
];

export const mockQuestions: Question[] = [
  { id: 'q1', text: 'Clarity of explanation', order: 1 },
  { id: 'q2', text: 'Punctuality and regularity', order: 2 },
  { id: 'q3', text: 'Subject knowledge', order: 3 },
  { id: 'q4', text: 'Interaction and engagement with students', order: 4 },
  { id: 'q5', text: 'Quality of learning materials provided', order: 5 },
  { id: 'q6', text: 'Fairness in evaluation', order: 6 },
];

export const mockClassFacultyMapping: ClassFacultyMapping[] = [
  { id: 'map1', class_name: 'CS-A', faculty_id: '101', subject: 'Data Structures' },
  { id: 'map2', class_name: 'CS-A', faculty_id: '102', subject: 'Algorithms' },
  { id: 'map3', class_name: 'CS-B', faculty_id: '101', subject: 'Database Management' },
  { id: 'map4', class_name: 'EC-A', faculty_id: '201', subject: 'Digital Circuits' },
  { id: 'map5', class_name: 'EC-A', faculty_id: '202', subject: 'Signal Processing' },
];

export const mockFeedback: Feedback[] = [
    {
        id: 'fb1',
        student_id: '2', // Bob Williams
        faculty_id: '101', // Dr. Evelyn Reed
        class_name: 'CS-A',
        subject: 'Data Structures',
        ratings: [
            { question_id: 'q1', rating: 5 },
            { question_id: 'q2', rating: 5 },
            { question_id: 'q3', rating: 4 },
            { question_id: 'q4', rating: 5 },
            { question_id: 'q5', rating: 4 },
            { question_id: 'q6', rating: 5 },
        ],
        comment: 'Dr. Reed is an excellent teacher. The concepts were made very clear.',
        semester: 'Fall 2023',
        submitted_at: new Date('2023-11-15T10:00:00Z'),
    },
    // Add more mock feedback to make reports more interesting
];
