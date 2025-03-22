import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/utils';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Check if user has permission to read roles
  if (!hasPermission(session.user.permissions, 'roles:read')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
    });
  }

  // Check if it's a request for a specific role
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const roleId = pathParts[pathParts.length - 1];

  if (roleId && roleId !== 'roles') {
    try {
      const role = await db.role.findUnique({
        where: { id: roleId },
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

      // Transform the data to include permission names
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

  // Get all roles
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolepermission: {
          include: {
            permission: true
          }
        }
      }
    });

    // Transform the data to include permission names
    const transformedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolepermission.map(rp => rp.permission.name)
    }));

    return NextResponse.json(transformedRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
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

  if (!hasPermission(session.user.permissions, 'roles:create')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
    });
  }

  try {
    const body = await req.json();
    const { name, description, permissions } = body;

    if (!name) {
      return new NextResponse(JSON.stringify({ error: 'Role name is required' }), {
        status: 400,
      });
    }

    // Check for duplicate role name
    const existingRole = await db.role.findFirst({
      where: { name },
    });

    if (existingRole) {
      return new NextResponse(JSON.stringify({ error: 'Role name already exists' }), {
        status: 400,
      });
    }

    // Create role with permissions in a transaction
    const role = await db.$transaction(async (tx) => {
      // Create the role
      const newRole = await tx.role.create({
        data: {
          id: crypto.randomUUID(),
          name,
          description,
          updatedAt: new Date(), // Add updatedAt field
          createdAt: new Date()  // Add createdAt field
        },
      });

      // Create role permissions
      if (permissions && permissions.length > 0) {
        await tx.rolepermission.createMany({
          data: permissions.map((permissionId: string) => ({
            id: `${newRole.id}_${permissionId}`, // Add composite ID
            roleId: newRole.id,
            permissionId,
            updatedAt: new Date(),
            createdAt: new Date()
          })),
        });
      }

      return newRole;
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Check if user has permission to update roles
  if (!hasPermission(session.user.permissions, 'roles:update')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
    });
  }

  try {
    const body = await req.json();
    const { id, name, description, permissions } = body;

    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Role ID is required' }), {
        status: 400,
      });
    }

    if (!name) {
      return new NextResponse(JSON.stringify({ error: 'Role name is required' }), {
        status: 400,
      });
    }

    // Check if role exists
    const existingRole = await db.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return new NextResponse(JSON.stringify({ error: 'Role not found' }), {
        status: 404,
      });
    }

    // Check for duplicate name
    const duplicateRole = await db.role.findFirst({
      where: {
        name,
        id: { not: id },
      },
    });

    if (duplicateRole) {
      return new NextResponse(JSON.stringify({ error: 'Another role with this name already exists' }), {
        status: 400,
      });
    }

    // Update the role
    const updatedRole = await db.role.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    // Update permissions if provided
    if (permissions) {
      // Delete existing permissions
      await db.rolepermission.deleteMany({
        where: { roleId: id },
      });

      // Add new permissions
      if (permissions.length > 0) {
        for (const permissionId of permissions) {
          await db.rolepermission.create({
            data: {
              id: `${id}_${permissionId}`,
              roleId: id,
              permissionId,
              updatedAt: new Date() // Add updatedAt field
            }
          });
        }
      }
    }

    // Return the updated role with permissions
    const updatedRoleWithPermissions = await db.role.findUnique({
      where: { id },
      include: {
        rolepermission: {
          include: {
            permission: true
          }
        }
      }
    });

    // Add the response
    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Check if user has permission to delete roles
  if (!hasPermission(session.user.permissions, 'roles:delete')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
    });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const roleId = pathParts[pathParts.length - 1];

    if (!roleId || roleId === 'roles') {
      return new NextResponse(JSON.stringify({ error: 'Role ID is required' }), {
        status: 400,
      });
    }

    // Check if role exists
    const existingRole = await db.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      return new NextResponse(JSON.stringify({ error: 'Role not found' }), {
        status: 404,
      });
    }

    // Delete role permissions first (due to foreign key constraints)
    await db.rolePermission.deleteMany({
      where: { roleId },
    });

    // Delete user roles associated with this role
    await db.userRole.deleteMany({
      where: { roleId },
    });

    // Delete the role
    await db.role.delete({
      where: { id: roleId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting role:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}