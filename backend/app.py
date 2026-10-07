from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
import config as config

app = Flask(__name__)
CORS(app)

# Database Credentials
app.config['MYSQL_HOST'] = config.MYSQL_HOST
app.config['MYSQL_USER'] = config.MYSQL_USER
app.config['MYSQL_PASSWORD'] = config.MYSQL_PASSWORD
app.config['MYSQL_DB'] = config.MYSQL_DB

mysql = MySQL(app)

# Degrees - GET
@app.route('/degrees', methods=['GET'])
def get_degrees():
    try:
        cursor = mysql.connection.cursor()

        cursor.execute("SELECT degree_id, name, level FROM Degree")
        degrees = cursor.fetchall()

        degree_list = [
            {
                'id': row[0],  # degree_id
                'name': row[1],  # name
                'level': row[2]  # level
            }
            for row in degrees
        ]

        cursor.close()
        return jsonify(degree_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Degrees - GET Courses
@app.route('/degree/<int:degree_id>/courses', methods=['GET'])
def get_degree_courses(degree_id):
    try:
        cursor = mysql.connection.cursor()
        query = """
            SELECT Course.course_id, Course.name, DegreeCourse.core 
            FROM Course
            INNER JOIN DegreeCourse ON Course.course_id = DegreeCourse.course_id
            WHERE DegreeCourse.degree_id = %s
        """
        cursor.execute(query, (degree_id,))
        results = cursor.fetchall()
        courses = [{'course_id': row[0], 'name': row[1], 'core': bool(row[2])} for row in results]
        cursor.close()
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Degrees - GET Sections
@app.route('/degree/<int:degree_id>/sections', methods=['GET'])
def get_degree_sections(degree_id):
    start_semester = request.args.get('start_semester')
    end_semester = request.args.get('end_semester')

    if not start_semester or not end_semester:
        return jsonify({'error': 'Both start_semester and end_semester are required.'}), 400

    try:
        cursor = mysql.connection.cursor()
        query = """
            SELECT Section.section_id, Section.semester, Section.enrollment_count, Course.name AS course_name
            FROM Section
            INNER JOIN Course ON Section.course_id = Course.course_id
            INNER JOIN DegreeCourse ON Course.course_id = DegreeCourse.course_id
            WHERE DegreeCourse.degree_id = %s
            AND Section.semester BETWEEN %s AND %s
            ORDER BY Section.semester
        """
        cursor.execute(query, (degree_id, start_semester, end_semester))
        results = cursor.fetchall()
        sections = [
            {
                'section_id': row[0],
                'semester': row[1],
                'enrollment_count': row[2],
                'course_name': row[3],
            }
            for row in results
        ]
        cursor.close()
        return jsonify(sections), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Degrees - GET Goals
@app.route('/degree/<int:degree_id>/goals', methods=['GET'])
def get_degree_goals(degree_id):
    try:
        cursor = mysql.connection.cursor()
        query = """
            SELECT goal_code, description
            FROM Goal
            WHERE degree_id = %s
        """
        cursor.execute(query, (degree_id,))
        results = cursor.fetchall()
        goals = [{'goal_code': row[0], 'description': row[1]} for row in results]
        cursor.close()
        return jsonify(goals), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Degrees - GET Courses for Specific Goals
@app.route('/degree/<int:degree_id>/goal-courses', methods=['POST'])
def get_courses_by_goals(degree_id):
    data = request.json
    goal_codes = data.get('goal_codes')

    if not goal_codes:
        return jsonify({'error': 'goal_codes is required.'}), 400

    try:
        cursor = mysql.connection.cursor()
        query = """
            SELECT DISTINCT Course.course_id, Course.name
            FROM Course
            INNER JOIN CourseGoal ON Course.course_id = CourseGoal.course_id
            WHERE CourseGoal.degree_id = %s AND CourseGoal.goal_code IN %s
        """
        cursor.execute(query, (degree_id, tuple(goal_codes)))
        results = cursor.fetchall()
        courses = [{'course_id': row[0], 'name': row[1]} for row in results]
        cursor.close()
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Degrees - POST
@app.route('/degrees', methods=['POST'])
def post_degrees():
    data = request.json
    if 'name' not in data or 'level' not in data:
        return jsonify({'error': 'Missing required fields: name, level'}), 400

    cursor = mysql.connection.cursor()
    query = "INSERT INTO Degree (name, level) VALUES (%s, %s)"
    cursor.execute(query, (data['name'], data['level']))
    mysql.connection.commit()
    cursor.close()
    return jsonify({'message': 'Degree added successfully'}), 201

# Courses - GET
@app.route('/courses', methods=['GET'])
def get_courses():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM Course")
    courses = cursor.fetchall()
    cursor.close()
    return jsonify(courses)

# Course - GET Sections
@app.route('/course/<string:course_id>/sections', methods=['GET'])
def get_course_sections(course_id):
    start_semester = request.args.get('start_semester')
    end_semester = request.args.get('end_semester')

    if not start_semester or not end_semester:
        return jsonify({'error': 'Both start_semester and end_semester are required.'}), 400

    try:
        cursor = mysql.connection.cursor()
        query = """
            SELECT section_id, semester, enrollment_count, instructor_id
            FROM Section
            WHERE course_id = %s AND semester BETWEEN %s AND %s
            ORDER BY semester
        """
        cursor.execute(query, (course_id, start_semester, end_semester))
        results = cursor.fetchall()

        sections = [
            {
                'section_id': row[0],
                'semester': row[1],
                'enrollment_count': row[2],
                'instructor_id': row[3]
            }
            for row in results
        ]

        cursor.close()
        return jsonify(sections), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Courses - POST
@app.route('/courses', methods=['POST'])
def post_courses():
    data = request.json
    if 'course_id' not in data or 'name' not in data:
        return jsonify({'error': 'Missing required fields: course_id, name'}), 400

    cursor = mysql.connection.cursor()
    query = "INSERT INTO Course (course_id, name) VALUES (%s, %s)"
    cursor.execute(query, (data['course_id'], data['name']))
    mysql.connection.commit()
    cursor.close()
    return jsonify({'message': 'Course added successfully'}), 201

# Degree-Courses - POST
@app.route('/degree-course', methods=['POST'])
def add_degree_course():
    data = request.json
    degree_id = data.get('degree_id')
    course_id = data.get('course_id')
    core = 1 if data.get('core', False) else 0

    if not degree_id or not course_id:
        return jsonify({'error': 'Degree ID and Course ID are required.'}), 400

    try:
        cursor = mysql.connection.cursor()
        query = """
            INSERT INTO DegreeCourse (degree_id, course_id, core)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (degree_id, course_id, core))
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Degree and Course associated successfully.'}), 200
    except Exception as e:
        if 'foreign key' in str(e).lower():
            if 'degree_id' in str(e).lower():
                return jsonify({'error': 'Foreign key constraint violation: Invalid Degree ID.'}), 400
            elif 'course_id' in str(e).lower():
                return jsonify({'error': 'Foreign key constraint violation: Invalid Course ID.'}), 400
        return jsonify({'error': str(e)}), 500


# Instructors - GET
@app.route('/instructors', methods=['GET'])
def get_instructors():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM Instructor")
    instructors = cursor.fetchall()
    cursor.close()
    return jsonify(instructors)

# Instructors - POST
@app.route('/instructors', methods=['POST'])
def post_instructors():
    data = request.json
    if 'instructor_id' not in data or 'name' not in data:
        return jsonify({'error': 'Missing required fields: instructor_id, name'}), 400

    cursor = mysql.connection.cursor()
    query = "INSERT INTO Instructor (instructor_id, name) VALUES (%s, %s)"
    cursor.execute(query, (data['instructor_id'], data['name']))
    mysql.connection.commit()
    cursor.close()
    return jsonify({'message': 'Instructor added successfully'}), 201

# Sections - GET
@app.route('/sections', methods=['GET'])
def get_sections():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM Section")
    sections = cursor.fetchall()
    cursor.close()
    return jsonify(sections)

# Sections - POST
@app.route('/sections', methods=['POST'])
def post_sections():
    data = request.json
    required_fields = ['course_id', 'section_number', 'semester', 'enrollment_count', 'instructor_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': f'Missing required fields: {", ".join(required_fields)}'}), 400

    try:
        cursor = mysql.connection.cursor()
        query = """
            INSERT INTO Section (course_id, section_number, semester, enrollment_count, instructor_id)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (data['course_id'], data['section_number'], data['semester'], data['enrollment_count'], data['instructor_id']))
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Section added successfully'}), 201
    except Exception as e:
        if 'foreign key' in str(e).lower():
            if 'course_id' in str(e).lower():
                return jsonify({'error': 'Foreign key constraint violation: Invalid Course ID.'}), 400
            elif 'instructor_id' in str(e).lower():
                return jsonify({'error': 'Foreign key constraint violation: Invalid Instructor ID.'}), 400
        return jsonify({'error': str(e)}), 500

