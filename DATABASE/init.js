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
    VALUES ('developer'), ('recruiter'), ('admin')
    ON DUPLICATE KEY UPDATE role=role;
  `);
}

async function seedUsers(db) {
  await db.query(`
    INSERT INTO users (username, email, phone, role_id, about, profile_image, cv_file, status)
    VALUES
      ('admin', 'gitlink10@gmail.com', 1234567890, 3, 'System administrator', 'profile_images/user.png', '', TRUE),
      ('sara', 'sara3280624@gmail.com', 583280624, 1, 'Frontend developer who loves turning designs into reality.', 'https://github.com/sara6310472.png', 'cv_files/sara6310472-cv.pdf', TRUE)
    ON DUPLICATE KEY UPDATE email=VALUES(email);
  `);
}

async function seedPasswords(db) {
  const hash = '$2b$10$jtgd6L7trH.8nm074MrEQ.aUWEx9tqv.Psiewa.kOnPdmRUL6BADO';
  await db.query(`
    INSERT INTO passwords (user_id, hashed_password)
    VALUES
      (1, '${hash}'),
      (2, '${hash}')
    ON DUPLICATE KEY UPDATE hashed_password=VALUES(hashed_password);
  `);
}

async function seedDevelopers(db) {
  await db.query(`
    INSERT INTO developers (user_id, git_name, experience, languages, rating)
    VALUES
      (2, 'sara6310472', 3, 'HTML,CSS,React,JavaScript', 4)
    ON DUPLICATE KEY UPDATE git_name=VALUES(git_name);
  `);
}

async function seed() {
  const db = await getDbConnection();
  try {
    await seedRoles(db);
    await seedUsers(db);
    await seedPasswords(db);
    await seedDevelopers(db);
    console.log("✅ Minimal seeding completed: only admin and sara.");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  } finally {
    await db.end();
  }
}

seed();
