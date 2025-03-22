import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/utils';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  if (!hasPermission(session.user.permissions, 'users:read')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
    });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: resolvedParams.id },
      include: {
        userrole: {
          include: {
            role: true
          }
        }
      },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      });
    }

    // Transform the data to include role information
    const transformedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.userrole.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
      })),
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  if (!hasPermission(session.user.permissions, 'users:update')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
    });
  }

  try {
    const body = await request.json();
    const { name, email, selectedRoles } = body;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id },
      include: {
        userrole: true
      }
    });

    if (!existingUser) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      });
    }

    // Update user and roles in a transaction
    const updatedUser = await db.$transaction(async (tx) => {
      // Update user details
      const user = await tx.user.update({
        where: { id: params.id },
        data: {
          name,
          email,
          updatedAt: new Date(),
        },
        include: {
          userrole: {
            include: {
              role: true
            }
          }
        }
      });

      // Delete existing user roles
      await tx.userrole.deleteMany({
        where: { userId: params.id },
      });

      // Create new user roles if any are selected
      if (selectedRoles && selectedRoles.length > 0) {
        await tx.userrole.createMany({
          data: selectedRoles.map((roleId: string) => ({
            id: `${params.id}_${roleId}`, // Add composite ID
            userId: params.id,
            roleId: roleId,
            updatedAt: new Date()
          }))
        });
      }

      return user;
    });

    // Transform the response
    const transformedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      roles: updatedUser.userrole.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
      })),
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}