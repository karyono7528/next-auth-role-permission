import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with limited access',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Manager with elevated access',
    },
  });

  // Create permissions
  const permissions = [
    // User permissions
    { name: 'users:read', description: 'Can view users' },
    { name: 'users:create', description: 'Can create users' },
    { name: 'users:update', description: 'Can update users' },
    { name: 'users:delete', description: 'Can delete users' },
    
    // Role permissions
    { name: 'roles:read', description: 'Can view roles' },
    { name: 'roles:create', description: 'Can create roles' },
    { name: 'roles:update', description: 'Can update roles' },
    { name: 'roles:delete', description: 'Can delete roles' },
    
    // Permission permissions
    { name: 'permissions:read', description: 'Can view permissions' },
    { name: 'permissions:create', description: 'Can create permissions' },
    { name: 'permissions:update', description: 'Can update permissions' },
    { name: 'permissions:delete', description: 'Can delete permissions' },
    
    // Dashboard permissions
    { name: 'dashboard:access', description: 'Can access dashboard' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Assign all permissions to admin role
  const allPermissions = await prisma.permission.findMany();
  
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Assign limited permissions to user role
  const userPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: ['users:read', 'dashboard:access'],
      },
    },
  });

  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Assign manager permissions
  const managerPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: [
          'users:read', 'users:create', 'users:update',
          'roles:read',
          'permissions:read',
          'dashboard:access'
        ],
      },
    },
  });

  for (const permission of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create seed users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: await hash('Admin123!', 10),
      image: 'https://ui-avatars.com/api/?name=Admin+User',
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@example.com',
      password: await hash('User123!', 10),
      image: 'https://ui-avatars.com/api/?name=Regular+User',
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      name: 'Manager User',
      email: 'manager@example.com',
      password: await hash('Manager123!', 10),
      image: 'https://ui-avatars.com/api/?name=Manager+User',
    },
  });

  // Assign roles to users
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: regularUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      roleId: userRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: managerUser.id,
        roleId: managerRole.id,
      },
    },
    update: {},
    create: {
      userId: managerUser.id,
      roleId: managerRole.id,
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });