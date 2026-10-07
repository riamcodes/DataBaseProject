import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DegreeQuery() {
    const [activeTab, setActiveTab] = useState('goals');
    const [degreeId, setDegreeId] = useState('');
    const [degrees, setDegrees] = useState([]);
    const [goalCodes, setGoalCodes] = useState('');
    const [startSemester, setStartSemester] = useState('');
    const [endSemester, setEndSemester] = useState('');
    const [goals, setGoals] = useState([]);
    const [courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);
    const [goalCourses, setGoalCourses] = useState([]);
    const [error, setError] = useState('');

    const semesterRegex = /^(Fall|Spring|Summer) \d{4}$/;

    useEffect(() => {
        axios
            .get('http://localhost:5000/degrees') // Backend endpoint
            .then((response) => setDegrees(response.data))
            .catch((err) => setError(`Error fetching degrees: ${err.message}`));
    }, []);

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

    const fetchGoals = async () => {
        if (!degreeId) {
            setError('Please select a Degree.');
            return;
        }
        setError('');
        try {
            const response = await axios.get(`http://localhost:5000/degree/${degreeId}/goals`);
            setGoals(response.data);
        } catch (err) {
            setError('Failed to fetch goals. Please check the input values.');
        }
    };

    const fetchCourses = async () => {
        if (!degreeId) {
            setError('Please select a Degree.');
            return;
        }
        setError('');
        try {
            const response = await axios.get(`http://localhost:5000/degree/${degreeId}/courses`);
            setCourses(response.data);
        } catch (err) {
            setError('Failed to fetch courses. Please check the input values.');
        }
    };

    const fetchSections = async () => {
        if (!degreeId || !startSemester || !endSemester) {
            setError('Please fill out all fields for Degree, Start Semester, and End Semester.');
            return;
        }
        if (!validateSemesters()) {
            return;
        }
        setError('');
        try {
            const response = await axios.get(`http://localhost:5000/degree/${degreeId}/sections`, {
                params: { start_semester: startSemester, end_semester: endSemester },
            });
            setSections(response.data);
        } catch (err) {
            setError('Failed to fetch sections. Please check the input values.');
        }
    };

    const fetchGoalCourses = async () => {
        if (!degreeId || !goalCodes) {
            setError('Please select a Degree and enter Goal Codes.');
            return;
        }
        setError('');
        try {
            const response = await axios.post(`http://localhost:5000/degree/${degreeId}/goal-courses`, {
                goal_codes: goalCodes.split(',').map((code) => code.trim()),
            });
            setGoalCourses(response.data);
        } catch (err) {
            setError('Failed to fetch goal courses. Please check the input values.');
        }
    };

    const renderDegreeDropdown = () => (
        <select
            value={degreeId}
            onChange={(e) => setDegreeId(e.target.value)}
            required
        >
            <option value="" disabled>Select a Degree</option>
            {degrees.map((degree) => (
                <option key={degree.id} value={degree.id}>
                    {degree.name} ({degree.level})
                </option>
            ))}
        </select>
    );

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'goals':
                return (
                    <div>
                        <label>Degree:</label>
                        {renderDegreeDropdown()}
                        <button onClick={fetchGoals}>Fetch Goals</button>
                        {error && <p className="error-message">{error}</p>}
                        <div className="query-results">
                            <h3>Goals:</h3>
                            {goals.length > 0 ? (
                                <ul>
                                    {goals.map((goal) => (
                                        <li key={goal.goal_code}>
                                            Goal Code: {goal.goal_code}, Description: {goal.description}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No goals found.</p>
                            )}
                        </div>
                    </div>
                );
            case 'courses':
                return (
                    <div>
                        <label>Degree:</label>
                        {renderDegreeDropdown()}
                        <button onClick={fetchCourses}>Fetch Courses</button>
                        {error && <p className="error-message">{error}</p>}
                        <div className="query-results">
                            <h3>Courses:</h3>
                            {courses.length > 0 ? (
                                <ul>
                                    {courses.map((course) => (
                                        <li key={course.course_id}>
                                            Course ID: {course.course_id}, Name: {course.name}, Core: {course.core ? 'Yes' : 'No'}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No courses found.</p>
                            )}
                        </div>
                    </div>
                );
            case 'sections':
                return (
                    <div>
                        <label>Degree:</label>
                        {renderDegreeDropdown()}
                        <label>Start Semester:</label>
                        <input
                            type="text"
                            value={startSemester}
                            onChange={(e) => setStartSemester(e.target.value)}
                            placeholder="e.g., Fall 2022"
                        />
                        <label>End Semester:</label>
                        <input
                            type="text"
                            value={endSemester}
                            onChange={(e) => setEndSemester(e.target.value)}
                            placeholder="e.g., Spring 2023"
                        />
                        <button onClick={fetchSections}>Fetch Sections</button>
                        {error && <p className="error-message">{error}</p>}
                        <div className="query-results">
                            <h3>Sections:</h3>
                            {sections.length > 0 ? (
                                <ul>
                                    {sections.map((section) => (
                                        <li key={section.section_id}>
                                            Section ID: {section.section_id}, Semester: {section.semester}, Enrollment: {section.enrollment_count}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No sections found.</p>
                            )}
                        </div>
                    </div>
                );
            case 'goalCourses':
                return (
                    <div>
                        <label>Degree:</label>
                        {renderDegreeDropdown()}
                        <label>Goal Codes (comma-separated):</label>
                        <input
                            type="text"
                            value={goalCodes}
                            onChange={(e) => setGoalCodes(e.target.value)}
                            placeholder="Enter Goal Codes (e.g., GOAL, goal)"
                        />
                        <button onClick={fetchGoalCourses}>Fetch Goal Courses</button>
                        {error && <p className="error-message">{error}</p>}
                        <div className="query-results">
                            <h3>Goal Courses:</h3>
                            {goalCourses.length > 0 ? (
                                <ul>
                                    {goalCourses.map((course) => (
                                        <li key={course.course_id}>
                                            Course ID: {course.course_id}, Name: {course.name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No goal courses found.</p>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="degree-query">
            <h2>Degree Query</h2>
            <div className="tabs">
                <button
                    className={activeTab === 'goals' ? 'active' : ''}
                    onClick={() => setActiveTab('goals')}
                >
                    Goals
                </button>
                <button
                    className={activeTab === 'courses' ? 'active' : ''}
                    onClick={() => setActiveTab('courses')}
                >
                    Courses
                </button>
                <button
                    className={activeTab === 'sections' ? 'active' : ''}
                    onClick={() => setActiveTab('sections')}
                >
                    Sections
                </button>
                <button
                    className={activeTab === 'goalCourses' ? 'active' : ''}
                    onClick={() => setActiveTab('goalCourses')}
                >
                    Goal Courses
                </button>
            </div>
            <div className="tab-content">{renderActiveTab()}</div>
        </div>
    );
}

export default DegreeQuery;
