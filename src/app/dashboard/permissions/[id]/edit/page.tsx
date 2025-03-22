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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { hasPermission } from '@/lib/utils';

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

export default function EditPermissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      if (!hasPermission(session?.user?.permissions, 'permissions:update')) {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/permissions/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: permission?.name,
          description: permission?.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update permission');
      }

      router.push('/dashboard/permissions');
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the permission');
      setSaving(false);
    }
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
        <h1 className="text-3xl font-bold">Edit Permission</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard/permissions')}>
          Back to Permissions
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Permission Information</CardTitle>
            <CardDescription>Update permission details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Permission Name
              </label>
              <Input
                id="name"
                value={permission?.name || ''}
                onChange={(e) =>
                  setPermission((prev) => prev ? { ...prev, name: e.target.value } : null)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={permission?.description || ''}
                onChange={(e) =>
                  setPermission((prev) => prev ? { ...prev, description: e.target.value } : null)
                }
                rows={3}
              />
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
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}