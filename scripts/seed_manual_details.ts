
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'acms_db'
    });

    try {
        // 1. Ensure Reviewer User exists
        const reviewerHash = await bcrypt.hash('password', 10);
        const [rRes] = await connection.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ('reviewer@example.com', ?, 'Dr. Reviewer', 'Expert', 'reviewer')
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
    `, [reviewerHash]) as any;
        const reviewerId = rRes.insertId;

        // 2. Ensure Author User exists (from previous step)
        // We'll use user_manual_final_v1@example.com if exists, else create
        const authorHash = await bcrypt.hash('password', 10);
        const [aRes] = await connection.query(`
        SELECT id FROM users WHERE email = 'user_manual_final_v1@example.com'
    `) as any;

        let authorId;
        if (aRes.length > 0) {
            authorId = aRes[0].id;
        } else {
            const [newAuth] = await connection.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role)
            VALUES ('user_manual_final_v1@example.com', ?, 'Demo', 'User', 'attendee')
        `, [authorHash]) as any;
            authorId = newAuth.insertId;
        }

        // 3. Create Paper for Revision (Author View)
        await connection.query(`
      INSERT INTO papers (user_id, title, abstract, track, status, created_at)
      VALUES (?, 'AI in Education: A Comprehensive Study', 'This paper explores...', 'Computer Science', 'revision_required', NOW())
    `, [authorId]);

        // 4. Create Paper for Review (Reviewer View) and Assign
        const [pRes] = await connection.query(`
      INSERT INTO papers (user_id, title, abstract, track, status, created_at)
      VALUES (?, 'Machine Learning for Healthcare', 'Analyzing medical data...', 'Health Tech', 'under_review', NOW())
    `, [authorId]) as any;
        const paperId = pRes.insertId;

        // Check if reviewer entry exists in 'reviewers' table (if your schema separates user role from reviewer profile)
        // Based on previous schema, 'reviewers' table links to 'users'
        const [revProfile] = await connection.query(`SELECT id FROM reviewers WHERE user_id = ?`, [reviewerId]) as any;
        let reviewerProfileId;
        if (revProfile.length === 0) {
            const [newRev] = await connection.query(`INSERT INTO reviewers (user_id, expertise) VALUES (?, 'AI, Health')`, [reviewerId]) as any;
            reviewerProfileId = newRev.insertId;
        } else {
            reviewerProfileId = revProfile[0].id;
        }

        // Assign Reviewer
        await connection.query(`
        INSERT INTO reviews (paper_id, reviewer_id, rating, comment_to_author)
        VALUES (?, ?, NULL, NULL)
    `, [paperId, reviewerProfileId]);

        // 5. Create Registration with Slip (Admin View)
        // Using Ticket ID 1 (Early Bird from seed.ts)
        await connection.query(`
      INSERT INTO registrations (user_id, ticket_id, status, payment_proof_url, registered_at)
      VALUES (?, 1, 'pending', '/uploads/dummy_slip.jpg', NOW())
    `, [authorId]);

        console.log('Seeding detailed data complete.');

    } catch (err) {
        console.error('Error seeding details:', err);
    } finally {
        await connection.end();
    }
}

seed();
