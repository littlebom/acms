const mysql = require('mysql2/promise');

async function checkUserReferences() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        const email = 'test-1719280927@example.com';

        // Get user ID
        const [users] = await connection.execute(
            'SELECT id, first_name, last_name, email, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            console.log('❌ User not found');
            return;
        }

        const user = users[0];
        console.log('\n👤 User Information:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}\n`);

        // Check all tables with foreign keys to users
        const checks = [
            { table: 'papers', column: 'user_id', label: 'Papers' },
            { table: 'reviewers', column: 'user_id', label: 'Reviewer Profiles' },
            { table: 'registrations', column: 'user_id', label: 'Event Registrations' },
            { table: 'session_speakers', column: 'user_id', label: 'Session Speakers' },
            { table: 'notifications', column: 'user_id', label: 'Notifications' },
            { table: 'questionnaire_responses', column: 'user_id', label: 'Questionnaire Responses' },
        ];

        console.log('🔍 Checking Foreign Key References:\n');
        let hasReferences = false;

        for (const check of checks) {
            try {
                const [rows] = await connection.execute(
                    `SELECT COUNT(*) as count FROM ${check.table} WHERE ${check.column} = ?`,
                    [user.id]
                );
                const count = rows[0].count;

                if (count > 0) {
                    console.log(`   ⚠️  ${check.label}: ${count} record(s) found`);
                    hasReferences = true;
                } else {
                    console.log(`   ✅ ${check.label}: No records`);
                }
            } catch (error) {
                console.log(`   ⏭️  ${check.label}: Table doesn't exist (${error.code})`);
            }
        }

        if (hasReferences) {
            console.log('\n❌ Cannot delete user: Foreign key constraints exist!');
            console.log('   You need to delete related records first or use CASCADE delete.\n');
        } else {
            console.log('\n✅ User can be safely deleted (no foreign key constraints)\n');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkUserReferences();