# Goals - POST
@app.route('/goals', methods=['POST'])
def goals():
    data = request.json
    required_fields = ['degree_id', 'goal_code', 'description']
    if not all(field in data for field in required_fields):
        return jsonify({'error': f'Missing required fields: {", ".join(required_fields)}'}), 400

    try:
        cursor = mysql.connection.cursor()
        query = "INSERT INTO Goal (degree_id, goal_code, description) VALUES (%s, %s, %s)"
        cursor.execute(query, (data['degree_id'], data['goal_code'], data['description']))
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Goal added successfully'}), 201
    except Exception as e:
        if 'foreign key' in str(e).lower():
            return jsonify({'error': 'Foreign key constraint violation: Invalid Degree ID.'}), 400
        # TODO
        elif 'degree_id' in str(e).lower():
            return jsonify({'error': 'Foreign key constraint violation: Invalid Degree ID.'}), 400
        return jsonify({'error': str(e)}), 500

# CourseGoals - POST
@app.route('/course-goals', methods=['POST'])
def associate_course_goal():
    data = request.json
    if not all(key in data for key in ['course_id', 'goal_code', 'degree_id']):
        return jsonify({'error': 'Missing required fields: course_id, goal_code, degree_id'}), 400

    course_id = data['course_id']
    goal_code = data['goal_code']
    degree_id = data['degree_id']

    try:
        cursor = mysql.connection.cursor()
        query = """
            INSERT INTO CourseGoal (course_id, goal_code, degree_id)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (course_id, goal_code, degree_id))
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Course successfully associated with goal.'}), 201
    except Exception as e:
        if 'foreign key' in str(e).lower():
            if 'course_id' in str(e).lower():
                return jsonify({'error': 'Foreign key constraint violation: Invalid Course ID.'}), 400
            elif 'coursegoal_ibfk_2' in str(e).lower():
                return jsonify({
                    'error': 'Foreign key constraint violation: Invalid combination of Degree ID and Goal Code.'
                }), 400
        # TODO - same as above
        elif 'degree_id' in str(e).lower():
            return jsonify({'error': 'Foreign key constraint violation: Invalid Degree ID.'}), 400
        return jsonify({'error': str(e)}), 500

#
## Evaluation Management
#

# Goals by Section and Degree - GET
@app.route('/evaluations/goals/<string:section_id>', methods=['GET'])
def get_goals_for_section_and_degree(section_id):
    degree_id = request.args.get('degree_id')
    if not degree_id:
        return jsonify({'error': 'Degree ID is required.'}), 400
    try:
        cursor = mysql.connection.cursor()
        query = """
            SELECT Goal.degree_id, Goal.goal_code, Goal.description
            FROM Goal
            INNER JOIN CourseGoal ON Goal.goal_code = CourseGoal.goal_code
            WHERE CourseGoal.course_id = (
                SELECT course_id FROM Section WHERE section_id = %s
            ) AND CourseGoal.degree_id = %s
        """
        cursor.execute(query, (section_id, degree_id))
        goals = cursor.fetchall()
        cursor.close()

        return jsonify([{'degree_id': goal[0], 'goal_code': goal[1], 'description': goal[2]} for goal in goals]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Instructors - GET Sections - can include semesters or not
@app.route('/instructor/<string:instructor_id>/sections', methods=['GET'])
def get_instructor_sections(instructor_id):
    semester = request.args.get('semester')
    start_semester = request.args.get('start_semester')
    end_semester = request.args.get('end_semester')

    cursor = mysql.connection.cursor()

    if semester:
        query = """
            SELECT DISTINCT Section.section_id, Section.course_id, Section.semester,
                   Section.enrollment_count,
                   CASE WHEN Evaluation.goal_code IS NOT NULL THEN 'Entered'
                        ELSE 'Not Entered' END AS evaluation_status
            FROM Section
            LEFT JOIN Evaluation ON Section.section_id = Evaluation.section_id
            WHERE Section.instructor_id = %s AND Section.semester = %s
        """
        cursor.execute(query, (instructor_id, semester))
        sections = cursor.fetchall()
        cursor.close()

        return jsonify([
            {
                'section_id': row[0],
                'course_id': row[1],
                'semester': row[2],
                'enrollment_count': row[3],
                'evaluation_status': row[4]
            }
            for row in sections
        ]), 200

    elif start_semester and end_semester:
        query = """
            SELECT section_id, course_id, semester, enrollment_count, instructor_id
            FROM Section
            WHERE instructor_id = %s AND semester BETWEEN %s AND %s
            ORDER BY semester
        """
        cursor.execute(query, (instructor_id, start_semester, end_semester))
        sections = cursor.fetchall()
        cursor.close()

        return jsonify([
            {
                'section_id': row[0],
                'course_id': row[1],
                'semester': row[2],
                'enrollment_count': row[3],
                'instructor_id': row[4]
            }
            for row in sections
        ]), 200

    else:
        cursor.close()
        return jsonify({'error': 'Either "semester" or both "start_semester" and "end_semester" are required.'}), 400


# Evaluations by Section - GET
@app.route('/evaluations/<int:section_id>', methods=['GET'])
def get_evaluation_data(section_id):
    try:
        cursor = mysql.connection.cursor()
        query = """
            SELECT degree_id, goal_code, evaluation_type, A, B, C, F, improvement_suggestion
            FROM Evaluation
            WHERE section_id = %s
        """
        cursor.execute(query, (section_id,))
        evaluations = cursor.fetchall()
        cursor.close()

        return jsonify([
            {
                'degree_id': row[0],
                'goal_code': row[1],
                'method': row[2],
                'A': row[3],
                'B': row[4],
                'C': row[5],
                'F': row[6],
                'improvement_text': row[7]
            }
            for row in evaluations
        ]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Evaluation - evaluation status - GET
@app.route('/semester/<string:semester>/evaluations', methods=['GET'])
def get_evaluation_status(semester):
    try:
        cursor = mysql.connection.cursor()

        query = """
            SELECT 
                Section.section_id,
                Section.course_id,
                Section.semester,
                Evaluation.degree_id,
                Evaluation.goal_code,
                Evaluation.evaluation_type,
                Evaluation.A,
                Evaluation.B,
                Evaluation.C,
                Evaluation.F,
                Evaluation.improvement_suggestion,
                COUNT(DISTINCT CourseGoal.goal_code) AS total_goals,
                COUNT(DISTINCT Evaluation.goal_code) AS evaluated_goals,
                COUNT(DISTINCT CASE WHEN Evaluation.improvement_suggestion IS NOT NULL THEN Evaluation.section_id END) AS improvement_entered
            FROM Section
            INNER JOIN CourseGoal ON Section.course_id = CourseGoal.course_id
            LEFT JOIN Evaluation ON Section.section_id = Evaluation.section_id
                                  AND CourseGoal.goal_code = Evaluation.goal_code
            WHERE Section.semester = %s
            GROUP BY 
                Section.section_id, 
                Section.course_id, 
                Section.semester, 
                Evaluation.degree_id, 
                Evaluation.goal_code, 
                Evaluation.evaluation_type, 
                Evaluation.A, 
                Evaluation.B, 
                Evaluation.C, 
                Evaluation.F, 
                Evaluation.improvement_suggestion
        """
        cursor.execute(query, (semester,))
        results = cursor.fetchall()

        evaluations = []
        for row in results:
            total_goals = row[11]
            evaluated_goals = row[12]
            improvement_entered = row[13] > 0

            if evaluated_goals == 0:
                eval_status = "Not Entered"
            elif evaluated_goals < total_goals:
                eval_status = "Partially Entered"
            else:
                eval_status = "Entered"

            evaluations.append({
                'section_id': row[0],
                'course_id': row[1],
                'semester': row[2],
                'degree_id': row[3],
                'goal_code': row[4],
                'evaluation_type': row[5],
                'A': row[6],
                'B': row[7],
                'C': row[8],
                'F': row[9],
                'improvement_suggestion': row[10],
                'total_goals': total_goals,
                'evaluated_goals': evaluated_goals,
                'improvement_entered': "Yes" if improvement_entered else "No",
                'eval_status': eval_status,
            })

        cursor.close()
        return jsonify(evaluations), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Evaluations - passing sections - GET
@app.route('/semester/<string:semester>/passing-percentage', methods=['POST'])
def get_passing_sections(semester):
    data = request.json
    percentage = data.get('percentage')

    if percentage is None or not isinstance(percentage, (float, int)) or percentage < 0 or percentage > 100:
        return jsonify({'error': 'Percentage must be a number between 0 and 100.'}), 400

    try:
        cursor = mysql.connection.cursor()

        query = """
            SELECT 
                Section.section_id,
                Section.course_id,
                Section.semester,
                Evaluation.degree_id,
                Evaluation.goal_code,
                CASE 
                    WHEN SUM(Evaluation.A + Evaluation.B + Evaluation.C + Evaluation.F) > 0 THEN 
                        (SUM(Evaluation.A + Evaluation.B + Evaluation.C) / 
                         SUM(Evaluation.A + Evaluation.B + Evaluation.C + Evaluation.F)) * 100
                    ELSE 0
                END AS passing_percentage
            FROM Section
            INNER JOIN Evaluation ON Section.section_id = Evaluation.section_id
            WHERE Section.semester = %s
            GROUP BY Section.section_id, Section.course_id, Section.semester, Evaluation.degree_id, Evaluation.goal_code
            HAVING passing_percentage >= %s
        """
        cursor.execute(query, (semester, percentage))
        results = cursor.fetchall()

        passing_sections = [
            {
                'section_id': row[0],
                'course_id': row[1],
                'semester': row[2],
                'degree_id': row[3],
                'goal_code': row[4],
                'passing_percentage': round(row[5], 2)
            }
            for row in results
        ]

        cursor.close()
        return jsonify(passing_sections), 200
    except Exception as e:
        return jsonify({'error': f"Internal Server Error: {str(e)}"}), 500

# Evaluations - POST
@app.route('/evaluations', methods=['POST'])
def save_evaluations():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        section_id = data.get('section_id')
        degree_id = data.get('degree_id')
        evaluation_data = data.get('evaluation_data', {})
        improvement_text = data.get('improvement_text', '')

        if not section_id or not degree_id:
            return jsonify({'error': 'Section ID and Degree ID are required'}), 400

        cursor = mysql.connection.cursor()

        cursor.execute("SELECT enrollment_count FROM Section WHERE section_id = %s", (section_id,))
        enrollment_count = cursor.fetchone()
        if not enrollment_count:
            return jsonify({'error': 'Invalid section ID'}), 400
        enrollment_count = enrollment_count[0]

        total_evaluations = sum(
            (goal_data.get('A', 0) + goal_data.get('B', 0) + goal_data.get('C', 0) + goal_data.get('F', 0))
            for goal_data in evaluation_data.values()
        )
        if total_evaluations > enrollment_count:
            return jsonify({
                'error': f'Total evaluations ({total_evaluations}) exceed enrollment count ({enrollment_count}). Please adjust the data.'
            }), 400

        if any(
            grade < 0
            for goal_data in evaluation_data.values()
            for grade in [goal_data.get('A', 0), goal_data.get('B', 0), goal_data.get('C', 0), goal_data.get('F', 0)]
        ):
            return jsonify({'error': 'Grades (A, B, C, F) cannot be negative. Please enter valid numbers.'}), 400

        delete_query = "DELETE FROM Evaluation WHERE section_id = %s AND degree_id = %s"
        cursor.execute(delete_query, (section_id, degree_id))

        for goal_code, goal_data in evaluation_data.items():
            insert_query = """
                INSERT INTO Evaluation 
                (section_id, degree_id, goal_code, evaluation_type, A, B, C, F, improvement_suggestion)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (
                section_id,
                degree_id,
                goal_code,
                goal_data.get('method', ''),
                goal_data.get('A', 0),
                goal_data.get('B', 0),
                goal_data.get('C', 0),
                goal_data.get('F', 0),
                improvement_text,
            ))

        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Evaluation saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Duplicate Evaluations - POST
