import React from 'react';
import DegreeForm from '../components/data-entry/DegreeForm';
import CourseForm from '../components/data-entry/CourseForm';
import InstructorForm from '../components/data-entry/InstructorForm';
import SectionForm from '../components/data-entry/SectionForm';
import GoalForm from '../components/data-entry/GoalForm';
import CourseGoalForm from '../components/data-entry/CourseGoalForm';
import DegreeCourseForm from '../components/data-entry/DegreeCourseForm';
import './DataEntryPage.css';

function DataEntryPage() {
    return (
        <div className="data-entry-page">
            <h1 className="page-title">Data Entry</h1>
            <div className="form-section">
                <h2>Add Degrees</h2>
                <DegreeForm />
            </div>
            <div className="form-section">
                <h2>Add Courses</h2>
                <CourseForm />
            </div>
            <div className="form-section">
                <h2>Add Instructors</h2>
                <InstructorForm />
            </div>
            <div className="form-section">
                <h2>Add Sections</h2>
                <SectionForm />
            </div>
            <div className="form-section">
                <h2>Add Goals</h2>
                <GoalForm />
            </div>
            <div className="form-section">
                <h2>Associate Degrees with Courses</h2>
                <DegreeCourseForm />
            </div>
            <div className="form-section">
                <h2>Associate Courses with Goals</h2>
                <CourseGoalForm />
            </div>
        </div>
    );
}

export default DataEntryPage;
