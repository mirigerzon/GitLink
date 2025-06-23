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

async function seedRoles(db) {
  await db.query(`
    INSERT INTO roles (role)
    VALUES ('developer'), ('recruiter'), ('admin');
  `);
}

async function seedUsers(db) {
  await db.query(`
    INSERT INTO users (username, email, phone, role_id, about, profile_image, cv_file, status)
    VALUES
      ('admin', 'admin@example.com', 1234567890, 3, 'System administrator', 'profile_images/user.png', '', TRUE),
      ('miri', 'a0583286530@gmail.com', 583286530, 1, 'Full-stack developer passionate about scalable web apps.', 'https://github.com/mirigerzon.png', 'cv_files/mirigerzon-cv.pdf', TRUE),
      ('sara', 'sara3280624@gmail.com', 583280624, 1, 'Frontend developer who loves turning designs into reality.', 'https://github.com/sara6310472.png', 'cv_files/sara6310472-cv.pdf', TRUE),
      ('miric', 'miricitron704@gmail.com', 583258704, 1, 'Junior developer eager to build impactful applications.', 'https://github.com/Miri0442.png', 'cv_files/Miri0442-cv.pdf', TRUE),
      ('michal', 'm0583216525@gmail.com', 583216525, 1, 'Backend developer with a love for APIs and databases.', 'https://github.com/michalMenda.png', 'cv_files/michalMenda-cv.pdf', TRUE),
      ('SmartHireHR', 'hr1@smarthire.com', 1234567891, 2, 'Recruiter at SmartHire Ltd', 'profile_images/user.png', '', TRUE),
      ('TechBloomHR', 'hr2@techbloom.com', 1234567892, 2, 'Recruiter at TechBloom', 'profile_images/user.png', '', TRUE),
      ('DevSparkHR', 'hr3@devspark.com', 1234567893, 2, 'Recruiter at DevSpark', 'profile_images/user.png', '', TRUE),
      ('ByteBridgeHR', 'hr4@bytebridge.com', 1234567894, 2, 'Recruiter at ByteBridge', 'profile_images/user.png', '', TRUE),
      ('CodeTalentHR', 'hr5@codetalent.com', 1234567895, 2, 'Recruiter at CodeTalent', 'profile_images/user.png', '', TRUE),
      ('HireUpHR', 'hr6@hireup.com', 1234567896, 2, 'Recruiter at HireUp Solutions', 'profile_images/user.png', '', TRUE);
  `);
}

async function seedPasswords(db) {
  const hash = '$2b$10$jtgd6L7trH.8nm074MrEQ.aUWEx9tqv.Psiewa.kOnPdmRUL6BADO';
  await db.query(`
    INSERT INTO passwords (user_id, hashed_password)
    VALUES
      (1, '${hash}'),
      (2, '${hash}'),
      (3, '${hash}'),
      (4, '${hash}'),
      (5, '${hash}'),
      (6, '${hash}'),
      (7, '${hash}'),
      (8, '${hash}'),
      (9, '${hash}'),
      (10, '${hash}'),
      (11, '${hash}');
  `);
}

async function seedDevelopers(db) {
  await db.query(`
    INSERT INTO developers (user_id, git_name, experience, languages, rating)
    VALUES
      (2, 'mirigerzon', 4, 'JavaScript,Node.js,React,SQL', 5),
      (3, 'sara6310472', 3, 'HTML,CSS,React,JavaScript', 4),
      (4, 'Miri0442', 2, 'TypeScript,React,Next.js,SASS', 4),
      (5, 'michalMenda', 5, 'C#,SQL,JavaScript,Node.js', 5);
  `);
}

async function seedRecruiters(db) {
  await db.query(`
    INSERT INTO recruiters (user_id, company_name)
    VALUES
      (6, 'SmartHire Ltd'),
      (7, 'TechBloom'),
      (8, 'DevSpark'),
      (9, 'ByteBridge'),
      (10, 'CodeTalent'),
      (11, 'HireUp Solutions');
  `);
}

