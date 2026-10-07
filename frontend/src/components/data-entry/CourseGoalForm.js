import React, { useState, useEffect } from 'react';

function CourseGoalForm() {
    const [courseId, setCourseId] = useState('');
    const [degreeId, setDegreeId] = useState('');
    const [degrees, setDegrees] = useState([]);
    const [goalCode, setGoalCode] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/degrees') 
            .then((response) => response.json())
            .then((data) => setDegrees(data))
            .catch((err) => setError(`Error fetching degrees: ${err.message}`));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const goalCodePattern = /^[A-Za-z0-9]{4}$/;
        if (!goalCodePattern.test(goalCode)) {
            setError('Goal Code must be exactly 4 characters long.');
            setMessage('');
            return;
        }

        const courseIdPattern = /^[A-Za-z]{2,4}\d{4}$/;
        if (!courseIdPattern.test(courseId)) {
            setError('Course ID must be a 2-4 letter department code followed by a 4-digit number (e.g., CSE1010).');
            setMessage('');
            return;
        }

        if (!courseId || !degreeId || !goalCode) {
            setError('All fields are required!');
            setMessage('');
            return;
        }

        const courseGoalData = {
            course_id: courseId,
            degree_id: degreeId,
            goal_code: goalCode,
        };

        fetch('http://localhost:5000/course-goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseGoalData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    if (data.error.toLowerCase().includes('foreign key')) {
                        if (data.error.toLowerCase().includes('course_id')) {
                            setError(`Invalid Course ID: ${courseId}. Please ensure it exists in the database.`);
                        } else if (data.error.toLowerCase().includes('degree id and goal code')) {
                            setError(
                                `Invalid combination of Degree ID: ${degreeId} and Goal Code: ${goalCode}. Please ensure it exists in the Goal table.`
                            );
                        } else {
                            setError(`Error: ${data.error}`);
                        }
                        setMessage('');
                    } else {
                        setError(`Error: ${data.error}`);
                        setMessage('');
                    }
                } else {
                    setMessage('Course Goal added successfully!');
                    setError('');
                    setCourseId('');
                    setDegreeId('');
                    setGoalCode('');
                }
            })
            .catch((error) => {
                setError(`Error: ${error.message}`);
                setMessage('');
            });
    };

    return (
        <form className="course-goal-form" onSubmit={handleSubmit}>
            <h2>Add Course Goal</h2>

            <label htmlFor="courseId">Course ID:</label>
            <input
                id="courseId"
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="e.g., CSE1010"
                pattern="[A-Za-z]{2,4}\d{4}"
                title="2-4 letter department code followed by a 4-digit number (e.g., CSE1010)"
                required
            />

            <label htmlFor="Select a Degree">Select a Degree:</label>
            <select
                id="degreeId"
                value={degreeId}
                onChange={(e) => setDegreeId(e.target.value)}
                required
            >
                <option value="" disabled>
                    Select a Degree 
                </option>
                {degrees.map((degree) => (
                    <option key={degree.id} value={degree.id}>
                        {degree.name} ({degree.level})
                    </option>
                ))}
            </select>

            <label htmlFor="goalCode">Goal Code:</label>
            <input
                id="goalCode"
                type="text"
                value={goalCode}
                onChange={(e) => setGoalCode(e.target.value)}
                placeholder="Enter Goal Code (4 characters)"
                pattern=".{4}"
                title="Goal Code must be exactly 4 characters long."
                required
            />

            <button type="submit">Add Course Goal</button>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default CourseGoalForm;
