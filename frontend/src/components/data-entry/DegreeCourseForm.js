import React, { useState, useEffect } from 'react';

function DegreeCourseForm() {
    const [degreeId, setDegreeId] = useState('');
    const [courseId, setCourseId] = useState('');
    const [isCore, setIsCore] = useState(false);
    const [degrees, setDegrees] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/degrees') 
            .then((response) => response.json())
            .then((data) => setDegrees(data))
            .catch((err) => setError(`Error fetching degrees: ${err.message}`));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Validate Course ID
        const courseIdPattern = /^[A-Za-z]{2,4}\d{4}$/;
        if (!courseIdPattern.test(courseId)) {
            setError('Course ID must be a 2-4 letter department code followed by a 4-digit number (e.g., CSE1010).');
            setMessage('');
            return;
        }

        if (!degreeId || !courseId) {
            setError('Both fields are required!');
            return;
        }

        const degreeCourseData = {
            degree_id: degreeId,
            course_id: courseId,
            core: isCore,
        };

        fetch('http://localhost:5000/degree-course', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(degreeCourseData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    if (data.error.toLowerCase().includes('foreign key')) {
                        if (data.error.toLowerCase().includes('Select a Degree')) {
                            setError(`Invalid Degree ID: ${degreeId}. Please ensure it exists in the database.`);
                        } else if (data.error.toLowerCase().includes('course id')) {
                            setError(`Invalid Course ID: ${courseId}. Please ensure it exists in the database.`);
                        } else {
                            setError(`Error: ${data.error}`);
                        }
                        setMessage('');
                    }
                } else {
                    setMessage('Degree Course added successfully!');
                    setError('');
                    setDegreeId('');
                    setCourseId('');
                }
            })
            .catch((error) => {
                setError(`Error: ${error.message}`);
                setMessage('');
            });
    };

    return (
        <form className="degree-course-form" onSubmit={handleSubmit}>
            <h2>Add Degree Course</h2>

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

            <label htmlFor="core">Is this a core course? (Check for Yes, Leave Blank for No)</label>
            <input
                type="checkbox"
                id="core"
                checked={isCore}
                onChange={(e) => setIsCore(e.target.checked)}
            />

            <button type="submit">Add Degree Course</button>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default DegreeCourseForm;
