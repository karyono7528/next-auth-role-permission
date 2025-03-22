'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {session.user.name || 'User'}!</CardTitle>
            <CardDescription>You are logged in as {session.user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Roles:</strong> {session.user.roles?.join(', ') || 'None'}</p>
              <p><strong>Permissions:</strong> {session.user.permissions?.length || 0} granted</p>
            </div>
          </CardContent>
        </Card>

        {session.user.permissions?.includes('users:read') && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users</CardDescription>
            </CardHeader>
            <CardContent>
              <p>View and manage user accounts in the system.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push('/dashboard/users')} variant="outline">Manage Users</Button>
            </CardFooter>
          </Card>
        )}

        {session.user.permissions?.includes('roles:read') && (
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>Manage system roles</CardDescription>
            </CardHeader>
            <CardContent>
              <p>View and manage roles and their permissions.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push('/dashboard/roles')} variant="outline">Manage Roles</Button>
            </CardFooter>
          </Card>
        )}

        {session.user.permissions?.includes('permissions:read') && (
          <Card>
            <CardHeader>
              <CardTitle>Permission Management</CardTitle>
              <CardDescription>Manage system permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>View and manage permissions in the system.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push('/dashboard/permissions')} variant="outline">Manage Permissions</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}