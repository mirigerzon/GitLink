const generic = require('../repositories/generic.js');
const jobApplicationsRepository = require('../repositories/jobApplications.js');
const { sendEmail, sendApplicationEmail } = require('./emailService.js');

const getJobApplications = async (jobId) => {
    if (!jobId) {
        throw new Error('Job ID is required');
    }

    try {
        const applications = await jobApplicationsRepository.getApplications(jobId);
        return applications || [];
    } catch (error) {
        console.error('Error fetching job applications:', error);
        throw new Error('Failed to fetch job applications');
    }
};

const rejectApplicant = async (data, jobId) => {
    if (!data || !jobId) {
        throw new Error('Data and job ID are required');
    }

    const { developerId, developerEmail } = data;

    if (!developerId || !developerEmail) {
        throw new Error('Developer ID and email are required');
    }

    try {
        const messageData = {
            user_id: developerId,
            email: developerEmail,
            title: 'Application Update',
            content: `Thank you for applying for Job #${jobId}. After careful consideration, we have decided to move forward with other candidates. We encourage you to apply for future positions that match your skills.`
        };

        await jobApplicationsRepository.rejectApplicant(jobId, developerId, messageData);
    } catch (error) {
        console.error('Error rejecting applicant:', error);
        throw new Error('Failed to reject applicant');
    }
};

const notifyApplicant = async (data) => {
    if (!data) {
        throw new Error('Notification data is required');
    }

    const { user_id, email, title, content } = data;

    if (!user_id || !email || !title || !content) {
        throw new Error('User ID, email, title, and content are required');
    }

    try {
        await sendEmail({
            user_id: user_id,
            email: email,
            title: title,
            content: content,
            dbContent: 'You have received a new notification about a job application',
            saveOnly: false
        });
    } catch (error) {
        console.error('Error sending notification email:', error);
        throw new Error('Failed to send notification email');
    }
};

const createApply = async (data, email) => {
    if (!data || !email) {
        throw new Error('Application data and email are required');
    }

    if (Array.isArray(data)) {
        data = Object.fromEntries(data.map(({ field, value }) => [field, value]));
    }

    if (!data.job_id || !data.user_id) {
        throw new Error('Job ID and user ID are required');
    }

    try {
        const response = await generic.CREATE('job_applications', data);

        await sendApplicationEmail(data.user_id, email, data.job_id);

        return response;
    } catch (error) {
        console.error('Error creating application:', error);

        if (error.message.includes('Duplicate') || error.code === '23505') {
            throw new Error('You have already applied for this position');
        }

        throw new Error('Failed to submit application');
    }
};

const checkUserOwnership = (req, targetUserId, resourceName) => {
    if (req.user?.id && req.user.id !== targetUserId) {
        writeLog(`Unauthorized access attempt by user: ${req.user.username} trying to access ${resourceName} of user: ${targetUserId} from IP: ${req.ip}`, 'warn');
        const error = new Error(`You can only access your own ${resourceName}`);
        error.status = 403;
        throw error;
    }
};

module.exports = {
    getJobApplications,
    rejectApplicant,
    notifyApplicant,
    createApply,
    checkUserOwnership
};