import React, { useState } from 'react';

function DegreeForm() {
    const [degreeName, setDegreeName] = useState('');
    const [degreeLevel, setDegreeLevel] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate inputs
        if (!degreeName || !degreeLevel) {
            setError('Both fields are required!');
            setMessage('');
            return;
        }

        const degreeData = { name: degreeName, level: degreeLevel };

        fetch('http://localhost:5000/degrees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(degreeData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setError(`Error: ${data.error}`);
                    setMessage('');
                } else {
                    setMessage('Degree added successfully!');
                    setError('');
                    setDegreeName('');
                    setDegreeLevel('');
                }
            })
            .catch((error) => {
                setError(`Error: ${error.message}`);
                setMessage('');
            });
    };

    return (
        <form className="degree-form" onSubmit={handleSubmit}>
            <h2>Add Degree</h2>

            <label htmlFor="degreeName">Degree Name:</label>
            <input
                id="degreeName"
                type="text"
                value={degreeName}
                onChange={(e) => setDegreeName(e.target.value)}
                placeholder="e.g., Computer Science"
                required
            />

            <label htmlFor="degreeLevel">Degree Level:</label>
            <input
                id="degreeLevel"
                type="text"
                value={degreeLevel}
                onChange={(e) => setDegreeLevel(e.target.value)}
                placeholder="e.g., Bachelor, Associate, etc."
                required
            />

            <button type="submit">Add Degree</button>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default DegreeForm;
