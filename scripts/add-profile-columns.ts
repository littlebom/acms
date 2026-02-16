import mysql from 'mysql2/promise';

async function addProfileColumns() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db',
    });

    const columnsToAdd = [
        "ADD COLUMN title VARCHAR(50) NULL AFTER email",
        "ADD COLUMN gender VARCHAR(50) NULL AFTER title",
        "ADD COLUMN birth_year INT NULL AFTER gender",
        "ADD COLUMN phone_number VARCHAR(50) NULL AFTER birth_year",
        "ADD COLUMN address TEXT NULL AFTER phone_number",
        "ADD COLUMN education_level VARCHAR(100) NULL AFTER address",
        "ADD COLUMN occupation VARCHAR(100) NULL AFTER education_level",
        "ADD COLUMN institution VARCHAR(255) NULL AFTER occupation",
        "ADD COLUMN country VARCHAR(100) NULL AFTER institution"
    ];

    try {
        console.log('Using database: acms_db');

        // We will try to add columns one by one to avoid failing if some already exist
        // Or simpler: just run one big ALTER and catch error if it fails (not ideal if partial)
        // Best approach for script: Retrieve columns first

        const [rows] = await connection.execute("SHOW COLUMNS FROM users");
        const existingColumns = (rows as any[]).map(r => r.Field);

        const neededColumns = [
            { name: 'title', def: 'VARCHAR(50) NULL' },
            { name: 'gender', def: 'VARCHAR(50) NULL' },
            { name: 'birth_year', def: 'INT NULL' },
            { name: 'phone_number', def: 'VARCHAR(50) NULL' },
            { name: 'address', def: 'TEXT NULL' },
            { name: 'education_level', def: 'VARCHAR(100) NULL' },
            { name: 'occupation', def: 'VARCHAR(100) NULL' },
            { name: 'institution', def: 'VARCHAR(255) NULL' },
            { name: 'country', def: 'VARCHAR(100) NULL' }
        ];

        let alterQuery = "ALTER TABLE users ";
        const alterations = [];

        for (const col of neededColumns) {
            if (!existingColumns.includes(col.name)) {
                alterations.push(`ADD COLUMN ${col.name} ${col.def}`);
            }
        }

        if (alterations.length > 0) {
            alterQuery += alterations.join(", ");
            console.log("Executing:", alterQuery);
            await connection.execute(alterQuery);
            console.log("✅ Columns added successfully!");
        } else {
            console.log("ℹ️ All columns already exist.");
        }

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        await connection.end();
    }
}

addProfileColumns();
