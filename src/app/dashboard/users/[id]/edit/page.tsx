'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { hasPermission } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    selectedRoles: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (!hasPermission(session?.user?.permissions, 'users:update')) {
        router.push('/dashboard/users');
        return;
      }

      const fetchData = async () => {
        try {
          // Use resolvedParams.id instead of params.id
          const userResponse = await fetch(`/api/users/${resolvedParams.id}`);
          if (!userResponse.ok) throw new Error('Failed to fetch user');
          const userData = await userResponse.json();
          
          // Fetch roles
          const rolesResponse = await fetch('/api/roles');
          if (!rolesResponse.ok) throw new Error('Failed to fetch roles');
          const rolesData = await rolesResponse.json();

          setRoles(rolesData);
          setFormData({
            name: userData.name,
            email: userData.email,
            selectedRoles: userData.roles.map((role: any) => role.id),
          });
        } catch (err) {
          setError('Error loading user data. Please try again later.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [status, session, router, resolvedParams.id]); // Updated dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Use resolvedParams.id instead of params.id
      const response = await fetch(`/api/users/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      router.push('/dashboard/users');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard/users')}>
          Back to Users
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Update user details and roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Roles</label>
              <div className="grid grid-cols-2 gap-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={role.id}
                      checked={formData.selectedRoles.includes(role.id)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          selectedRoles: checked
                            ? [...prev.selectedRoles, role.id]
                            : prev.selectedRoles.filter(id => id !== role.id),
                        }));
                      }}
                    />
                    <label htmlFor={role.id} className="text-sm">
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/users')}
              type="button"
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