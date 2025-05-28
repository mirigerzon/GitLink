import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/ErrorPage.css';

function ErrorPage() {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="error-container">
            <div className="error-content">
                <div className="error-icon">
                    <span className="error-number">404</span>
                </div>
                
                <h1 className="error-title">Oops! Something went wrong</h1>
                
                <p className="error-message">
                    The page you're looking for doesn't exist or an unexpected error occurred.
                </p>
                
                <div className="error-actions">
                    <button 
                        onClick={handleGoBack}
                        className="back-btn"
                    >
                        Go Back
                    </button>
                </div>
            </div>
            
            <div className="error-animation">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </div>
        </div>
    );
}

export default ErrorPage;