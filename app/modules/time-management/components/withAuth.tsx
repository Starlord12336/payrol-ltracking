// utils/withAuth.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SystemRole } from '@/shared/types'; // Adjust the role import according to your types
import { useAuth } from '@/shared/hooks';

// The withAuth HOC accepts a component and a required role for access
export function withAuth<P extends object>(Component: React.ComponentType<P>, requiredRole: SystemRole) {
  const AuthHOC = (props: P) => {
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Assuming `useAuth` hook provides user data
    const router = useRouter();

    useEffect(() => {
      // If the user is not authenticated or doesn't have the required role, redirect them
      if (!user) {
        router.push('/login'); // Redirect to login page if the user is not logged in
      } else if (!user.roles.includes(requiredRole)) {
        router.push('/'); // Redirect to home if the user doesn't have the required role
      } else {
        setLoading(false); // User is authorized, stop loading and render the component
      }
    }, [user, router]);

    if (loading) {
      return <p>Loading...</p>; // Show loading state while checking authorization
    }

    return <Component {...props} />; // Render the protected component
  };

  return AuthHOC;
}
