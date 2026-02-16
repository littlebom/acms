const mysql = require('mysql2/promise');

async function testSpeakerRoleIntegration() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        console.log('\n🧪 Testing Speaker Role Integration\n');
        console.log('='.repeat(60));

        // Test 1: Verify role ENUM includes 'speaker'
        console.log('\n✅ Test 1: Database Schema');
        const [columns] = await connection.execute(
            "SHOW COLUMNS FROM users WHERE Field = 'role'"
        );
        const roleColumn = columns[0];
        console.log(`   Role ENUM: ${roleColumn.Type}`);

        if (roleColumn.Type.includes('speaker')) {
            console.log('   ✅ Speaker role exists in database');
        } else {
            console.log('   ❌ Speaker role NOT found in database');
        }

        // Test 2: Count users by role
        console.log('\n✅ Test 2: User Role Distribution');
        const [roleCounts] = await connection.execute(
            'SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC'
        );

        roleCounts.forEach(row => {
            console.log(`   ${row.role}: ${row.count} user(s)`);
        });

        // Test 3: Check if any speakers exist
        console.log('\n✅ Test 3: Existing Speakers');
        const [speakers] = await connection.execute(
            "SELECT id, first_name, last_name, email FROM users WHERE role = 'speaker'"
        );

        if (speakers.length > 0) {
            console.log(`   Found ${speakers.length} speaker(s):`);
            speakers.forEach(speaker => {
                console.log(`   • ${speaker.first_name} ${speaker.last_name} (${speaker.email})`);
            });
        } else {
            console.log('   No users with speaker role found yet');
            console.log('   (This is expected if you haven\'t created any speakers)');
        }

        // Test 4: Check speaker_group_members
        console.log('\n✅ Test 4: Speaker Group Members');
        const [groupMembers] = await connection.execute(`
            SELECT sgm.group_id, u.first_name, u.last_name, u.role, sg.title
            FROM speaker_group_members sgm
            JOIN users u ON sgm.user_id = u.id
            JOIN speaker_groups sg ON sgm.group_id = sg.id
            ORDER BY sgm.group_id
        `);

        if (groupMembers.length > 0) {
            console.log(`   Found ${groupMembers.length} speaker(s) in groups:`);
            groupMembers.forEach(member => {
                console.log(`   • ${member.first_name} ${member.last_name} (Role: ${member.role}) in "${member.title}"`);
            });
        } else {
            console.log('   No speakers assigned to groups yet');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ All tests completed!\n');

    } catch (error) {
        console.error('\n❌ Test failed:');
        console.error(`   ${error.message}\n`);
    } finally {
        await connection.end();
    }
}

testSpeakerRoleIntegration();
