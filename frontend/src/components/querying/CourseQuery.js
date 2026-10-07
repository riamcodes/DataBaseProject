import React, { useState } from 'react';
import axios from 'axios';

function CourseQuery() {
    const [courseId, setCourseId] = useState('');
    const [startSemester, setStartSemester] = useState('');
    const [endSemester, setEndSemester] = useState('');
    const [sections, setSections] = useState([]);
    const [error, setError] = useState('');

    const semesterRegex = /^(Fall|Spring|Summer) \d{4}$/;

    const validateSemesters = () => {
        if (!semesterRegex.test(startSemester)) {
            setError('Start Semester must be in the format "Fall YYYY", "Spring YYYY", or "Summer YYYY".');
            return false;
        }
        if (!semesterRegex.test(endSemester)) {
            setError('End Semester must be in the format "Fall YYYY", "Spring YYYY", or "Summer YYYY".');
            return false;
        }
        return true;
    };

    const fetchCourseSections = async () => {
        if (!courseId || !startSemester || !endSemester) {
            setError('Please fill out all fields.');
            return;
        }
        if (!validateSemesters()) {
            return;
        }
        setError('');
        try {
            const response = await axios.get(`http://localhost:5000/course/${courseId}/sections`, {
                params: { start_semester: startSemester, end_semester: endSemester },
            });
            setSections(response.data);
        } catch (err) {
            setError('Failed to fetch sections. Please check the input values.');
        }
    };

    return (
        <div className="course-query">
            <h2>Query Sections by Course</h2>
            <div>
                <label>Course ID:</label>
                <input
                    type="text"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="Enter Course ID"
                />
            </div>
            <div>
                <label>Start Semester:</label>
                <input
                    type="text"
                    value={startSemester}
                    onChange={(e) => setStartSemester(e.target.value)}
                    placeholder="e.g., Fall 2022"
                />
            </div>
            <div>
                <label>End Semester:</label>
                <input
                    type="text"
                    value={endSemester}
                    onChange={(e) => setEndSemester(e.target.value)}
                    placeholder="e.g., Spring 2023"
                />
            </div>
            <button onClick={fetchCourseSections}>Fetch Sections</button>
            {error && <p className="error-message">{error}</p>}
            <div className="query-results">
                <h3>Sections:</h3>
                {sections.length > 0 ? (
                    <ul>
                        {sections.map((section) => (
                            <li key={section.section_id}>
                                Section ID: {section.section_id}, Semester: {section.semester}, Enrollment: {section.enrollment_count}, Instructor ID: {section.instructor_id}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No sections found.</p>
                )}
            </div>
        </div>
    );
}

export default CourseQuery;
