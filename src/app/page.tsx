import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Navbar from '@/components/navbar';

export default function WelcomePage() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Role-Based Authentication System</h1>
            <p className="text-xl text-gray-600">Secure your application with advanced user, role, and permission management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Create and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Easily create, update, and delete user accounts. Assign roles to users to control their access to different parts of your application.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>Define roles for your users</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Create custom roles with specific permissions. Organize your users by assigning them appropriate roles based on their responsibilities.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permission Control</CardTitle>
                <CardDescription>Fine-grained access control</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Define granular permissions for each role. Control exactly what actions users can perform in your application based on their assigned roles.</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="px-8">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>

          <div className="mt-12 text-center text-sm text-gray-500">
            <p>Demo credentials:</p>
            <p>Admin: admin@example.com / Admin123!</p>
            <p>User: user@example.com / User123!</p>
            <p>Manager: manager@example.com / Manager123!</p>
          </div>
        </div>
      </div>
    </>
  );
}
