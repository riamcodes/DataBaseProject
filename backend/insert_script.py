import random
import mysql.connector
from faker import Faker

# Database connection
connection = mysql.connector.connect(
    host="localhost",
    user="cs5330",
    password="pw5330",
    database="db_project"
)

cursor = connection.cursor()
faker = Faker()

def insert_degrees(n):
    for _ in range(n):
        name = faker.catch_phrase()
        level = random.choice(["Bachelor", "Master", "PhD", "Cert"])
        cursor.execute("INSERT INTO Degree (name, level) VALUES (%s, %s)", (name, level))
    connection.commit()
    print(f"Inserted {n} degrees.")

def insert_courses(n):
    for _ in range(n):
        course_id = faker.unique.bothify(text="??####")
        name = faker.bs().title()
        cursor.execute("INSERT INTO Course (course_id, name) VALUES (%s, %s)", (course_id, name))
    connection.commit()
    print(f"Inserted {n} courses.")

def insert_instructors(n):
    for _ in range(n):
        instructor_id = faker.unique.bothify(text="########")
        name = faker.name()
        cursor.execute("INSERT INTO Instructor (instructor_id, name) VALUES (%s, %s)", (instructor_id, name))
    connection.commit()
    print(f"Inserted {n} instructors.")

def insert_sections(n):
    for _ in range(n):
        course_id = random.choice(fetch_course_ids())
        section_number = random.randint(1, 10)
        semester = random.choice(["Spring 2023", "Summer 2023", "Fall 2023", "Spring 2024", "Summer 2024", "Fall 2024", "Spring 2025"])
        enrollment_count = random.randint(10, 50)
        instructor_id = random.choice(fetch_instructor_ids())
        cursor.execute(
            "INSERT INTO Section (course_id, section_number, semester, enrollment_count, instructor_id) VALUES (%s, %s, %s, %s, %s)",
            (course_id, section_number, semester, enrollment_count, instructor_id)
        )
    connection.commit()
    print(f"Inserted {n} sections.")

def insert_goals(n):
    for _ in range(n):
        degree_id = random.choice(fetch_degree_ids())
        goal_code = faker.unique.bothify(text="G###")
        description = faker.sentence(nb_words=8)
        cursor.execute("INSERT INTO Goal (degree_id, goal_code, description) VALUES (%s, %s, %s)", (degree_id, goal_code, description))
    connection.commit()
    print(f"Inserted {n} goals.")

def associate_courses_with_goals(n):
    for _ in range(n):
        course_id = random.choice(fetch_course_ids())
        goal_code, degree_id = random.choice(fetch_goal_codes_and_degrees())
        cursor.execute("INSERT INTO CourseGoal (course_id, goal_code, degree_id) VALUES (%s, %s, %s)", (course_id, goal_code, degree_id))
    connection.commit()
    print(f"Associated {n} courses with goals.")

def associate_courses_with_degrees(n):
    for _ in range(n):
        course_id = random.choice(fetch_course_ids())
        degree_id = random.choice(fetch_degree_ids())
        core = random.choice([0, 1])
        cursor.execute("INSERT INTO DegreeCourse (degree_id, course_id, core) VALUES (%s, %s, %s)", (degree_id, course_id, core))
    connection.commit()
    print(f"Associated {n} courses with degrees.")

def insert_evaluations(n):
    for _ in range(n):
        section_id = random.choice(fetch_section_ids())
        goal_code, degree_id = random.choice(fetch_goal_codes_and_degrees())
        evaluation_type = random.choice(["Homework", "Project", "Midterm", "Final", "Presentation"])
        num_a = random.randint(1, 10)
        num_b = random.randint(1, 10)
        num_c = random.randint(1, 10)
        num_f = random.randint(1, 10)
        improvement_suggestion = faker.sentence(nb_words=20)
        cursor.execute("INSERT INTO Evaluation (section_id, degree_id, goal_code, evaluation_type, A, B, C, F, improvement_suggestion) \
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                        (section_id, degree_id, goal_code, evaluation_type, num_a, num_b, num_c, num_f, improvement_suggestion))
    connection.commit()
    print(f"Inserted {n} evaluations.")

def fetch_degree_ids():
    cursor.execute("SELECT degree_id FROM Degree")
    return [row[0] for row in cursor.fetchall()]

def fetch_course_ids():
    cursor.execute("SELECT course_id FROM Course")
    return [row[0] for row in cursor.fetchall()]

def fetch_instructor_ids():
    cursor.execute("SELECT instructor_id FROM Instructor")
    return [row[0] for row in cursor.fetchall()]

def fetch_goal_codes_and_degrees():
    cursor.execute("SELECT goal_code, degree_id FROM Goal")
    return [(row[0], row[1]) for row in cursor.fetchall()]

def fetch_section_ids():
    cursor.execute("SELECT section_id FROM Section")
    return [row[0] for row in cursor.fetchall()]

try:
    insert_degrees(10)
    insert_courses(40)
    insert_instructors(20)
    insert_sections(30)
    insert_goals(30)
    associate_courses_with_goals(10)
    associate_courses_with_degrees(10)
    insert_evaluations(10)
except Exception as e:
    print("Error:", e)
finally:
    cursor.close()
    connection.close()