@app.route('/evaluations/duplicate', methods=['POST'])
def duplicate_evaluation_data():
    data = request.json
    section_id = data.get('section_id')
    course_id = data.get('course_id')
    source_degree_id = data.get('source_degree_id')
    target_degree_ids = data.get('target_degree_ids')

    if not section_id or not source_degree_id or not target_degree_ids or not course_id:
        return jsonify({'error': 'Section ID, Course ID, Source Degree ID, and Target Degree IDs are required.'}), 400

    try:
        cursor = mysql.connection.cursor()

        for target_degree_id in target_degree_ids:
            cursor.execute("""
                SELECT goal_code FROM CourseGoal
                WHERE course_id = %s AND degree_id = %s
            """, (course_id, target_degree_id))
            target_goals = [row[0] for row in cursor.fetchall()]

            cursor.execute("""
                SELECT goal_code, evaluation_type, A, B, C, F, improvement_suggestion
                FROM Evaluation
                WHERE section_id = %s AND degree_id = %s AND goal_code IN %s
            """, (section_id, source_degree_id, tuple(target_goals)))
            evaluations = cursor.fetchall()

            for eval_data in evaluations:
                cursor.execute("""
                    INSERT INTO Evaluation (section_id, degree_id, goal_code, evaluation_type, A, B, C, F, improvement_suggestion)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    evaluation_type = VALUES(evaluation_type), A = VALUES(A), B = VALUES(B),
                    C = VALUES(C), F = VALUES(F), improvement_suggestion = VALUES(improvement_suggestion)
                """, (
                    section_id,
                    target_degree_id,
                    eval_data[0],
                    eval_data[1],
                    eval_data[2],
                    eval_data[3],
                    eval_data[4],
                    eval_data[5],
                    eval_data[6],
                ))

        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Evaluation data duplicated successfully.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Courses - GET Degrees
