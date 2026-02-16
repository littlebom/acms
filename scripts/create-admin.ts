import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

async function createAdmin() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db',
    });

    // Admin credentials
    const adminEmail = 'admin@acms.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    try {
        // Check if admin already exists
        const [existing] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [adminEmail]
        );

        if ((existing as any[]).length > 0) {
            console.log('❌ Admin user already exists!');
            await connection.end();
            return;
        }

        // Insert admin user
        await connection.execute(
            `INSERT INTO users (email, password_hash, first_name, last_name, role) 
             VALUES (?, ?, ?, ?, ?)`,
            [adminEmail, hashedPassword, 'System', 'Admin', 'admin']
        );

        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('📧 Email:    admin@acms.com');
        console.log('🔑 Password: admin123');
        console.log('');
    } catch (error) {
        console.error('Error creating admin:', error);
    }

    await connection.end();
}

createAdmin();
