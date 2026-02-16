import mysql from 'mysql2/promise';

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('Connected to MySQL server.');

  try {
    // Create Database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'acms_db'}`);
    console.log('Database created or already exists.');

    await connection.changeUser({ database: process.env.DB_NAME || 'acms_db' });

    // Read schema file (mocking reading file content since I can't easily read it here in one go without fs, 
    // but I will just execute the CREATE TABLE statements directly for simplicity in this seed script 
    // to ensure it works standalone)

    const schema = `
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role ENUM('admin', 'chair', 'reviewer', 'author', 'attendee') DEFAULT 'attendee',
          profile_image VARCHAR(255),
          bio TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name_en VARCHAR(255) NOT NULL,
          name_th VARCHAR(255),
          description TEXT,
          theme_color_primary VARCHAR(50),
          theme_color_accent VARCHAR(50),
          logo_url VARCHAR(255),
          venue_name VARCHAR(255),
          venue_map_url TEXT,
          start_date DATE,
          end_date DATE,
          submission_deadline DATETIME,
          registration_deadline DATETIME,
          is_active BOOLEAN DEFAULT TRUE
      );
    `;

    await connection.query(schema);
    console.log('Tables created.');

    // Create Tickets Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tickets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          event_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          quota INT,
          available_until DATETIME,
          FOREIGN KEY (event_id) REFERENCES events(id)
      );
    `);

    // Create Registrations Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          ticket_id INT NOT NULL,
          status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
          payment_proof_url VARCHAR(255),
          registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (ticket_id) REFERENCES tickets(id)
      );
    `);
    console.log('Registration tables created.');

    // Create Papers Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS papers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          abstract TEXT,
          keywords VARCHAR(255),
          track VARCHAR(100),
          file_url VARCHAR(255),
          status ENUM('submitted', 'under_review', 'accepted', 'rejected') DEFAULT 'submitted',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Create Reviewers Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviewers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          expertise VARCHAR(255),
          FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Create Reviews Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          paper_id INT NOT NULL,
          reviewer_id INT NOT NULL,
          rating INT CHECK (rating >= 1 AND rating <= 5),
          comment_to_author TEXT,
          comment_confidential TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (paper_id) REFERENCES papers(id),
          FOREIGN KEY (reviewer_id) REFERENCES reviewers(id)
      );
    `);
    console.log('Academic tables created.');

    // Seed Tickets
    await connection.query(`
      INSERT IGNORE INTO tickets (id, event_id, name, price, quota) VALUES 
      (1, 1, 'Early Bird', 2500.00, 100),
      (2, 1, 'Regular', 4500.00, 500),
      (3, 1, 'Student', 1500.00, 200);
    `);
    console.log('Tickets seeded.');

    // Seed Admin User
    // Note: In real app, password should be hashed.
    await connection.query(`
      INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role)
      VALUES ('admin@example.com', 'password', 'Admin', 'User', 'admin');
    `);
    console.log('Admin user seeded.');

    // Seed Initial Event
    await connection.query(`
      INSERT IGNORE INTO events (id, name_en, name_th, venue_name, start_date, end_date)
      VALUES (1, 'ACMS 2025: Future of Tech', 'การประชุมวิชาการ ACMS 2568', 'Bangkok Convention Center', '2025-11-24', '2025-11-26');
    `);
    console.log('Initial event seeded.');

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await connection.end();
  }
}

seed();
