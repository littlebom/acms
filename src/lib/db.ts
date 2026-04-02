import mysql from 'mysql2/promise';

declare global {
    var mysqlPool: mysql.Pool | undefined;
}


const poolConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'acms_db',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
};

let pool: mysql.Pool;

function getPool() {
    if (pool) return pool;

    if (process.env.NODE_ENV === 'development') {
        if (!global.mysqlPool) {
            global.mysqlPool = mysql.createPool(poolConfig);
        }
        pool = global.mysqlPool;
    } else {
        if (!pool) {
            pool = mysql.createPool(poolConfig);
        }
    }

    return pool;
}

export async function query(sql: string, params?: any[]) {
    try {
        const pool = getPool();
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error: any) {
        // Fallback for build time or connection errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.warn(`Database connection failed (${error.code}), returning empty result. SQL: ${sql.substring(0, 50)}...`);
            return [];
        }
        throw error;
    }
}
