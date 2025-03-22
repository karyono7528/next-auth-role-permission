import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/utils';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const params = await context.params;
  const { id } = params;

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  if (!hasPermission(session.user.permissions, 'permissions:read')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
    });
  }

  try {
    const permission = await db.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      return new NextResponse(JSON.stringify({ error: 'Permission not found' }), {
        status: 404,
      });
    }

    return NextResponse.json(permission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const params = await context.params;
  const { id } = params;

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  if (!hasPermission(session.user.permissions, 'permissions:update')) {
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

    // Check if permission exists
    const existingPermission = await db.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return new NextResponse(JSON.stringify({ error: 'Permission not found' }), {
        status: 404,
      });
    }

    // Check for duplicate name
    const duplicatePermission = await db.permission.findFirst({
      where: {
        name,
        id: { not: id },
      },
    });

    if (duplicatePermission) {
      return new NextResponse(JSON.stringify({ error: 'Another permission with this name already exists' }), {
        status: 400,
      });
    }

    // Update the permission
    const updatedPermission = await db.permission.update({
      where: { id },
      data: {
        name,
        description,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedPermission);
  } catch (error) {
    console.error('Error updating permission:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const params = await context.params;
  const { id } = params;

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  if (!hasPermission(session.user.permissions, 'permissions:delete')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
    });
  }

  try {
    // Check if permission exists
    const existingPermission = await db.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return new NextResponse(JSON.stringify({ error: 'Permission not found' }), {
        status: 404,
      });
    }

    // Delete role permissions first
    await db.rolepermission.deleteMany({
      where: { permissionId: id },
    });

    // Delete the permission
    await db.permission.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}