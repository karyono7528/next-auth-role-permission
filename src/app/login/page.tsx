'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold text-[#003366]">Welcome Back!</CardTitle>
          <p className="text-gray-600">Please sign in to your account.</p>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => signIn('google')}
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
              Log In with Google
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => signIn('apple')}
            >
              <img src="/apple.svg" alt="Apple" className="w-5 h-5" />
              Log In with Apple
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
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
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <Link
                href="/forgot-password"
                className="block text-sm text-blue-500 hover:text-blue-600"
              >
                Forgot Password?
              </Link>

              <Button type="submit" className="w-full bg-[#FF5733]" disabled={loading}>
                {loading ? 'Signing in...' : 'Log In'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
              By clicking "Log In" you agree to our{' '}
              <Link href="/terms" className="text-blue-500 hover:text-blue-600">
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-500 hover:text-blue-600">
                Privacy Policy
              </Link>
              .
            </p>

            <p className="text-center text-sm text-gray-600">
              New to FlexJobs?{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-600">
                Join now!
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

<Image
  src="/path/to/image"
  alt="Login image"
  width={500}
  height={300}
/>