@app.route('/course/<string:course_id>/degrees', methods=['GET'])
def get_course_degrees(course_id):
    try:
        cursor = mysql.connection.cursor()
        query = """
            SELECT Degree.degree_id, Degree.name
            FROM Degree
            INNER JOIN DegreeCourse ON Degree.degree_id = DegreeCourse.degree_id
            WHERE DegreeCourse.course_id = %s
        """
        cursor.execute(query, (course_id,))
        results = cursor.fetchall()
        degrees = [{'degree_id': row[0], 'name': row[1]} for row in results]
        cursor.close()
        return jsonify(degrees), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Evaluation - evaluation by section and degree - GET
@app.route('/evaluations/<int:section_id>/<int:degree_id>', methods=['GET'])
def get_evaluation_by_section_and_degree(section_id, degree_id):
    try:
        cursor = mysql.connection.cursor()

        query = """
            SELECT DISTINCT e.goal_code, e.evaluation_type as method, e.A, e.B, e.C, e.F, e.improvement_suggestion
            FROM Evaluation e
            WHERE e.section_id = %s AND e.degree_id = %s
        """
        cursor.execute(query, (section_id, degree_id))
        results = cursor.fetchall()
        
        if not results:
            return jsonify(None), 200

        evaluation_data = {}
        improvement_text = None
        
        for row in results:
            goal_code = row[0]
            evaluation_data[goal_code] = {
                'method': row[1],
                'A': row[2],
                'B': row[3],
                'C': row[4],
                'F': row[5]
            }
            if row[6] and not improvement_text:
                improvement_text = row[6]
        
        response_data = {
            'section_id': section_id,
            'degree_id': degree_id,
            'evaluation_data': evaluation_data,
            'improvement_text': improvement_text
        }
        
        cursor.close()
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
