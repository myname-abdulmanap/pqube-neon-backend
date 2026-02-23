import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create permissions
  console.log("Creating permissions...");
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: "manage_users" },
      update: {},
      create: {
        name: "manage_users",
        description: "Create, update, delete users",
        resource: "users",
        action: "manage",
      },
    }),
    prisma.permission.upsert({
      where: { name: "view_users" },
      update: {},
      create: {
        name: "view_users",
        description: "View user list and details",
        resource: "users",
        action: "read",
      },
    }),
    prisma.permission.upsert({
      where: { name: "manage_roles" },
      update: {},
      create: {
        name: "manage_roles",
        description: "Create, update, delete roles and permissions",
        resource: "roles",
        action: "manage",
      },
    }),
    prisma.permission.upsert({
      where: { name: "view_energy" },
      update: {},
      create: {
        name: "view_energy",
        description: "View energy monitoring data",
        resource: "energy",
        action: "read",
      },
    }),
  ]);

  console.log(`Created ${permissions.length} permissions`);

  // Create roles
  console.log("Creating roles...");
  const superadminRole = await prisma.role.upsert({
    where: { name: "superadmin" },
    update: {},
    create: {
      name: "superadmin",
      description: "Full system access",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrative access with limited permissions",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Basic user access",
    },
  });

  console.log("Created 3 roles: superadmin, admin, user");

  // Get permission IDs
  const [manageUsers, viewUsers, manageRoles, viewEnergy] = permissions;

  // Assign permissions to roles
  console.log("Assigning permissions to roles...");

  // Superadmin gets all permissions
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superadminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superadminRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log("Superadmin: all permissions (manage_users, view_users, manage_roles, view_energy)");

  // Admin gets view_users and view_energy
  const adminPermissions = [viewUsers, viewEnergy];
  for (const permission of adminPermissions) {
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
  console.log("Admin: view_users, view_energy");

  // User gets view_energy
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: userRole.id,
        permissionId: viewEnergy.id,
      },
    },
    update: {},
    create: {
      roleId: userRole.id,
      permissionId: viewEnergy.id,
    },
  });
  console.log("User: view_energy");

  // Create default superadmin user
  console.log("Creating default superadmin user...");
  const hashedPassword = await bcrypt.hash("superadmin123", 10);

  const superadminUser = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      name: "Super Admin",
      passwordHash: hashedPassword,
      roleId: superadminRole.id,
      isActive: true,
    },
  });

  console.log(`\n✅ Seed completed successfully!`);
  console.log(`\n📋 Summary:`);
  console.log(`   - Permissions: ${permissions.length}`);
  console.log(`   - Roles: 3 (superadmin, admin, user)`);
  console.log(`   - Default superadmin user created`);
  console.log(`\n🔑 Default login credentials:`);
  console.log(`   Email: superadmin@example.com`);
  console.log(`   Password: superadmin123`);
  console.log(`\n⚠️  Please change the default password after first login!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
