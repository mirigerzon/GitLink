const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../SERVER/.env' });

async function seed() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  // --- Users
  await db.query(`
  INSERT INTO users (
  username, git_name, email, phone, experience, languages, role, rating, about, profile_image)
  VALUES 
    ('alice', 'aliceGH', 'alice@example.com', 123456789, 3, 'JavaScript,Python', 'admin', 5, 'Full-stack developer', 'alice.jpg'),
    ('bob', 'bobGH', 'bob@example.com', 234567891, 2, 'C++,C#', 'user', 4, 'Backend enthusiast', 'bob.jpg'),
    ('charlie', 'charlieGH', 'charlie@example.com', 345678912, 5, 'Java,Go', 'user', 3, 'Java expert', 'charlie.jpg')
`);


  // --- Passwords (pre-hashed)
  await db.query(`INSERT INTO passwords (user_id, hashed_password)
      VALUES 
      (1, '$2b$10$AGyVGvmsBM/22bB/ZSvn..KQdBh1CEP/eAICxCmXg9qp0P8C9GTUK'),
      (2, '$2b$10$knYSIsliqk2UTbdzMH12z.8vYQBG5ITTzlBXvjOWFi3OSYVxHWF/2'),
      (3, '$2b$10$g74BvDTnDJOs84FEcUqCcOZayxhwqXdi8DQ87fS9Qrj3LU3EqilQu')
  `);

  // --- Projects
  await db.query(`INSERT INTO projects (git_name, name, url, languages, details, views)
      VALUES 
      ('aliceGH', 'Portfolio', 'https://github.com/alice/portfolio', 'HTML,CSS,JS', 'Personal site', 10),
      ('aliceGH', 'Blog Engine', 'https://github.com/alice/blog', 'Node.js', 'Blog backend', 5),
      ('bobGH', 'Calculator', 'https://github.com/bob/calc', 'C++', 'CLI calculator', 7),
      ('charlieGH', 'API Server', 'https://github.com/charlie/api', 'Go', 'REST API', 12)
  `);

  // --- Jobs
  await db.query(`INSERT INTO jobs (user_id, name, experience, languages, views)
      VALUES 
      (1, 'Frontend Dev', 2, 'React,TypeScript', 20),
      (2, 'Embedded Dev', 3, 'C,C++', 15),
      (3, 'Backend Dev', 4, 'Java,Spring', 9)
  `);

  // --- Messages
  await db.query(`INSERT INTO massages (title, content, user_id)
      VALUES 
      ('Welcome!', 'Welcome to the platform!', 1),
      ('Tip', 'Do not forget to update your profile.', 2),
      ('Alert', 'New job posted in your field.', 3)
  `);

  console.log("✅ Database seeded successfully.");
  await db.end();
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err.message);
});
