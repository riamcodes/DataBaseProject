import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div className="homepage">
            <h2>Welcome to the Program Evaluation System</h2>
            <div className="button-container">
                <Link to="/data-entry">
                    <button>Go to Data Entry</button>
                </Link>
                <Link to="/evaluation-management">
                    <button>Go to Evaluation Management</button>
                </Link>
                <Link to="/querying">
                    <button>Go to Querying</button>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;
