'use client';

import { useState, useEffect } from 'react';
// Remove unused import
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { hasPermission } from '@/lib/utils';
import React from 'react';

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: {
    id: string;
    name: string;
  }[];
}

export default function EditRolePage({ params }: { params: { id: string } }) {
  // Unwrap params with React.use()
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  
  const { data: session, status } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          console.log(`Fetching role with ID: ${id}`);
          
          // Use id instead of params.id
          const roleResponse = await fetch(`/api/roles/${id}`, {
            // Add cache: 'no-store' to prevent caching issues
            cache: 'no-store'
          });
          
          console.log(`Role API response status: ${roleResponse.status}`);
          
          if (!roleResponse.ok) {
            const errorText = await roleResponse.text();
            console.error('Role fetch error response:', errorText);
            
            try {
              const errorData = JSON.parse(errorText);
              console.error('Parsed error data:', errorData);
              throw new Error(errorData.error || 'Failed to fetch role');
            } catch (parseError) {
              console.error('Error parsing error response:', parseError);
              throw new Error(`Failed to fetch role: ${roleResponse.status}`);
            }
          }
          
          const roleData = await roleResponse.json();
          console.log('Role data received:', roleData);
          setRole(roleData);
          setName(roleData.name);
          setDescription(roleData.description || '');
          setSelectedPermissions(roleData.permissions.map((p: any) => p.id));

          // Fetch all permissions
          const permissionsResponse = await fetch('/api/permissions');
          if (!permissionsResponse.ok) {
            throw new Error('Failed to fetch permissions');
          }
          const permissionsData = await permissionsResponse.json();
          setPermissions(permissionsData);
        } catch (err) {
          console.error('Error in fetchData:', err);
          setError('Error loading data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [status, session, router, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/roles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id, // Use id instead of params.id
          name,
          description,
          permissions: selectedPermissions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      router.push('/dashboard/roles');
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the role');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
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
            <p>Don&apos;t have permission to edit roles.</p>
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
        <h1 className="text-3xl font-bold">Edit Role</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard/roles')}>
          Back to Roles
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>
              Update role details and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter role name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter role description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionChange(permission.id)}
                    />
                    <Label
                      htmlFor={`permission-${permission.id}`}
                      className="cursor-pointer"
                    >
                      {permission.name}
                    </Label>
                  </div>
                ))}
              </div>
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
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}