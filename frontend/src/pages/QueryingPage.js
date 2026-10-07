import React, { useState } from 'react';
import DegreeQuery from '../components/querying/DegreeQuery';
import CourseQuery from '../components/querying/CourseQuery';
import InstructorQuery from '../components/querying/InstructorQuery';
import EvaluationQuery from '../components/querying/EvaluationQuery';
import './QueryingPage.css';

function QueryingPage() {
    const [activeTab, setActiveTab] = useState('degree');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'degree':
                return <DegreeQuery />;
            case 'course':
                return <CourseQuery />;
            case 'instructor':
                return <InstructorQuery />;
            case 'evaluation':
                return <EvaluationQuery />;
            default:
                return <DegreeQuery />;
        }
    };

    return (
        <div className="querying-page">
            <h1 className="page-title">Querying</h1>
            <div className="tabs">
                <button
                    className={activeTab === 'degree' ? 'active' : ''}
                    onClick={() => setActiveTab('degree')}
                >
                    Degree Queries
                </button>
                <button
                    className={activeTab === 'course' ? 'active' : ''}
                    onClick={() => setActiveTab('course')}
                >
                    Course Queries
                </button>
                <button
                    className={activeTab === 'instructor' ? 'active' : ''}
                    onClick={() => setActiveTab('instructor')}
                >
                    Instructor Queries
                </button>
                <button
                    className={activeTab === 'evaluation' ? 'active' : ''}
                    onClick={() => setActiveTab('evaluation')}
                >
                    Evaluation Queries
                </button>
            </div>
            <div className="tab-content">{renderActiveTab()}</div>
        </div>
    );
}

export default QueryingPage;
