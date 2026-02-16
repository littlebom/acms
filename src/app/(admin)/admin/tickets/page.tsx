import { redirect } from 'next/navigation';

export default function TicketsRedirect() {
    redirect('/admin/conference/tickets');
}
