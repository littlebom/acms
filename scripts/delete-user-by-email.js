const mysql = require('mysql2/promise');

async function deleteUserByEmail() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        const email = 'testuser3@example.com';

        console.log(`\n🔍 Searching for user: ${email}\n`);

        // Find user by email
        const [users] = await connection.execute(
            'SELECT id, first_name, last_name, email, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            console.log(`❌ User not found with email: ${email}\n`);
            return;
        }

        const user = users[0];
        console.log('📝 User Information:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}\n`);

        // Start transaction
        await connection.beginTransaction();

        try {
            let totalDeleted = 0;

            // Delete from all related tables
            const relatedTables = [
                { table: 'answers', column: 'user_id' },
                { table: 'papers', column: 'user_id' },
                { table: 'reviewers', column: 'user_id' },
                { table: 'registrations', column: 'user_id' },
                { table: 'session_speakers', column: 'user_id' },
                { table: 'questionnaire_responses', column: 'user_id' },
                { table: 'speaker_group_members', column: 'user_id' },
            ];

            console.log('🗑️  Deleting related records...');

            for (const { table, column } of relatedTables) {
                try {
                    const [result] = await connection.execute(
                        `DELETE FROM ${table} WHERE ${column} = ?`,
                        [user.id]
                    );
                    if (result.affectedRows > 0) {
                        console.log(`   • ${table}: ${result.affectedRows} record(s)`);
                        totalDeleted += result.affectedRows;
                    }
                } catch (err) {
                    if (err.code !== 'ER_NO_SUCH_TABLE' && err.code !== 'ER_BAD_FIELD_ERROR') {
                        console.log(`   ⚠️  Error in ${table}: ${err.message}`);
                    }
                }
            }

            // Delete the user
            const [userResult] = await connection.execute(
                'DELETE FROM users WHERE id = ?',
                [user.id]
            );

            // Commit transaction
            await connection.commit();

            console.log(`\n✅ User successfully deleted!`);
            console.log(`   Related records deleted: ${totalDeleted}\n`);

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('\n❌ Error:');
        console.error(`   ${error.message}\n`);
    } finally {
        await connection.end();
    }
}

deleteUserByEmail();
