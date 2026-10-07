import React, { useState } from 'react';

function SectionForm() {
    const [courseId, setCourseId] = useState('');
    const [sectionNumber, setSectionNumber] = useState('');
    const [term, setTerm] = useState('');
    const [year, setYear] = useState('');
    const [enrollmentCount, setEnrollmentCount] = useState('');
    const [instructorId, setInstructorId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate Section Number
        const sectionNumberPattern = /^\d{3}$/;
        if (!sectionNumberPattern.test(sectionNumber)) {
            setError('Section Number must be an 3-digit string (e.g., 001).');
            setMessage('');
            return;
        }

        // Validate Year
        const yearPattern = /^\d{4}$/;
        if (!yearPattern.test(year)) {
            setError('Year must be an 4-digit string (e.g., 2024).');
            setMessage('');
            return;
        }

        // Validate input
        if (!courseId || !sectionNumber || !term || !year || !enrollmentCount || !instructorId) {
            setError('All fields are required!');
            setMessage('');
            return;
        }

        const semester = `${term} ${year}`;

        const sectionData = {
            course_id: courseId,
            section_number: parseInt(sectionNumber),
            semester: semester,
            enrollment_count: parseInt(enrollmentCount),
            instructor_id: instructorId,
        };

        fetch('http://localhost:5000/sections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sectionData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    if (data.error.toLowerCase().includes('foreign key')) {
                        if (data.error.toLowerCase().includes('course id')) {
                            setError(`Invalid Course ID: ${courseId}. Please ensure it exists in the database.`);
                        } else if (data.error.toLowerCase().includes('instructor id')) {
                            setError(`Invalid Instructor ID: ${instructorId}. Please ensure it exists in the database.`);
                        } else {
                            setError(`Error: ${data.error}`);
                        }
                        setMessage('');
                    }
                } else {
                    setMessage('Section added successfully!');
                    setError('');
                    setCourseId('');
                    setSectionNumber('');
                    setTerm('');
                    setYear('');
                    setEnrollmentCount('');
                    setInstructorId('');
                }
            })
            .catch((error) => {
                setError(`Error: ${error.message}`);
                setMessage('');
            });
    };

    return (
        <form className="section-form" onSubmit={handleSubmit}>
            <h2>Add Section</h2>

            <label htmlFor="courseId">Course ID:</label>
            <input
                id="courseId"
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="Enter Course ID (e.g., CSE101)"
                required
            />

            <label htmlFor="sectionNumber">Section Number:</label>
            <input
                id="sectionNumber"
                type="number"
                value={sectionNumber}
                onChange={(e) => setSectionNumber(e.target.value)}
                placeholder="e.g., 12345678"
                pattern="^\d{3}$"
                title="Section number must be an 3-digit string (e.g., 001)"
                required
            />

            <label htmlFor="term">Term:</label>
            <select
                id="term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                required
            >
                <option value="" disabled>
                    Select a term
                </option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
            </select>

            <label htmlFor="year">Year:</label>
            <input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Enter year (e.g., 2024)"
                min="0000"
                pattern="^\d{4}$"
                title="Section number must be an 4-digit string (e.g., 2024)"
                required
            />

            <label htmlFor="enrollmentCount">Enrollment Count:</label>
            <input
                id="enrollmentCount"
                type="number"
                value={enrollmentCount}
                onChange={(e) => setEnrollmentCount(e.target.value)}
                min="1"
                required
            />

            <label htmlFor="instructorId">Instructor ID:</label>
            <input
                id="instructorId"
                type="text"
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                required
            />

            <button type="submit">Add Section</button>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default SectionForm;
