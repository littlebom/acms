import { redirect } from 'next/navigation';

export default function RegistrationsRedirect() {
    redirect('/admin/conference/registrations');
}
