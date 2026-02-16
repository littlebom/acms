const mysql = require('mysql2/promise');

async function deleteMultipleUsers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        // List of users to delete (by name)
        const usersToDelete = [
            'Suda Rakrian',
            'Somchai Jaidee',
            'Somsri Rakrian',
            'John Doe',
            'John Reviewer'
        ];

        console.log('\n🗑️  Deleting Multiple Users\n');
        console.log('='.repeat(60));

        for (const userName of usersToDelete) {
            console.log(`\n📝 Processing: ${userName}`);

            // Find user by name (combining first_name and last_name)
            const [users] = await connection.execute(
                `SELECT id, first_name, last_name, email, role 
                 FROM users 
                 WHERE CONCAT(first_name, ' ', last_name) = ?`,
                [userName]
            );

            if (users.length === 0) {
                console.log(`   ⚠️  User not found: ${userName}`);
                continue;
            }

            const user = users[0];
            console.log(`   ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);

            // Start transaction for this user
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
                        // Table might not exist or column doesn't match, ignore
                        if (err.code !== 'ER_NO_SUCH_TABLE' && err.code !== 'ER_BAD_FIELD_ERROR') {
                            console.log(`   ⚠️  Error in ${table}: ${err.message}`);
                        }
                    }
                }

                // Finally delete the user
                const [userResult] = await connection.execute(
                    'DELETE FROM users WHERE id = ?',
                    [user.id]
                );

                // Commit transaction
                await connection.commit();

                console.log(`   ✅ Successfully deleted (${totalDeleted} related records)`);

            } catch (error) {
                // Rollback on error
                await connection.rollback();
                console.log(`   ❌ Failed: ${error.message}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Batch deletion completed!\n');

    } catch (error) {
        console.error('\n❌ Fatal error:');
        console.error(`   ${error.message}\n`);
    } finally {
        await connection.end();
    }
}

deleteMultipleUsers();
