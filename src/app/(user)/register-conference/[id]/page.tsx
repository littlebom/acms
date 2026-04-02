import { getAvailableTickets, getUserRegistration } from "@/app/actions/user-registration";
import { getEvent } from "@/app/actions/events";
import { getQuestions } from "@/app/actions/questions";
import { UserRegistrationForm } from "@/components/user/registration-form";
import { getSession } from "@/lib/auth";
import { getSystemSettings } from "@/app/actions/settings";
import { notFound } from "next/navigation";

export default async function EventRegistrationPage({ params }: { params: { id: string } }) {
    const session = await getSession();

    // Handle async params (Next.js 15)
    const resolvedParams = await Promise.resolve(params);
    const eventId = parseInt(resolvedParams.id);

    if (isNaN(eventId)) {
        notFound();
    }

    // Fetch specific event
    const event = await getEvent(eventId);

    if (!event) {
        notFound();
    }

    // Fetch data scoped to this event
    const tickets = await getAvailableTickets(event.id);
    const currentRegistration = await getUserRegistration(event.id);

    // Fetch questions
    let questions: any[] = [];
    if (event.registration_form_id) {
        questions = await getQuestions(event.registration_form_id);
    }

    // Fetch system settings for payment
    const settings = await getSystemSettings();
    const paymentSettings = {
        omiseEnabled: settings.omise_enabled || false,
        omisePublicKey: settings.omise_public_key || '',
        stripeEnabled: settings.stripe_enabled || false,
        stripePublishableKey: settings.stripe_publishable_key || '',
        currency: settings.payment_currency || 'THB'
    };

    return (
        <div className="container mx-auto max-w-5xl py-8">
            {/* Back Button */}
            <div className="mb-6">
                <a href={`/dashboard/profile/${session?.userId}?tab=conference`} className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600">
                    ← Back to Profile
                </a>
            </div>

            <div className="mb-4 text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.name_en}</h1>
            </div>

            <UserRegistrationForm
                tickets={tickets}
                currentRegistration={currentRegistration}
                questions={questions}
                eventId={event.id}
                user={session?.user ? {
                    first_name: (session.user.name || '').split(' ')[0] || '',
                    last_name: (session.user.name || '').split(' ').slice(1).join(' ') || '',
                    email: session.user.email || ''
                } : undefined}
                paymentSettings={paymentSettings}
                event={event}
            />
        </div>
    );
}
