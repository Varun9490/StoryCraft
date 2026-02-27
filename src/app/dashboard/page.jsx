import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
        redirect('/login');
    }

    // Redirect based on role
    if (decoded.role === 'artisan') {
        redirect('/dashboard/artisan');
    } else {
        redirect('/shop');
    }
}
