import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function refreshAttendees() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db',
    });

    try {
        console.log('🗑️ Cleaning up...');

        // 0. Find relevant user IDs
        const [rows] = await connection.execute("SELECT id FROM users WHERE role = 'attendee'") as any;
        const attendeeIds = rows.map((r: any) => r.id);

        if (attendeeIds.length > 0) {
            const idList = attendeeIds.join(',');
            await connection.execute(`DELETE FROM reviews WHERE paper_id IN (SELECT id FROM papers WHERE user_id IN (${idList}))`);
            await connection.execute(`DELETE FROM papers WHERE user_id IN (${idList})`);
            await connection.execute(`DELETE FROM users WHERE id IN (${idList})`);
        }

        console.log('✅ Cleaned up old data.');

        const attendees = [
            {
                email: 'somchai@example.com',
                firstName: 'Somchai',
                lastName: 'Jaidee',
                title: 'Mr.',
                gender: 'Male',
                birthYear: 1985,
                phone: '081-234-5678',
                address: '123 Sukhumvit Road, Watthana, Bangkok 10110',
                education: "Master's Degree",
                occupation: 'Senior Software Engineer',
                institution: 'Tech Innovations Thailand Co., Ltd.',
                country: 'Thailand',
                bio: 'Passionate software engineer with over 10 years of experience in full-stack development. Interested in AI, Cloud Computing, and Badminton.'
            },
            {
                email: 'somsri@example.com',
                firstName: 'Somsri',
                lastName: 'Rakrian',
                title: 'Dr.',
                gender: 'Female',
                birthYear: 1990,
                phone: '089-876-5432',
                address: '456 Phaya Thai Road, Pathum Wan, Bangkok 10330',
                education: 'Doctorate',
                occupation: 'University Lecturer',
                institution: 'Chulalongkorn University',
                country: 'Thailand',
                bio: 'Academic researcher focusing on Environmental Science and Sustainable Development. Published 15 papers in international journals.'
            },
            {
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe',
                title: 'Prof.',
                gender: 'Male',
                birthYear: 1975,
                phone: '+1 555-0199',
                address: '789 Broadway Ave, New York, NY 10003, USA',
                education: 'Doctorate',
                occupation: 'Professor of Computer Science',
                institution: 'Massachusetts Institute of Technology (MIT)',
                country: 'USA',
                bio: 'Visiting professor specializing in Quantum Computing and Cryptography. Love traveling and photography.'
            }
        ];

        console.log('✨ Creating new attendees with RICH data...');
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        for (const user of attendees) {
            await connection.execute(
                `INSERT INTO users (
                    email, password_hash, first_name, last_name, role, 
                    title, gender, birth_year, phone_number, address, 
                    education_level, occupation, institution, country, bio
                ) VALUES (?, ?, ?, ?, 'attendee', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user.email, hashedPassword, user.firstName, user.lastName,
                    user.title, user.gender, user.birthYear, user.phone, user.address,
                    user.education, user.occupation, user.institution, user.country, user.bio
                ]
            );
            console.log(`   + Created: ${user.title} ${user.firstName} ${user.lastName}`);
        }

        console.log('\n✅ All Done!');
        console.log('Default Password for all: password123');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

refreshAttendees();