async function seedProjects(db) {
  await db.query(`
    INSERT INTO projects (username, git_name, name, url, languages, details, forks_count, rating, rating_count)
    VALUES
      ('sara', 'sara6310472', 'Fifth_project_-get_the_100-_game_99-', 'https://github.com/sara6310472/Fifth_project_-get_the_100-_game_99-', 'HTML,CSS,JS,React', 'A fun number game built with React', 5, 0, 0),
      ('sara', 'sara6310472', 'First_project_otrio_game_100-', 'https://github.com/sara6310472/First_project_otrio_game_100-', 'JavaScript,Canvas,HTML,CSS', 'Implementation of the Otrio board game', 4, 0, 0),
      ('sara', 'sara6310472', 'Fourth_project_keyboard_99-', 'https://github.com/sara6310472/Fourth_project_keyboard_99-', 'React,JS,CSS,HTML', 'A simulated keyboard learning game', 3, 0, 0),
      ('miri', 'mirigerzon', 'miri-and-dini-react1.1', 'https://github.com/mirigerzon/miri-and-dini-react1.1', 'React,HTML,CSS,Node.js', 'Collaboration project using React', 4, 0, 0),
      ('miri', 'mirigerzon', 'first_year_project1first_year_project1', 'https://github.com/mirigerzon/first_year_project1first_year_project1', 'Python,Flask,HTML,CSS', 'A first year academic project', 3, 0, 0),
      ('miri', 'mirigerzon', 'first_year_project2', 'https://github.com/mirigerzon/first_year_project2', 'Node.js,Express,HTML,CSS', 'Second academic year web project', 2, 0, 0),
      ('miric', 'Miri0442', 'React-Get-To-100', 'https://github.com/Miri0442/React-Get-To-100', 'React,JS,HTML,CSS', 'React version of the Get to 100 game', 5, 0, 0),
      ('miric', 'Miri0442', 'React-Text-Editor', 'https://github.com/Miri0442/React-Text-Editor', 'React,JS,CSS,HTML', 'Simple text editor with formatting options', 4, 0, 0),
      ('miric', 'Miri0442', 'React-World-Clocks', 'https://github.com/Miri0442/React-World-Clocks', 'React,API,JS,CSS', 'Displays world clocks in real-time', 6, 0, 0),
      ('michal', 'michalMenda', 'social-api-project', 'https://github.com/michalMenda/social-api-project', 'Node.js,Express,MongoDB,JWT', 'Social API backend with authentication', 2, 0, 0),
      ('michal', 'michalMenda', 'Interactive-game', 'https://github.com/michalMenda/Interactive-game', 'JavaScript,Canvas,HTML,CSS', 'Canvas-based interactive web game', 3, 0, 0);
  `);
}

async function seedProjectRatings(db) {
  await db.query(`
    INSERT INTO project_ratings (username, project_id, rating)
    VALUES
      ('miri', 1, 5),
      ('sara', 2, 4),
      ('miric', 3, 5);
  `);
}

async function seedJobs(db) {
  await db.query(`
    INSERT INTO jobs (username, company_name, experience, languages, requirements, details, title, is_active, is_seized, created_at, updated_at)
    VALUES
      ('SmartHireHR', 'SmartHire Ltd', 2, 'React,Node.js', '3+ years of React, knowledge of REST APIs', 'Join a fast-growing startup in Tel Aviv. Flexible hours and remote-friendly.', 'Frontend Developer', 1, 0, NOW(), NOW()),
      ('TechBloomHR', 'TechBloom', 3, 'Python,Django', 'Experience with Django ORM and PostgreSQL', 'Innovative AI projects with big data exposure.', 'Backend Developer', 1, 0, NOW(), NOW()),
      ('DevSparkHR', 'DevSpark', 4, 'C#,SQL', 'Strong C# skills and understanding of SQL Server', 'Enterprise-level systems in the fintech industry.', 'Full Stack .NET Developer', 1, 0, NOW(), NOW());
  `);
}

async function seedJobApplications(db) {
  await db.query(`
    INSERT INTO job_applications (user_id, job_id, remark)
    VALUES
      (2, 1, 'Excited for the position!'),
      (3, 2, 'Looking to grow with your company'),
      (4, 3, 'Perfect fit for my experience');
  `);
}

async function seedMessages(db) {
  await db.query(`
    INSERT INTO messages (user_id, email, title, content, is_read)
    VALUES
      (2, 'a05832865@gmail.com', 'Welcome!', 'Welcome to the platform!', FALSE),
      (3, 'sara32806@gmail.com', 'Profile Update', 'Remember to update your profile info.', FALSE),
      (4, 'miricitron7@gmail.com', 'New Feature', 'Check out our latest features.', FALSE);
  `);
}

async function runAllSeeders(db) {
  await seedRoles(db);
  await seedUsers(db);
  await seedPasswords(db);
  await seedDevelopers(db);
  await seedRecruiters(db);
  await seedProjects(db);
  await seedJobs(db);
  await seedJobApplications(db);
  await seedProjectRatings(db);
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
