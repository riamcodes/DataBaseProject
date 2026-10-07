[README.md](https://github.com/user-attachments/files/33167528/README.md)
# CS 5330 Project - Program Evaluation Application

## Team Members

- **Logan Hight**
- **Logan Lu**
- **Ria Mukherji**

---

## Project Description

The Program Evaluation Application is designed to help universities evaluate their degree programs. This application enables the university to collect, store, and analyze relevant data for each degree program, including details about courses, instructors, sections, goals, and performance evaluations. The application offers a user-friendly interface for data entry and querying, allowing administrators and instructors to efficiently manage and review program data.

---

## Project Goals

1. **Data Entry and Management**: Simplify data entry and management for degree programs, courses, instructors, sections, and goals.
2. **Program Evaluation**: Allow instructors to enter performance evaluations, enabling tracking across various evaluation methods.
3. **Data Querying**: Provide querying capabilities to extract meaningful information, such as courses associated with a degree, sections taught by an instructor, and goals tied to each program.
4. **User-Friendly Interface**: Ensure ease of use through a responsive frontend built with React, supported by a Flask-based backend and a MySQL database.

---

## Features

### 1. **Data Entry**

- Add Degrees
- Add Courses
- Add Instructors
- Add Sections
- Add Goals
- Associate Courses with Goals
- Associate Courses with Degrees

### 2. **Evaluation Management**

- Enter evaluations for sections taught by instructors for specific semesters.
- View existing evaluations and modify them.
- Duplicate evaluations for courses associated with multiple degrees.

### 3. **Querying**

- Query data related to degrees, courses, instructors, and evaluations.
- Filter and fetch data based on specified criteria.
- Tab-based interface for seamless navigation between different query types.

---

## Technology Stack

- **Frontend**: React.js
- **Backend**: Python Flask
- **Database**: MySQL
- **Styling**: CSS3 with modular files for each page
- **Routing**: React Router DOM

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (for running the frontend)
- [Python 3](https://www.python.org/downloads/) (for the backend)
- [MySQL](https://www.mysql.com/downloads/) (for the database)

### Database Setup

1. **Install MySQL**: Ensure MySQL is installed and running.
2. **Create the Database**:
   - Open your MySQL client.
   - Run the following commands to create the database and tables:

   ```sql
   CREATE DATABASE IF NOT EXISTS db_project;

   USE db_project;

   -- Degree table stores information about academic programs
   CREATE TABLE IF NOT EXISTS Degree (
      degree_id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      level VARCHAR(20) NOT NULL,
      UNIQUE KEY degree_name_level (name, level)
   );

   -- Course table stores course information
   CREATE TABLE IF NOT EXISTS Course (
      course_id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(100) NOT NULL
   );

   -- Instructor table stores faculty information
   CREATE TABLE IF NOT EXISTS Instructor (
      instructor_id CHAR(8) PRIMARY KEY,
      name VARCHAR(100) NOT NULL
   );

   -- Section table stores information about course offerings
   CREATE TABLE IF NOT EXISTS Section (
      section_id INT PRIMARY KEY AUTO_INCREMENT,
      course_id VARCHAR(10) NOT NULL,
      instructor_id CHAR(8) NOT NULL,
      section_number CHAR(3) NOT NULL,
      semester VARCHAR(20) NOT NULL,
      enrollment_count INT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES Course(course_id),
      FOREIGN KEY (instructor_id) REFERENCES Instructor(instructor_id),
      UNIQUE KEY section_unique (course_id, section_number, semester)
   );

   -- Goal table stores program learning objectives with a composite key
   CREATE TABLE IF NOT EXISTS Goal (
      degree_id INT NOT NULL,
      goal_code CHAR(4) NOT NULL,
      description TEXT NOT NULL,
      PRIMARY KEY (degree_id, goal_code),
      FOREIGN KEY (degree_id) REFERENCES Degree(degree_id)
   );

   -- Evaluation table models the ternary relationship between Goal, Section, and Evaluation
   CREATE TABLE IF NOT EXISTS Evaluation (
      section_id INT NOT NULL,
      degree_id INT NOT NULL,
      goal_code CHAR(4) NOT NULL,
      evaluation_type VARCHAR(50) NOT NULL,
      A INT NOT NULL,
      B INT NOT NULL,
      C INT NOT NULL,
      F INT NOT NULL,
      improvement_suggestion TEXT,
      PRIMARY KEY (section_id, degree_id, goal_code, evaluation_type),
      FOREIGN KEY (section_id) REFERENCES Section(section_id),
      FOREIGN KEY (degree_id, goal_code) REFERENCES Goal(degree_id, goal_code)
   );

   -- Degree-Course relationship directly connects Degree and Course
   CREATE TABLE IF NOT EXISTS DegreeCourse (
      degree_id INT NOT NULL,
      course_id VARCHAR(10) NOT NULL,
      core TINYINT(1) NOT NULL DEFAULT 0,
      PRIMARY KEY (degree_id, course_id),
      FOREIGN KEY (degree_id) REFERENCES Degree(degree_id),
      FOREIGN KEY (course_id) REFERENCES Course(course_id)
   );

   -- Course-Goal relationship directly connects Course and Goal
   CREATE TABLE IF NOT EXISTS CourseGoal (
      course_id VARCHAR(10) NOT NULL,
      degree_id INT NOT NULL,
      goal_code CHAR(4) NOT NULL,
      PRIMARY KEY (course_id, degree_id, goal_code),
      FOREIGN KEY (course_id) REFERENCES Course(course_id),
      FOREIGN KEY (degree_id, goal_code) REFERENCES Goal(degree_id, goal_code)
   );
   ```
  
### Database Credentials:

   ```python
   MYSQL_HOST = 'localhost'
   MYSQL_USER = 'cs5330'
   MYSQL_PASSWORD = 'pw5330'
   MYSQL_DB = 'db_project'
   ```

### Backend Setup (Flask)

1. Navigate to the Backend Directory:

   ```bash
   cd CS-5330-Project/backend
   ```

2. Create a Virtual Environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. Install Dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run the Backend:

   ```bash
   python app.py
   ```

   The backend will start on `http://localhost:5000`.

### Frontend Setup (React)

1. Navigate to the Frontend Directory:

   ```bash
   cd CS-5330-Project/frontend
   ```

2. Install Dependencies:

   ```bash
   npm install
   npm install react-router-dom
   ```

3. Run the Frontend:

   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`.

---

## Project Structure

```
CS-5330-Project/
│
├── backend/
│   ├── app.py                  # Main Flask application
│   ├── config.py               # Database configuration
│   ├── database.sql            # SQL schema for MySQL
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── data-entry/             # Components for Data Entry
│   │   │   ├── evaluation-management/  # Components for Evaluation Management
│   │   │   └── querying/               # Components for Querying
│   │   ├── pages/
│   │   │   ├── DataEntryPage.js
│   │   │   ├── EvaluationManagementPage.js
│   │   │   └── QueryingPage.js
│   │   ├── App.js              # Main application entry point
│   │   └── App.css             # Global styles
│   └── package.json            # Node.js dependencies
│
└── README.md                   # Project documentation
```

## Access the Application

1. **Open the Application**:  
   Navigate to `http://localhost:3000` in your web browser.
2. **Using the Application**:
   - **Data Entry Page**:
      - Modular forms for entering degrees, courses, instructors, sections, and goals.
      - Styled with DataEntryPage.css for a clean and professional interface.
   - **Evaluation Management Page**:
      - Displays sections for instructors and allows evaluation entry or modification.
      - Includes options to duplicate evaluations across degrees.
      - Styled with EvaluationManagementPage.css.
   - **Querying Page**:
      - Tab-based navigation for degree, course, instructor, and evaluation queries.
      - Styled with QueryingPage.css for interactive buttons and content areas.
