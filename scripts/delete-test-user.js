const mysql = require('mysql2/promise');

async function deleteTestUsers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        console.log('\n🔍 Searching for users named "Test User"...\n');

        // Find all users with first_name = 'Test' and last_name = 'User'
        const [users] = await connection.execute(
            `SELECT id, first_name, last_name, email, role 
             FROM users 
             WHERE first_name = 'Test' AND last_name = 'User'`
        );

        if (users.length === 0) {
            console.log('✅ No users found with name "Test User"\n');
            return;
        }

        console.log(`Found ${users.length} user(s) named "Test User"\n`);
        console.log('='.repeat(60));

        for (const user of users) {
            console.log(`\n📝 Processing User ID: ${user.id}`);
            console.log(`   Name: ${user.first_name} ${user.last_name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);

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

                for (const { table, column } of relatedTables) {
                    try {
                        const [result] = await connection.execute(
                            `DELETE FROM ${table} WHERE ${column} = ?`,
                            [user.id]
                        );
                        if (result.affectedRows > 0) {
                            console.log(`   • Deleted ${result.affectedRows} record(s) from ${table}`);
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

                console.log(`   ✅ Successfully deleted (${totalDeleted} related records)`);

            } catch (error) {
                await connection.rollback();
                console.log(`   ❌ Failed: ${error.message}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✅ Deleted ${users.length} "Test User" account(s)!\n`);

    } catch (error) {
        console.error('\n❌ Fatal error:');
        console.error(`   ${error.message}\n`);
    } finally {
        await connection.end();
    }
}

deleteTestUsers();
