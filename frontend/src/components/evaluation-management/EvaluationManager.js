import React, { useState } from 'react';
import axios from 'axios';

function EvaluationManager() {
    const [semester, setSemester] = useState('');
    const [instructorId, setInstructorId] = useState('');
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [degrees, setDegrees] = useState([]);
    const [selectedDegree, setSelectedDegree] = useState(null);
    const [goals, setGoals] = useState([]);
    const [evaluationData, setEvaluationData] = useState({});
    const [improvementText, setImprovementText] = useState('');
    const [evaluationSaved, setEvaluationSaved] = useState(false);
    const [selectedDegreesToDuplicate, setSelectedDegreesToDuplicate] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [existingEvaluation, setExistingEvaluation] = useState(null);
    const [showWarning, setShowWarning] = useState(false);

    const semesterRegex = /^(Fall|Spring|Summer) \d{4}$/;

    const validateInputs = () => {
        if (!semesterRegex.test(semester)) {
            setError('Semester must be in the format "Fall YYYY", "Spring YYYY", or "Summer YYYY".');
            return false;
        }
        if (!instructorId) {
            setError('Please enter a valid Instructor ID.');
            return false;
        }
        return true;
    };

    // Validate Total Grades
    const validateTotalGrades = () => {
        if (!selectedSection) {
            setError('No section is selected.');
            return false;
        }

        const enrollmentCount = selectedSection.enrollment_count; // Section enrollment count
        const totalGrades = Object.values(evaluationData).reduce((sum, goal) => {
            return sum + (goal.A || 0) + (goal.B || 0) + (goal.C || 0) + (goal.F || 0);
        }, 0);

        if (parseInt(totalGrades) != parseInt(enrollmentCount)) {
            setError(
                `The total number of grades (${totalGrades}) does not match section's enrollment count of ${enrollmentCount}. Please adjust the numbers.`
            );
            return false;
        }

        setError('');
        return true;
    };

    const fetchSections = async () => {
        if (!validateInputs()) return;

        setError('');
        setSuccess('');
        try {
            const response = await axios.get(`http://localhost:5000/instructor/${instructorId}/sections`, {
                params: { semester },
            });
            setSections(response.data);
        } catch {
            setError('Failed to fetch sections. Please check the inputs.');
        }
    };

    const fetchDegrees = async (section) => {
        try {
            const degreesResponse = await axios.get(`http://localhost:5000/course/${section.course_id}/degrees`);
            setDegrees(degreesResponse.data);
            setSelectedSection(section);
            setSelectedDegree(null);
            setGoals([]);
            setEvaluationData({});
            setImprovementText('');
            setEvaluationSaved(false);
            setSelectedDegreesToDuplicate([]);
            setError('');
            setSuccess('');
        } catch {
            setError('Failed to fetch degrees for the selected section.');
        }
    };

    const fetchGoals = async (degreeId) => {
        try {
            const response = await axios.get(`http://localhost:5000/evaluations/goals/${selectedSection.section_id}`, {
                params: { degree_id: degreeId },
            });

            const filteredGoals = response.data.filter((goal) => goal.degree_id === degreeId);

            setGoals(filteredGoals);
            setSelectedDegree(degreeId);
    
            const existingEvalResponse = await axios.get(
                `http://localhost:5000/evaluations/${selectedSection.section_id}/${degreeId}`
            );
            if (existingEvalResponse.data) {
                const { evaluation_data: evalData, improvement_text } = existingEvalResponse.data;
                setExistingEvaluation(existingEvalResponse.data);
                setEvaluationData(evalData || {});
                setImprovementText(improvement_text || '');
                setEvaluationSaved(true);
    
                const totalGoals = filteredGoals.length
                const enteredGoals = Object.keys(evalData || {}).length;
                const missingGoals = totalGoals - enteredGoals;
    
                setSuccess(
                    `Evaluation data loaded. ${enteredGoals} out of ${totalGoals} goals have been entered. ${missingGoals} goals are still missing.`
                );
            } else {
                setExistingEvaluation(null);
                setEvaluationData({});
                setImprovementText('');
                setEvaluationSaved(false);
                setSuccess('No evaluation data found for this degree. All goals need to be entered.');
            }
    
            setSelectedDegreesToDuplicate([]);
            setError('');
        } catch (error) {
            setError('Failed to fetch goals for the selected degree.');
        }
    };

    const handleEvaluationChange = (goalCode, key, value) => {
        if (['A', 'B', 'C', 'F'].includes(key)) {
            const numericValue = value === '' ? '' : Math.max(0, Number(value));
            setEvaluationData((prevData) => ({
                ...prevData,
                [goalCode]: {
                    ...prevData[goalCode],
                    [key]: numericValue,
                    degree_id: selectedDegree,
                },
            }));
        } else {
            setEvaluationData((prevData) => ({
                ...prevData,
                [goalCode]: {
                    ...prevData[goalCode],
                    [key]: value,
                    degree_id: selectedDegree,
                },
            }));
        }
    };

    const handleNewEvaluation = () => {
        if (existingEvaluation) {
            setShowWarning(true);
            setTimeout(() => {
                setShowWarning(false);
            }, 3000);
            return;
        }
        setEvaluationData({});
        setImprovementText('');
        setIsEditing(true);
        setEvaluationSaved(false);
    };

    const handleEditExisting = () => {
        if (existingEvaluation) {
            setEvaluationData(existingEvaluation.evaluation_data || {});
            setImprovementText(existingEvaluation.improvement_text || '');
            setIsEditing(true);
        }
    };

    const handleNoChanges = () => {
        resetForm();
        setIsEditing(false);
        if (existingEvaluation) {
            setEvaluationData(existingEvaluation.evaluation_data || {});
            setImprovementText(existingEvaluation.improvement_text || '');
        } else {
            setEvaluationData({});
            setImprovementText('');
        }
    };

    const saveEvaluationData = async () => {
        if (!selectedSection || !selectedDegree) {
            setError('Please select a degree to save evaluation data.');
            return;
        }

        const incompleteGoals = goals.filter((goal) => {
            const evaluation = evaluationData[goal.goal_code];
            return (
                !evaluation ||
                !evaluation.method ||
                ['A', 'B', 'C', 'F'].some((key) => evaluation[key] === undefined)
            );
        });

        if (incompleteGoals.length > 0) {
            setError('Please complete all required fields for each evaluation. Improvement suggestions are optional.');
            return;
        }

        if (!validateTotalGrades()) return;

        setError('');
        setSuccess('');
        try {
            await axios.post('http://localhost:5000/evaluations', {
                section_id: selectedSection.section_id,
                degree_id: selectedDegree,
                evaluation_data: evaluationData,
                improvement_text: improvementText,
            });

            setSuccess('Evaluation data saved successfully.');
            setEvaluationSaved(true);
            setIsEditing(false);

            const updatedEval = await axios.get(
                `http://localhost:5000/evaluations/${selectedSection.section_id}/${selectedDegree}`
            );
            setExistingEvaluation(updatedEval.data);

            if (degrees.length <= 1) {
                resetForm();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('An error occurred while saving the evaluation data. Please try again.');
            }
        }
    };

    const handleDegreeSelection = (e, degreeId) => {
        if (e.target.checked) {
            setSelectedDegreesToDuplicate((prev) => [...prev, degreeId]);
        } else {
            setSelectedDegreesToDuplicate((prev) => prev.filter((id) => id !== degreeId));
        }
    };

    const duplicateEvaluationData = async () => {
        if (selectedDegreesToDuplicate.length === 0) {
            setError('Please select at least one degree to duplicate the evaluation.');
            return;
        }

        setError('');
        setSuccess('');
        try {
            await Promise.all(
                selectedDegreesToDuplicate.map(async (targetDegreeId) => {
                    const goalsResponse = await axios.get(
                        `http://localhost:5000/evaluations/goals/${selectedSection.section_id}`,
                        { params: { degree_id: targetDegreeId } }
                    );
                    const targetDegreeGoals = goalsResponse.data;

                    const duplicatedEvalData = {};
                    targetDegreeGoals.forEach((goal) => {
                        const sourceGoalType = goal.goal_code.split('-')[1];
                        const sourceGoal = Object.entries(evaluationData).find(
                            ([key]) => key.split('-')[1] === sourceGoalType
                        );

                        if (sourceGoal) {
                            const [, sourceData] = sourceGoal;
                            duplicatedEvalData[goal.goal_code] = {
                                degree_id: targetDegreeId,
                                method: sourceData.method,
                                A: sourceData.A,
                                B: sourceData.B,
                                C: sourceData.C,
                                F: sourceData.F,
                            };
                        }
                    });

                    return axios.post('http://localhost:5000/evaluations', {
                        section_id: selectedSection.section_id,
                        degree_id: targetDegreeId,
                        evaluation_data: duplicatedEvalData,
                        improvement_text: improvementText,
                    });
                })
            );
            setSuccess('Evaluation data duplicated successfully to selected degrees.');
            resetForm();
        } catch {
            setError('Failed to duplicate evaluation data. Please try again.');
        }
    };

    const resetForm = () => {
        setSelectedSection(null);
        setDegrees([]);
        setSelectedDegree(null);
        setGoals([]);
        setEvaluationData({});
        setImprovementText('');
        setEvaluationSaved(false);
        setSelectedDegreesToDuplicate([]);
        setError('');
        setSuccess('');
        setIsEditing(false);
        setExistingEvaluation(null);
    };

    return (
        <div className="evaluation-manager">
            <h2>Evaluation Manager</h2>
            <div>
                <label>Semester:</label>
                <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g., Fall 2022"
                />
            </div>
            <div>
                <label>Instructor ID:</label>
                <input
                    type="text"
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    placeholder="Enter Instructor ID"
                />
            </div>
            <button onClick={fetchSections}>Fetch Sections</button>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div className="query-results">
                <h3>Sections:</h3>
                {sections.length > 0 ? (
                    <ul>
                        {sections.map((section) => (
                            <li key={section.section_id}>
                            <p>Section ID: {section.section_id}</p>
                            <p>Course ID: {section.course_id}</p>
                            <p>Semester: {section.semester}</p>
                            <p>Enrollment Count: {section.enrollment_count}</p>
                            <p>Evaluation Status: {section.evaluation_status}</p>
                            <button onClick={() => fetchDegrees(section)}>Evaluate Goals</button>
                        </li>
                        ))}
                    </ul>
                ) : (
                    <p>No sections found.</p>
                )}
            </div>
            {degrees.length > 0 && (
                <div className="degree-selection">
                    <h3>Select Degree</h3>
                    <ul>
                        {degrees.map((degree) => (
                            <li key={degree.degree_id}>
                                <button onClick={() => fetchGoals(degree.degree_id)}>
                                    Degree ID: {degree.degree_id}, Name: {degree.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {goals.length > 0 && (
                <div className="evaluation-editor">
                    <h3>Evaluate Goals for Degree ID: {selectedDegree}</h3>
                    <div className="evaluation-buttons" style={{ marginBottom: '20px' }}>
                        <button
                            onClick={handleNewEvaluation}
                            style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                marginRight: '10px',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: existingEvaluation ? 'not-allowed' : 'pointer',
                                opacity: existingEvaluation ? '0.65' : '1',
                            }}
                        >
                            New Evaluation
                        </button>
                        <button
                            onClick={handleEditExisting}
                            disabled={!existingEvaluation || isEditing}
                            style={{
                                backgroundColor: '#ffc107',
                                color: 'black',
                                marginRight: '10px',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Edit Existing
                        </button>
                        <button
                            onClick={handleNoChanges}
                            style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            No Changes
                        </button>
                    </div>
                    {showWarning && (
                        <div
                            style={{
                                color: '#856404',
                                backgroundColor: '#fff3cd',
                                padding: '12px',
                                marginBottom: '20px',
                                borderRadius: '4px',
                                border: '1px solid #ffeeba',
                            }}
                        >
                            Evaluation already exists. Try editing existing evaluation.
                        </div>
                    )}
                    {(isEditing || !evaluationSaved) && (
                        <>
                            {goals.map((goal) => (
                                <div key={goal.goal_code} className="goal-evaluation">
                                    <h4>Goal: {goal.goal_code}</h4>
                                    <label>Evaluation Method:</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Homework, Project"
                                        value={evaluationData[goal.goal_code]?.method ?? ''}
                                        onChange={(e) => handleEvaluationChange(goal.goal_code, 'method', e.target.value)}
                                        required
                                    />
                                    <label>Number of A's:</label>
                                    <input
                                        type="number"
                                        placeholder="Enter count"
                                        value={evaluationData[goal.goal_code]?.A ?? ''}
                                        onChange={(e) => handleEvaluationChange(goal.goal_code, 'A', e.target.value)}
                                        pattern='\d+'
                                        min="0"
                                        required
                                    />
                                    <label>Number of B's:</label>
                                    <input
                                        type="number"
                                        placeholder="Enter count"
                                        value={evaluationData[goal.goal_code]?.B ?? ''}
                                        onChange={(e) => handleEvaluationChange(goal.goal_code, 'B', e.target.value)}
                                        pattern='\d+'
                                        min="0"
                                        required
                                    />
                                    <label>Number of C's:</label>
                                    <input
                                        type="number"
                                        placeholder="Enter count"
                                        value={evaluationData[goal.goal_code]?.C ?? ''}
                                        onChange={(e) => handleEvaluationChange(goal.goal_code, 'C', e.target.value)}
                                        pattern='\d+'
                                        min="0"
                                        required
                                    />
                                    <label>Number of F's:</label>
                                    <input
                                        type="number"
                                        placeholder="Enter count"
                                        value={evaluationData[goal.goal_code]?.F ?? ''}
                                        onChange={(e) => handleEvaluationChange(goal.goal_code, 'F', e.target.value)}
                                        pattern='\d+'
                                        min="0"
                                        required
                                    />
                                </div>
                            ))}
                            <label>Improvement Suggestions:</label>
                            <textarea
                                placeholder="Enter improvement suggestions here..."
                                value={improvementText}
                                onChange={(e) => setImprovementText(e.target.value)}
                            ></textarea>
                            <button
                                onClick={saveEvaluationData}
                                style={{
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                Save Evaluation
                            </button>
                        </>
                    )}
                </div>
            )}
            {evaluationSaved && degrees.length > 1 && (
                <div className="duplicate-evaluation">
                    <h4>Duplicate Evaluation</h4>
                    <p>
                        This course is associated with multiple degrees. You can duplicate the evaluation to other degrees associated with this course.
                    </p>
                    <div>
                        <p>Select Degrees to Duplicate To:</p>
                        {degrees
                            .filter((degree) => degree.degree_id !== selectedDegree)
                            .map((degree) => (
                                <div key={degree.degree_id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                    <span>
                                        Degree ID: {degree.degree_id}, Name: {degree.name}
                                    </span>
                                    <input
                                        type="checkbox"
                                        value={degree.degree_id}
                                        checked={selectedDegreesToDuplicate.includes(degree.degree_id)}
                                        onChange={(e) => handleDegreeSelection(e, degree.degree_id)}
                                    />
                                </div>
                            ))}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <button
                            onClick={duplicateEvaluationData}
                            style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Save Duplicate Evaluation(s)
                        </button>
                        <button
                            onClick={resetForm}
                            style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                marginLeft: '10px',
                                cursor: 'pointer',
                            }}
                        >
                            Do Not Duplicate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EvaluationManager;
