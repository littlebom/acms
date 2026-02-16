const mysql = require('mysql2/promise');

async function migrateSpeakersRole() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        console.log('\n🔄 Migrating Existing Speakers to Speaker Role\n');
        console.log('='.repeat(60));

        // Get all users in speaker_group_members
        const [members] = await connection.execute(`
            SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, u.role
            FROM speaker_group_members sgm
            JOIN users u ON sgm.user_id = u.id
            ORDER BY u.id
        `);

        if (members.length === 0) {
            console.log('✅ No speaker group members found\n');
            return;
        }

        console.log(`Found ${members.length} user(s) in speaker groups:\n`);

        let updatedCount = 0;
        let alreadySpeakerCount = 0;

        for (const member of members) {
            if (member.role === 'speaker') {
                console.log(`   ✓ ${member.first_name} ${member.last_name} (${member.email}) - Already speaker`);
                alreadySpeakerCount++;
            } else {
                console.log(`   → ${member.first_name} ${member.last_name} (${member.email}) - ${member.role} → speaker`);

                await connection.execute(
                    "UPDATE users SET role = 'speaker' WHERE id = ?",
                    [member.id]
                );
                updatedCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✅ Migration completed!`);
        console.log(`   Updated: ${updatedCount} user(s)`);
        console.log(`   Already speaker: ${alreadySpeakerCount} user(s)`);
        console.log(`   Total: ${members.length} user(s)\n`);

    } catch (error) {
        console.error('\n❌ Migration failed:');
        console.error(`   ${error.message}\n`);
    } finally {
        await connection.end();
    }
}

migrateSpeakersRole();
