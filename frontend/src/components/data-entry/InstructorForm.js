import React, { useState } from 'react';

function InstructorForm() {
    const [instructorId, setInstructorId] = useState('');
    const [instructorName, setInstructorName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate Instructor ID
        const instructorIdPattern = /^\d{8}$/;
        if (!instructorIdPattern.test(instructorId)) {
            setError('Instructor ID must be an 8-digit string (e.g., 12345678).');
            setMessage('');
            return;
        }

        const instructorData = { instructor_id: instructorId, name: instructorName };

        fetch('http://localhost:5000/instructors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(instructorData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setError(`Error: ${data.error}`);
                    setMessage('');
                } else {
                    setMessage('Instructor added successfully!');
                    setError('');
                    setInstructorId('');
                    setInstructorName('');
                }
            })
            .catch((error) => {
                setError(`Error: ${error.message}`);
                setMessage('');
            });
    };

    return (
        <form className="instructor-form" onSubmit={handleSubmit}>
            <h2>Add Instructor</h2>
            <label htmlFor="instructorId">Instructor ID:</label>
            <input
                id="instructorId"
                type="text"
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                placeholder="e.g., 12345678"
                pattern="^\d{8}$"
                title="Instructor ID must be an 8-digit string (e.g., 12345678)"
                required
            />

            <label htmlFor="instructorName">Instructor Name:</label>
            <input
                id="instructorName"
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                required
            />

            <button type="submit">Add Instructor</button>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default InstructorForm;
