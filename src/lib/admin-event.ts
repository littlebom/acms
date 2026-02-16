'use server';

import { cookies } from 'next/headers';
import { getEvent } from '@/app/actions/events';
import { revalidatePath } from 'next/cache';

const COOKIE_NAME = 'admin_selected_event_id';

export async function getAdminEventId(): Promise<number> {
    const cookieStore = await cookies();
    const eventIdStr = cookieStore.get(COOKIE_NAME)?.value;

    if (eventIdStr) {
        const id = parseInt(eventIdStr);
        if (!isNaN(id)) {
            return id;
        }
    }

    // Default: Get Active Event
    const activeEvent = await getEvent();
    if (activeEvent) {
        return activeEvent.id;
    }

    // Fallback if no active event: return 0 or handle error??
    // Let's return 0 which won't match anything, or 1 as safe fallback
    return 0;
}

export async function setAdminEventId(id: number) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, id.toString(), {
        path: '/', // Available everywhere
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: 'lax'
    });

    // Revalidate everything to ensure all data refreshes
    revalidatePath('/admin', 'layout');
}
