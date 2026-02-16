import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function seedTestData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'KKiabkob',
        database: process.env.DB_NAME || 'acms_db',
    });

    console.log('Connected to MySQL.');

    try {
        // 1. Create a test user (author)
        const hashedPassword = await bcrypt.hash('password123', 10);
        const [userResult] = await connection.query(`
      INSERT INTO users (first_name, last_name, email, password_hash, role)
      VALUES ('Jane', 'Author', 'jane.author@test.com', ?, 'attendee')
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
    `, [hashedPassword]) as any;
        const authorId = userResult.insertId || userResult.id;
        console.log('Test author created:', authorId);

        // 2. Create a test reviewer
        const [reviewerUserResult] = await connection.query(`
      INSERT INTO users (first_name, last_name, email, password_hash, role)
      VALUES ('John', 'Reviewer', 'john.reviewer@test.com', ?, 'reviewer')
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
    `, [hashedPassword]) as any;
        const reviewerUserId = reviewerUserResult.insertId || reviewerUserResult.id;
        console.log('Test reviewer user created:', reviewerUserId);

        // 3. Create reviewer entry
        const [reviewerResult] = await connection.query(`
      INSERT INTO reviewers (user_id, expertise)
      VALUES (?, 'Machine Learning, AI')
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
    `, [reviewerUserId]) as any;
        const reviewerId = reviewerResult.insertId || reviewerResult.id;
        console.log('Reviewer entry created:', reviewerId);

        // 4. Create test papers
        const papers = [
            {
                title: 'Deep Learning for Medical Diagnosis',
                abstract: 'This paper explores the application of deep learning techniques in automated medical diagnosis, focusing on image recognition and pattern detection in radiology.',
                track: 'AI & Machine Learning',
                userId: authorId
            },
            {
                title: 'Blockchain in Supply Chain Management',
                abstract: 'An analysis of blockchain technology implementation in supply chain systems, examining transparency, security, and efficiency improvements.',
                track: 'Software Engineering',
                userId: authorId
            }
        ];

        for (const paper of papers) {
            const [paperResult] = await connection.query(`
        INSERT INTO papers (user_id, title, abstract, track, file_url, status)
        VALUES (?, ?, ?, ?, 'https://example.com/paper.pdf', 'submitted')
      `, [paper.userId, paper.title, paper.abstract, paper.track]) as any;

            const paperId = paperResult.insertId;
            console.log(`Paper created: ${paper.title} (ID: ${paperId})`);

            // 5. Assign reviewer and create review
            await connection.query(`
        INSERT INTO reviews (paper_id, reviewer_id, rating, comment_to_author, comment_confidential)
        VALUES (?, ?, ?, ?, ?)
      `, [
                paperId,
                reviewerId,
                Math.floor(Math.random() * 2) + 4, // Random 4 or 5
                'This is a well-written paper with strong methodology. The results are clearly presented and the conclusions are well-supported by the data.',
                'I recommend acceptance. The author has addressed all major concerns.'
            ]);

            // Update paper status
            await connection.query(`
        UPDATE papers SET status = 'under_review' WHERE id = ?
      `, [paperId]);

            console.log(`Review created for paper ${paperId}`);
        }

        console.log('\n✅ Test data seeded successfully!');
        console.log('\nTest Accounts:');
        console.log('- Admin: admin@example.com / password');
        console.log('- Author: jane.author@test.com / password123');
        console.log('- Reviewer: john.reviewer@test.com / password123');

    } catch (err) {
        console.error('Error seeding test data:', err);
    } finally {
        await connection.end();
    }
}

seedTestData();
