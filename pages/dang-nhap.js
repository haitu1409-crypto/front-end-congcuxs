/**
 * Login Page - Redirect to home since login is now handled by modal
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
    const router = useRouter();

    // Redirect to home page since login is now handled by modal
    useEffect(() => {
        router.push('/');
    }, [router]);

    // Return null while redirecting
    return null;
}
