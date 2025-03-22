'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { hasPermission } from '@/lib/utils';

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: {
    id: string;
    name: string;
  }[];
}

export default function DeleteRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false); // Add this line

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (!hasPermission(session?.user?.permissions, 'roles:delete')) {
        router.push('/dashboard/roles');
        return;
      }

      const fetchRole = async () => {
        try {
          const response = await fetch(`/api/roles/${resolvedParams.id}`);
          if (!response.ok) throw new Error('Failed to fetch role');
          const data = await response.json();
          setRole(data);
        } catch (err) {
          setError('Error loading role data. Please try again later.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchRole();
    }
  }, [status, session, router, resolvedParams.id]);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/roles/${resolvedParams.id}`, { // Use resolvedParams here
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete role');
      }

      router.push('/dashboard/roles');
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the role');
      setDeleting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!role && !loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Don&apos;t have permission to delete roles.</p>
            <Button 
              onClick={() => router.push('/dashboard/roles')} 
              className="mt-4"
            >
              Back to Roles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Delete Role</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard/roles')}>
          Back to Roles
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confirm Deletion</CardTitle>
          <CardDescription>
            Are you sure you want to delete this role? This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <p><strong>Role Name:</strong> {role?.name}</p>
            <p><strong>Description:</strong> {role?.description || 'No description'}</p>
            <p><strong>Permissions:</strong> {role?.permissions.map(p => p.name).join(', ') || 'None'}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/roles')}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Role'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}