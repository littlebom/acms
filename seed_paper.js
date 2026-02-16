const mysql = require('mysql2/promise');

async function seed() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'KKiabkob',
            database: process.env.DB_NAME || 'acms_db'
        });

        console.log('Connected to database');

        // 1. Insert Paper
        const [paperResult] = await connection.execute(
            `INSERT INTO papers (
                title, title_th, abstract, abstract_th, 
                keywords, keywords_th, track_id, event_id, 
                user_id, submitter_id, status, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                'Generative AI in Modern Classrooms: Opportunities and Challenges',
                'Generative AI ในห้องเรียนยุคใหม่: โอกาสและความท้าทาย',
                'This research explores the integration of Generative AI tools in higher education. We analyze student engagement and learning outcomes across three universities in Thailand. The results suggest that while AI enhances creativity, it also poses challenges for assessment integrity.',
                'งานวิจัยนี้สำรวจการบูรณาการเครื่องมือ Generative AI ในระดับอุดมศึกษา เราวิเคราะห์การมีส่วนร่วมและผลลัพธ์การเรียนรู้ของนักศึกษาในมหาวิทยาลัย 3 แห่งในประเทศไทย ผลการศึกษาชี้ว่าแม้ AI จะช่วยส่งเสริมความคิดสร้างสรรค์ แต่ก็สร้างความท้าทายด้านความซื่อสัตย์ในการประเมินผล',
                'Generative AI, Education, EdTech, Assessment',
                'ปัญญาประดิษฐ์สร้างสรรค์, การศึกษา, เทคโนโลยีการศึกษา, การประเมินผล',
                6, // AI in Education
                7, // Event ID
                58, // user_id (Owner)
                58, // submitter_id (Submitter)
                'submitted'
            ]
        );

        const paperId = paperResult.insertId;
        console.log(`Created paper with ID: ${paperId}`);

        // 2. Insert Author (Jira)
        await connection.execute(
            `INSERT INTO paper_authors (paper_id, user_id, first_name, last_name, email, institution, country, author_order, is_corresponding)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`,
            [paperId, 58, 'Jira', 'Chonraksuk', 'jira@lifeskill.in.th', 'Lifeskill.co,.Ltd', 'Thailand']
        );
        console.log('Added primary author');

        // 3. Insert Co-Author (Mock)
        await connection.execute(
            `INSERT INTO paper_authors (paper_id, first_name, last_name, email, institution, country, author_order, is_corresponding)
             VALUES (?, ?, ?, ?, ?, ?, 2, 0)`,
            [paperId, 'Sarah', 'Connor', 'sarah@example.com', 'Tech University', 'USA']
        );
        console.log('Added co-author');

        // 4. Insert File (Mock)
        await connection.execute(
            `INSERT INTO paper_files (paper_id, file_name, file_path, file_size, file_type, version_type, uploaded_by)
             VALUES (?, ?, ?, ?, ?, 'original', ?)`,
            [paperId, 'demo_paper_2026.pdf', '/uploads/papers/demo_paper_2026.pdf', 1024500, 'application/pdf', 58]
        );
        console.log('Added paper file record');

        await connection.end();
        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

seed();
