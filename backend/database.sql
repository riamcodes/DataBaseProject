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
