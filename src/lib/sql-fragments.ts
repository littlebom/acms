// Shared SQL fragments to avoid repetition across action files

export const REGISTRATION_BASE_JOIN = `
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    JOIN tickets t ON r.ticket_id = t.id
`;

/** Use when table alias is `u` — e.g. SELECT ${USER_FULL_NAME} ... */
export const USER_FULL_NAME = "CONCAT(u.first_name, ' ', u.last_name)";

/** Same as USER_FULL_NAME but with AS full_name alias */
export const USER_FULL_NAME_AS = "CONCAT(u.first_name, ' ', u.last_name) AS full_name";
