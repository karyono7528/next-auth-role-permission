import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  try {
    const role = await db.role.findUnique({
      where: { id: resolvedParams.id },
      include: {
        rolepermission: {
          include: {
            permission: true
          }
        }
      },
    });

    if (!role) {
      return new NextResponse(JSON.stringify({ error: 'Role not found' }), {
        status: 404,
      });
    }

    const transformedRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolepermission.map(p => ({
        id: p.permission.id,
        name: p.permission.name,
      })),
    };

    return NextResponse.json(transformedRole);
  } catch (error) {
    console.error('Error fetching role:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  try {
    const existingRole = await db.role.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingRole) {
      return new NextResponse(JSON.stringify({ error: 'Role not found' }), {
        status: 404,
      });
    }

    // Delete user roles first
    await db.userrole.deleteMany({
      where: { roleId: resolvedParams.id },
    });

    // Delete role permissions
    await db.rolepermission.deleteMany({
      where: { roleId: resolvedParams.id },
    });

    // Delete the role
    await db.role.delete({
      where: { id: resolvedParams.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting role:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  if (!hasPermission(session.user.permissions, 'roles:delete')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
    });
  }

  try {
    // Check if role exists
    const existingRole = await db.role.findUnique({
      where: { id: params.id }, // Fix: Use params.id
    });

    if (!existingRole) {
      return new NextResponse(JSON.stringify({ error: 'Role not found' }), {
        status: 404,
      });
    }

    // Delete user roles first
    await db.userrole.deleteMany({
      where: { roleId: params.id }, // Fix: Use params.id
    });

    // Delete role permissions
    await db.rolepermission.deleteMany({
      where: { roleId: params.id }, // Fix: Use params.id
    });

    // Delete the role
    await db.role.delete({
      where: { id: params.id }, // Fix: Use params.id
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting role:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}