'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hasPermission } from '@/lib/utils';

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
}

export default function RolesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (!hasPermission(session?.user?.permissions, 'roles:read')) {
        router.push('/dashboard');
        return;
      }

      const fetchRoles = async () => {
        try {
          const response = await fetch('/api/roles');
          if (!response.ok) {
            throw new Error('Failed to fetch roles');
          }
          const data = await response.json();
          setRoles(data);
        } catch (err) {
          setError('Error loading roles. Please try again later.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchRoles();
    }
  }, [status, session, router]);

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
        <h1 className="text-3xl font-bold">Role Management</h1>
        {hasPermission(session?.user?.permissions, 'roles:create') && (
          <Button onClick={() => router.push('/dashboard/roles/create')}>
            Create Role
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description || 'No description'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {hasPermission(session?.user?.permissions, 'roles:update') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/roles/${role.id}/edit`)}
                    >
                      Edit
                    </Button>
                  )}
                  {hasPermission(session?.user?.permissions, 'roles:delete') && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => router.push(`/dashboard/roles/${role.id}/delete`)}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}