import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hasPermission } from '@/lib/utils';

export async function GET() {
  try {
    console.log('GET /api/users: Starting request');
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'Found' : 'Not found');

    if (!session) {
      console.log('GET /api/users: Unauthorized - No session');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    console.log('User permissions:', session.user?.permissions);
    
    // Check if user has permission to read users
    if (!hasPermission(session.user.permissions, 'users:read')) {
      console.log('GET /api/users: Forbidden - Missing permission');
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
      });
    }

    console.log('GET /api/users: Fetching users from database');
    const users = await prisma.user.findMany({
      include: {
        userrole: {
          include: {
            role: true
          }
        }
      }
    });

    // Transform the response to include role names
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      roles: user.userrole.map(ur => ur.role.name)
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}