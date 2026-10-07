import React from 'react';
import EvaluationManager from '../components/evaluation-management/EvaluationManager';
import './EvaluationManagementPage.css';

function EvaluationManagementPage() {
    return (
        <div className="evaluation-management-page">
            <h2 className="page-title">Evaluation Management</h2>
            <div className="evaluation-manager-container">
                <EvaluationManager />
            </div>
        </div>
    );
}

export default EvaluationManagementPage;
