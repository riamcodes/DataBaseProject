import React, { useState } from 'react';
import axios from 'axios';

function EvaluationQuery() {
    const [activeTab, setActiveTab] = useState('evaluationStatus');
    const [semester, setSemester] = useState('');
    const [percentage, setPercentage] = useState('');
    const [evaluations, setEvaluations] = useState([]);
    const [passingSections, setPassingSections] = useState([]);
    const [error, setError] = useState('');

    const semesterRegex = /^(Fall|Spring|Summer) \d{4}$/;

    const validateSemester = () => {
        if (!semesterRegex.test(semester)) {
            setError('Semester must be in the format "Fall YYYY", "Spring YYYY", or "Summer YYYY".');
            return false;
        }
        return true;
    };

    const fetchEvaluationStatus = async () => {
        if (!semester) {
            setError('Please enter a Semester.');
            return;
        }
        if (!validateSemester()) {
            return;
        }
        setError('');
        try {
            const response = await axios.get(`http://localhost:5000/semester/${semester}/evaluations`);
            setEvaluations(response.data);
        } catch (err) {
            setError('Failed to fetch evaluations. Please check the input values.');
        }
    };

    const fetchPassingSections = async () => {
        if (!semester || !percentage) {
            setError('Please enter both Semester and Percentage.');
            return;
        }
        if (!validateSemester()) {
            return;
        }
        setError('');
        try {
            const response = await axios.post(`http://localhost:5000/semester/${semester}/passing-percentage`, {
                percentage: parseFloat(percentage),
            });
            setPassingSections(response.data);
        } catch (err) {
            setError('Failed to fetch passing sections. Please check the input values.');
        }
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'evaluationStatus':
                return (
                    <div>
                        <label>Semester:</label>
                        <input
                            type="text"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            placeholder="e.g., Fall 2022"
                        />
                        <button onClick={fetchEvaluationStatus}>Fetch Evaluation Status</button>
                        {error && <p className="error-message">{error}</p>}
                        <div className="query-results">
                            <h3>Evaluation Status:</h3>
                            {evaluations.length > 0 ? (
                                <ul>
                                    {evaluations.map((evaluation, index) => (
                                        <li key={index}>
                                        Section ID: {evaluation.section_id}, 
                                        Course ID: {evaluation.course_id}, 
                                        Semester: {evaluation.semester}, 
                                        Degree ID: {evaluation.degree_id}, 
                                        Goal Code: {evaluation.goal_code}, 
                                        Evaluation Status: {evaluation.eval_status},
                                        Improvement Entered: {evaluation.improvement_entered}
                                    </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No evaluations found.</p>
                            )}
                        </div>
                    </div>
                );
            case 'passingSections':
                return (
                    <div>
                        <label>Semester:</label>
                        <input
                            type="text"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            placeholder="e.g., Fall 2022"
                        />
                        <label>Percentage:</label>
                        <input
                            type="number"
                            value={percentage}
                            onChange={(e) => setPercentage(e.target.value)}
                            placeholder="e.g., 80"
                        />
                        <button onClick={fetchPassingSections}>Fetch Passing Sections</button>
                        {error && <p className="error-message">{error}</p>}
                        <div className="query-results">
                            <h3>Passing Sections:</h3>
                            {passingSections.length > 0 ? (
                                <ul>
                                    {passingSections.map((section, index) => (
                                        <li key={index}>
                                        Section ID: {section.section_id}, 
                                        Course ID: {section.course_id}, 
                                        Semester: {section.semester}, 
                                        Degree ID: {section.degree_id}, 
                                        Goal Code: {section.goal_code}, 
                                        Passing Percentage: {section.passing_percentage}%
                                    </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No passing sections found.</p>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="evaluation-query">
            <h2>Evaluation Query</h2>
            <div className="tabs">
                <button
                    className={activeTab === 'evaluationStatus' ? 'active' : ''}
                    onClick={() => setActiveTab('evaluationStatus')}
                >
                    Evaluation Status
                </button>
                <button
                    className={activeTab === 'passingSections' ? 'active' : ''}
                    onClick={() => setActiveTab('passingSections')}
                >
                    Passing Sections
                </button>
            </div>
            <div className="tab-content">{renderActiveTab()}</div>
        </div>
    );
}

export default EvaluationQuery;
