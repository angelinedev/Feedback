# **App Name**: FeedLoop v2

## Core Features:

- Admin Authentication: Secure admin login using static credentials (`ID: 'admin'`, `Password: 'admin'`).
- Student Authentication: Student login validated against the database using a 16-digit `register_number` and password.
- Faculty Authentication: Faculty login validated against the database using a 3-4 digit `faculty_id` and password.
- Data Management (CRUD): A dedicated Admin interface (`Data Management` view) for complete control over core data:

  - Student CRUD: Admin must be able Add, Edit, and Remove individual student records. Validation must enforce the 16-digit format for `register_number`.

  - Faculty CRUD: Admin must be able Add, Edit, and Remove individual faculty records. Validation must enforce the 3-4 digit format for `faculty_id`.

  - Question CRUD: Admin must be able Add, Edit, and Remove the student feedback criteria (e.g., Clarity, Punctuality). The system must support a minimum of 6 criteria.

  - Bulk Upload Placeholder: Include a clear UI section demonstrating the required Excel/CSV headers for the `students`, `faculty`, and `classFacultyMapping` tables for semester bulk updates.
- Class-Based Mapping: The system must use the `classFacultyMapping` collection as the central timetable to determine which faculty and subjects are visible to which students based on their `class_name`.
- Dynamic Feedback Forms (Student View): When a student logs in, they only see forms for the faculty and subjects assigned to their specific class.

Forms must use a 1-5 Star Rating for the 6 criteria and include an optional, open-ended Anonymous Comment text area.

Submission Control: Forms must be marked as "Submitted" and disabled after a single successful submission for that faculty/subject pair.
- Faculty Report Generation (Confidential): Faculty can log in and view reports for only their classes/subjects. Reports must include:

  - Bar Chart: Visualizing the average score for each of the 6 feedback criteria.

  - Response Rate Pie Chart: Showing the ratio of submitted feedback versus the total number of students in the class.

  - Anonymous Comments Display: A dedicated area to display text comments in a randomized order and without any associated metadata (like date or student identifier) to maintain strict anonymity.
- Analytics Dashboard (Admin View): Generate powerful visualizations using Recharts driven by aggregated database queries:

  - Comparative Bar Chart: Overall Average Rating by Department.

  - Outlier Bar Charts: Top 5 and Bottom 5 Faculty based on their composite overall average rating.

  - Trend Line Chart: College-wide overall average rating tracked over historical semesters.
- Firestore Integration: Store and retrieve all data using the mandated Firestore collections (`students`, `faculty`, `mapping`, `questions`, `feedback`).

## Style Guidelines:

- Use the 'Inter' sans-serif font for all text.
- Primary Color: Indigo (#4F669B) for a sophisticated and calm feel (e.g., header, primary buttons).
- Background Color: Dark gray (#222831) for the main canvas background.
- Accent Color: Cyan (#92AFD7) to highlight interactive elements, data points in charts, and key scores.
- Implement a fully responsive, mobile-first layout. Use deep shadows (shadow-2xl or shadow-inner) on data cards and containers to give an elevated, modern feel. Include subtle hover animations and smooth CSS transitions on buttons and navigation elements.
- Use sleek, modern `lucide-react` icons throughout the UI for navigation and data representation.
- Include subtle hover animations and smooth CSS transitions on buttons and navigation elements.