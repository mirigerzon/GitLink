import React from 'react';
import '../style/Project.css'

function Project({ projectData }) {
    // TODO: Implement these functions
    // - handleShowProgrammerDetails() - navigate to programmer profile
    // - handleHideProject() - admin function to hide project
    // - checkIfAdmin() - check if current user is admin

    const isAdmin = false; // TODO: Replace with actual admin check

    return (
        <div className="project-card">
            <div className="project-header">
                <h3 className="project-name">{projectData.name}</h3>
                <div className="project-stats">
                    <div className="stat">
                        <span className="stat-icon">📊</span>
                        <span className="stat-value">{projectData.commits}</span>
                        <span className="stat-label">Commits</span>
                    </div>
                    <div className="stat">
                        <span className="stat-icon">👀</span>
                        <span className="stat-value">{projectData.views}</span>
                        <span className="stat-label">Views</span>
                    </div>
                </div>
            </div>

            <div className="project-languages">
                <h4>Technologies:</h4>
                <div className="languages-list">
                    {projectData.languages.map((language, index) => (
                        <span key={index} className="language-tag">
                            {language}
                        </span>
                    ))}
                </div>
            </div>

            <div className="project-actions">
                <button 
                    className="btn-primary"
                    onClick={() => console.log('Show programmer details')}
                >
                    View Developer
                </button>
                
                {isAdmin && (
                    <button 
                        className="btn-admin"
                        onClick={() => console.log('Hide project')}
                    >
                        Hide Project
                    </button>
                )}
            </div>
        </div>
    );
}

export default Project;