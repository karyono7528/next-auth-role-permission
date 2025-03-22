import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/utils';

export async function GET() {
  // Remove unused request parameter
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Check if user has permission to read permissions
  if (!hasPermission(session.user.permissions, 'permissions:read') && 
      !hasPermission(session.user.permissions, 'roles:read')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
    });
  }

  try {
    const permissions = await db.permission.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Check if user has permission to create permissions
  if (!hasPermission(session.user.permissions, 'permissions:create')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
    });
  }

  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return new NextResponse(JSON.stringify({ error: 'Permission name is required' }), {
        status: 400,
      });
    }

    // Check if permission with the same name already exists
    const existingPermission = await db.permission.findUnique({
      where: { name },
    });

    if (existingPermission) {
      return new NextResponse(JSON.stringify({ error: 'Permission with this name already exists' }), {
        status: 400,
      });
    }

    // Create the permission
    const permission = await db.permission.create({
      data: {
        id: crypto.randomUUID(),
        name,
        description,
        updatedAt: new Date(), // Add current timestamp for updatedAt
      },
    });

    return NextResponse.json(permission, { status: 201 });
  } catch (error) {
    console.error('Error creating permission:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}