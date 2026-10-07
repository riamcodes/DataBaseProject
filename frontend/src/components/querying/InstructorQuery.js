import React, { useState } from 'react';
import axios from 'axios';

function InstructorQuery() {
    const [instructorId, setInstructorId] = useState('');
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

    const fetchInstructorSections = async () => {
        if (!instructorId || !startSemester || !endSemester) {
            setError('Please fill out all fields.');
            return;
        }
        if (!validateSemesters()) {
            return;
        }
        setError('');
        try {
            const response = await axios.get(`http://localhost:5000/instructor/${instructorId}/sections`, {
                params: { start_semester: startSemester, end_semester: endSemester },
            });
            setSections(response.data);
        } catch (err) {
            setError('Failed to fetch sections. Please check the input values.');
        }
    };

    return (
        <div className="instructor-query">
            <h2>Query Sections by Instructor</h2>
            <div>
                <label>Instructor ID:</label>
                <input
                    type="text"
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    placeholder="Enter Instructor ID"
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
            <button onClick={fetchInstructorSections}>Fetch Sections</button>
            {error && <p className="error-message">{error}</p>}
            <div className="query-results">
                <h3>Sections:</h3>
                {sections.length > 0 ? (
                    <ul>
                        {sections.map((section) => (
                            <li key={section.section_id}>
                                Section ID: {section.section_id}, Course ID: {section.course_id}, Semester: {section.semester}, Enrollment: {section.enrollment_count}
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

export default InstructorQuery;
