import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DataEntryPage from './pages/DataEntryPage';
import EvaluationManagementPage from './pages/EvaluationManagementPage';
import QueryingPage from './pages/QueryingPage';
import HomePage from './pages/HomePage';

function App() {
    return (
        <Router>
            <div>
                <h1>Program Evaluation System</h1>
                <nav className="toolbar">
                    <Link to="/">Home</Link>
                    <Link to="/data-entry">Data Entry</Link>
                    <Link to="/evaluation-management">Evaluation Management</Link>
                    <Link to="/querying">Querying</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/data-entry" element={<DataEntryPage />} />
                    <Route path="/evaluation-management" element={<EvaluationManagementPage />} />
                    <Route path="/querying" element={<QueryingPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
