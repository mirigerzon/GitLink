const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../SERVER/.env' });

async function seed() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  // --- Users
  await db.query(`
    INSERT INTO users (username, email, phone, role, about, profile_image)
    VALUES
      ('alice', 'alice@example.com', 123456789, 'developer', 'Full-stack developer', 'https://...'),
      ('bob', 'bob@example.com', 234567891, 'developer', 'Backend enthusiast', 'https://...'),
      ('charlie', 'charlie@example.com', 345678912, 'recruiter', 'Java expert', 'https://...');
  `);

  // --- Developers
  await db.query(`
    INSERT INTO developers (user_id, git_name, experience, languages, rating)
    VALUES
      (1, 'aliceGH', 3, 'JavaScript,Python', 5),
      (2, 'bobGH', 2, 'C++,C#', 4);
  `);

  // --- Recruiters
  await db.query(`
    INSERT INTO recruiters (user_id, company_name)
    VALUES
      (3, 'Some Company');
  `);

  // --- Passwords
  await db.query(`
    INSERT INTO passwords (user_id, hashed_password)
    VALUES 
      (1, '$2b$10$AGyVGvmsBM/22bB/ZSvn..KQdBh1CEP/eAICxCmXg9qp0P8C9GTUK'),
      (2, '$2b$10$knYSIsliqk2UTbdzMH12z.8vYQBG5ITTzlBXvjOWFi3OSYVxHWF/2'),
      (3, '$2b$10$g74BvDTnDJOs84FEcUqCcOZayxhwqXdi8DQ87fS9Qrj3LU3EqilQu');
  `);

  // --- Projects
  await db.query(`
    INSERT INTO projects (username, git_name, name, url, languages, details, forks_count, rating, rating_count)
    VALUES 
      ('alice', 'aliceGH', 'Portfolio', 'https://github.com/alice/portfolio', 'HTML,CSS,JS', 'Personal site', 10, 0, 0),
      ('alice', 'aliceGH', 'Blog Engine', 'https://github.com/alice/blog', 'Node.js', 'Blog backend', 5, 0, 0),
      ('bob', 'bobGH', 'Calculator', 'https://github.com/bob/calc', 'C++', 'CLI calculator', 7, 0, 0);
  `);

  // --- Project Ratings
  await db.query(`
    INSERT INTO project_ratings (username, project_id, rating)
    VALUES 
      ('bob', 1, 5),
      ('alice', 3, 4);
  `);

  // --- Jobs
  await db.query(`
    INSERT INTO jobs (username, company_name, experience, languages, views)
    VALUES 
      ('charlie', 'Tech Corp', 4, 'Java,Spring', 9),
      ('charlie', 'Future Inc', 3, 'Python,Django', 5);
  `);

  // --- Job Applications
  await db.query(`
    INSERT INTO job_applications (user_id, job_id, remark)
    VALUES 
      (1, 1, 'Interested in backend role'),
      (2, 1, 'Skilled in Java'),
      (1, 2, 'Looking for Python work');
  `);

  // --- Messages
  await db.query(`
  INSERT INTO messages (email, title, content, is_read, important, type, action_url)
  VALUES
    -- Messages for Alice
    ('alice@example.com', 'Welcome to the Platform', 'We\'re happy to have you, Alice!', FALSE, FALSE, 'info', NULL),
    ('alice@example.com', 'Project Approved', 'Your project "Portfolio" was approved.', TRUE, TRUE, 'success', 'https://github.com/alice/portfolio'),
    ('alice@example.com', 'Rating Update', 'Your project received a new rating.', FALSE, FALSE, 'info', NULL),

    -- Messages for Bob
    ('bob@example.com', 'Welcome to the Platform', 'We\'re happy to have you, Bob!', FALSE, FALSE, 'info', NULL),
    ('bob@example.com', 'Application Received', 'We received your application for Tech Corp.', TRUE, FALSE, 'success', NULL),
    ('bob@example.com', 'New Job Posted', 'A new job requiring C++ was posted.', FALSE, TRUE, 'alert', '/jobs'),

    -- Messages for Charlie
    ('charlie@example.com', 'Welcome to the Platform', 'We\'re happy to have you, Charlie!', FALSE, FALSE, 'info', NULL),
    ('charlie@example.com', 'New Applicant', 'Bob applied to your job posting.', TRUE, FALSE, 'info', '/recruiter/applications'),
    ('charlie@example.com', 'Reminder', 'Update your company profile.', FALSE, TRUE, 'warning', '/profile/edit');
`);


  console.log("✅ Database seeded successfully.");
  await db.end();
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err.message);
});
