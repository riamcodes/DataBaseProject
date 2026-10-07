import React, { useState } from 'react';

function CourseForm() {
    const [courseId, setCourseId] = useState('');
    const [courseName, setCourseName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate Course ID
        const courseIdPattern = /^[A-Za-z]{2,4}\d{4}$/;
        if (!courseIdPattern.test(courseId)) {
            setError('Course ID must be a 2-4 letter department code followed by a 4-digit number (e.g., CSE1010).');
            setMessage('');
            return;
        }

        // Validate Input
        if (!courseId || !courseName) {
            setError('All fields are required!');
            setMessage('');
            return;
        }

        const courseData = { course_id: courseId, name: courseName };

        fetch('http://localhost:5000/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setError(`Error: ${data.error}`);
                    setMessage('');
                } else {
                    setMessage('Course added successfully!');
                    setError('');
                    setCourseId('');
                    setCourseName('');
                }
            })
            .catch((error) => {
                setError(`Error: ${error.message}`);
                setMessage('');
            });
    };

    return (
        <form className="course-form" onSubmit={handleSubmit}>
            <h2>Add Course</h2>
            <label htmlFor="courseId">Course ID:</label>
            <input
                id="courseId"
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="e.g., CSE1010"
                pattern="[A-Za-z]{2,4}\d{4}"t
                title="2-4 letter department code followed by a 4-digit number (e.g., CSE1010)"
                required
            />

            <label htmlFor="courseName">Course Name:</label>
            <input
                id="courseName"
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
            />

            <button type="submit">Add Course</button>
            
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default CourseForm;
