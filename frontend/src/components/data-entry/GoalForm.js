import React, { useState, useEffect } from 'react';

function GoalForm() {
    const [degreeId, setDegreeId] = useState('');
    const [goalCode, setGoalCode] = useState('');
    const [description, setDescription] = useState('');
    const [degrees, setDegrees] = useState([]);
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

        // Validate Goal Code
        const goalCodePattern = /^[A-Za-z0-9]{4}$/;
        if (!goalCodePattern.test(goalCode)) {
            setError('Goal Code must be exactly 4 characters long.');
            setMessage('');
            return;
        }

        if (!goalCode || !degreeId || !description) {
            setError('All fields are required!');
            setMessage('');
            return;
        }

        const goalData = {
            degree_id: degreeId,
            goal_code: goalCode,
            description: description,
        };

        fetch('http://localhost:5000/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    if (data.error.toLowerCase().includes('foreign key')) {
                        setError(`Invalid Degree ID: ${degreeId}. Please ensure it exists in the database.`);
                        setMessage('');
                    } else {
                        setError(`Error: ${data.error}`);
                        setMessage('');
                    }
                } else {
                    setMessage('Goal added successfully!');
                    setError('');
                    setDegreeId('');
                    setGoalCode('');
                    setDescription('');
                }
            })
            .catch((error) => {
                setError(`Error: ${error.message}`);
                setMessage('');
            });
    };

    return (
        <form className="goal-form" onSubmit={handleSubmit}>
            <h2>Add Goal</h2>

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

            <label htmlFor="description">Description:</label>
            <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter Goal Description"
                required
            ></textarea>

            <button type="submit">Add Goal</button>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default GoalForm;

