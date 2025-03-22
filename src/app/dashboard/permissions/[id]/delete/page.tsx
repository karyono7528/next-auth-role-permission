'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
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

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

export default function DeletePermissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (!hasPermission(session?.user?.permissions, 'permissions:delete')) {
        router.push('/dashboard/permissions');
        return;
      }

      const fetchPermission = async () => {
        try {
          const response = await fetch(`/api/permissions/${resolvedParams.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch permission');
          }
          const data = await response.json();
          setPermission(data);
        } catch (err) {
          setError('Error loading permission. Please try again later.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchPermission();
    }
  }, [status, session, router, resolvedParams.id]);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/permissions/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete permission');
      }

      router.push('/dashboard/permissions');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
    setDeleting(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Delete Permission</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard/permissions')}>
          Back to Permissions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confirm Deletion</CardTitle>
          <CardDescription>
            Are you sure you want to delete this permission? This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <p><strong>Permission Name:</strong> {permission?.name}</p>
            <p><strong>Description:</strong> {permission?.description || 'No description'}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/permissions')}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Permission'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}