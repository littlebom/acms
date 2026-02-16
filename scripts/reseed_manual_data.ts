
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function seed() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob', // Explicit password from .env
        database: 'acms_db'
    });

    try {
        console.log('Connected to DB...');

        // 1. Ensure Reviewer User exists
        const reviewerHash = await bcrypt.hash('password', 10);
        const [rRes] = await connection.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ('reviewer@example.com', ?, 'Dr. Reviewer', 'Expert', 'reviewer')
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
    `, [reviewerHash]) as any;
        const reviewerId = rRes.insertId;
        console.log('Reviewer ID:', reviewerId);

        // 2. Ensure Author User exists
        const authorHash = await bcrypt.hash('password', 10);
        // Check if user exists first to get ID
        const [users] = await connection.query(`SELECT id FROM users WHERE email = 'user_manual_final_v1@example.com'`) as any;
        let authorId;

        if (users.length > 0) {
            authorId = users[0].id;
            console.log('Existing Author ID:', authorId);
        } else {
            const [newAuth] = await connection.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role)
            VALUES ('user_manual_final_v1@example.com', ?, 'Demo', 'User', 'attendee')
        `, [authorHash]) as any;
            authorId = newAuth.insertId;
            console.log('New Author ID:', authorId);
        }

        // 3. Create Paper for Revision (Author View)
        // Check if paper already exists to avoid duplicates
        const [papers] = await connection.query(`SELECT id FROM papers WHERE title = 'AI in Education: A Comprehensive Study' AND user_id = ?`, [authorId]) as any;
        if (papers.length === 0) {
            await connection.query(`
          INSERT INTO papers (user_id, title, abstract, track, status, created_at)
          VALUES (?, 'AI in Education: A Comprehensive Study', 'This paper explores...', 'Computer Science', 'revision_required', NOW())
        `, [authorId]);
            console.log('Created Revision Paper');
        } else {
            console.log('Revision Paper already exists');
        }

        // 4. Create Paper for Review (Reviewer View)
        const [reviewPapers] = await connection.query(`SELECT id FROM papers WHERE title = 'Machine Learning for Healthcare' AND user_id = ?`, [authorId]) as any;
        let paperId;
        if (reviewPapers.length === 0) {
            const [pRes] = await connection.query(`
          INSERT INTO papers (user_id, title, abstract, track, status, created_at)
          VALUES (?, 'Machine Learning for Healthcare', 'Analyzing medical data...', 'Health Tech', 'under_review', NOW())
        `, [authorId]) as any;
            paperId = pRes.insertId;
            console.log('Created Review Paper');
        } else {
            paperId = reviewPapers[0].id;
            console.log('Review Paper already exists');
        }


        // Assign Reviewer
        // Check if review assignment exists
        // We need reviewer profile id (from reviewers table)
        const [revProfiles] = await connection.query(`SELECT id FROM reviewers WHERE user_id = ?`, [reviewerId]) as any;
        let reviewerProfileId;
        if (revProfiles.length === 0) {
            const [newProf] = await connection.query(`INSERT INTO reviewers (user_id, expertise) VALUES (?, 'AI, Health')`, [reviewerId]) as any;
            reviewerProfileId = newProf.insertId;
            console.log('Created Reviewer Profile');
        } else {
            reviewerProfileId = revProfiles[0].id;
        }

        const [reviews] = await connection.query(`SELECT id FROM reviews WHERE paper_id = ? AND reviewer_id = ?`, [paperId, reviewerProfileId]) as any;
        if (reviews.length === 0) {
            await connection.query(`
            INSERT INTO reviews (paper_id, reviewer_id, rating, comment_to_author)
            VALUES (?, ?, NULL, NULL)
        `, [paperId, reviewerProfileId]);
            console.log('Assigned Reviewer');
        }

        // 5. Create Registration with Slip (Admin View)
        // Get valid ticket ID
        const [tickets] = await connection.query(`SELECT id FROM tickets LIMIT 1`) as any;
        let ticketId;
        if (tickets.length === 0) {
            const [newTicket] = await connection.query(`INSERT INTO tickets (name, price, quantity, available_quantity) VALUES ('Early Bird Settings', 1000, 100, 100)`) as any;
            ticketId = newTicket.insertId;
            console.log('Created Ticket for seeding');
        } else {
            ticketId = tickets[0].id;
        }

        const [regs] = await connection.query(`SELECT id FROM registrations WHERE user_id = ? AND ticket_id = ?`, [authorId, ticketId]) as any;
        if (regs.length === 0) {
            await connection.query(`
          INSERT INTO registrations (user_id, ticket_id, status, payment_proof_url, registered_at)
          VALUES (?, ?, 'pending', '/uploads/dummy_slip.jpg', NOW())
        `, [authorId, ticketId]);
            console.log('Created Pending Registration');
        }

        console.log('Seeding detailed data complete.');

    } catch (err) {
        console.error('Error seeding details:', err);
    } finally {
        await connection.end();
    }
}

seed();
