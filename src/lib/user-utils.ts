import { query } from '@/lib/db';

/**
 * Check if an email already exists in the users table.
 * Returns the user ID if found, null otherwise.
 */
export async function emailExists(email: string): Promise<number | null> {
    const rows = await query(
        'SELECT id FROM users WHERE email = ?',
        [email]
    ) as { id: number }[];
    return rows[0]?.id ?? null;
}

/**
 * Get the role of a user by their ID.
 * Returns the role string or null if user not found.
 */
export async function getUserRole(userId: number): Promise<string | null> {
    const rows = await query(
        'SELECT role FROM users WHERE id = ?',
        [userId]
    ) as { role: string }[];
    return rows[0]?.role ?? null;
}
