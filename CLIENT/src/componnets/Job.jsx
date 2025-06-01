import React from 'react';
import '../style/Job.css';

function Job({ jobData }) {
    const handleApply = () => {
        // TODO: Implement job application logic
        console.log('Apply to job:', jobData.title);
    };

    const handleViewCompany = () => {
        // TODO: Implement company details navigation
        console.log('View company:', jobData.companyName);
    };
    return (
        <div className="job-card">
            <div className="job-header">
                <div className="company-logo">
                    <img src={jobData.logo || '/default-company-logo.png'} alt={`${jobData.companyName} logo`} />
                </div>
                <div className="job-title-section">
                    <h3 className="job-title">{jobData.name}</h3>
                    {/* <p className="company-name">{jobData.companyName}</p> */}
                </div>
            </div>

            <div className="job-content">
                <div className="job-requirements">
                    <h4>Requirements</h4>
                    <p>{jobData.requirements}</p>
                </div>

                <div className="job-details">
                    <div className="experience-badge">
                        <span className="detail-label">Experience:</span>
                        <span className="detail-value">{jobData.experience} years</span>
                    </div>

                    <div className="languages-section">
                        <span className="detail-label">Technologies:</span>
                        {(jobData.languages ?? "")
                            .split(',').map(skill => skill.trim()).filter(skill => skill)
                            .map((skill, index) => (
                                <span key={index} className="skill-tag">{skill}</span>))}
                    </div>
                </div>
            </div>

            <div className="job-actions">
                <button className="apply-btn" onClick={handleApply}>
                    Apply Now
                </button>
                <button className="view-company-btn" onClick={handleViewCompany}>
                    View Company
                </button>
            </div>
        </div>
    );
}

export default Job;