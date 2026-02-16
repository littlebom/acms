import { redirect } from 'next/navigation';

export default function CheckInRedirect() {
    redirect('/admin/conference/check-in');
}
