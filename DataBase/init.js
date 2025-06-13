const mysql = require('mysql2/promise');
require('dotenv').config();

async function getDbConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });
}

async function seedUsers(db) {
  await db.query(`
    INSERT INTO users (username, email, phone, role, about, profile_image)
    VALUES
      ('alice', 'alice@example.com', 123456789, 'developer', 'Full-stack developer', 'https://...'),
      ('bob', 'bob@example.com', 234567891, 'developer', 'Backend enthusiast', 'https://...'),
      ('charlie', 'charlie@example.com', 345678912, 'recruiter', 'Java expert', 'https://...');
  `);
}

async function seedPasswords(db) {
  await db.query(`
    INSERT INTO passwords (user_id, hashed_password)
    VALUES
      (1, '$2b$10$AGyVGvmsBM/22bB/ZSvn..KQdBh1CEP/eAICxCmXg9qp0P8C9GTUK'),
      (2, '$2b$10$knYSIsliqk2UTbdzMH12z.8vYQBG5ITTzlBXvjOWFi3OSYVxHWF/2'),
      (3, '$2b$10$g74BvDTnDJOs84FEcUqCcOZayxhwqXdi8DQ87fS9Qrj3LU3EqilQu');
  `);
}

async function seedDevelopers(db) {
  await db.query(`
    INSERT INTO developers (user_id, git_name, experience, languages, rating)
    VALUES
      (1, 'aliceGH', 3, 'JavaScript,Python', 5),
      (2, 'bobGH', 2, 'C++,C#', 4);
  `);
}

async function seedRecruiters(db) {
  await db.query(`
    INSERT INTO recruiters (user_id, company_name)
    VALUES
      (3, 'Some Company');
  `);
}

async function seedProjects(db) {
  await db.query(`
    INSERT INTO projects (username, git_name, name, url, languages, details, forks_count, rating, rating_count)
    VALUES
      ('alice', 'aliceGH', 'Portfolio', 'https://github.com/alice/portfolio', 'HTML,CSS,JS', 'Personal site', 10, 0, 0),
      ('alice', 'aliceGH', 'Blog Engine', 'https://github.com/alice/blog', 'Node.js', 'Blog backend', 5, 0, 0),
      ('bob', 'bobGH', 'Calculator', 'https://github.com/bob/calc', 'C++', 'CLI calculator', 7, 0, 0);
  `);
}

async function seedProjectRatings(db) {
  await db.query(`
    INSERT INTO project_ratings (username, project_id, rating)
    VALUES
      ('bob', 1, 5),
      ('alice', 3, 4);
  `);
}

async function seedJobs(db) {
  await db.query(`
    INSERT INTO jobs (username, company_name, experience, languages, views)
    VALUES
      ('charlie', 'Tech Corp', 4, 'Java,Spring', 9),
      ('charlie', 'Future Inc', 3, 'Python,Django', 5);
  `);
}

async function seedJobApplications(db) {
  await db.query(`
    INSERT INTO job_applications (user_id, job_id, remark)
    VALUES
      (1, 1, 'Interested in backend role'),
      (2, 1, 'Skilled in Java'),
      (1, 2, 'Looking for Python work');
  `);
}

async function seedMessages(db) {
  await db.query(`
    INSERT INTO messages (user_id, email, title, content)
    VALUES
      (1, 'alice@example.com', 'Welcome!', 'Welcome to the platform!'),
      (2, 'bob@example.com', 'Tip', 'Do not forget to update your profile.'),
      (3, 'charlie@example.com', 'Alert', 'New job posted in your field.');
  `);
}

async function runAllSeeders(db) {
  await seedUsers(db);
  await seedPasswords(db);
  await seedDevelopers(db);
  await seedRecruiters(db);
  await seedProjects(db);
  await seedProjectRatings(db);
  await seedJobs(db);
  await seedJobApplications(db);
  await seedMessages(db);
}

async function seed() {
  const db = await getDbConnection();
  await runAllSeeders(db);
  console.log("✅ Database seeded successfully.");
  await db.end();
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err.message);
});