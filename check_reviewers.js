const mysql = require('mysql2/promise');

async function checkUsers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        const [users] = await connection.execute('SELECT id, role FROM users');
        const [reviewers] = await connection.execute('SELECT user_id FROM reviewers');

        console.log('Total Users:', users.length);
        console.log('User Roles:', [...new Set(users.map(u => u.role))]);
        console.log('Total Reviewers:', reviewers.length);

        const reviewerUserIds = new Set(reviewers.map(r => r.user_id));
        const available = users.filter(u => !reviewerUserIds.has(u.id));

        console.log('Available Users (Not Reviewers):', available.length);
        console.log('Available User Sample:', available.slice(0, 5));

    } catch (e) {
        console.log(e);
    }
    await connection.end();
}

checkUsers();
