import { UserRoles } from '../../src/auth/userRoles';
import { PrismaClient } from '../../src/generated/prisma';


export async function seedRoles(prisma: PrismaClient) {

  console.log('START seeding roles...');

 const roles = Object.values(UserRoles); // All roles in our enum

  for (const role of roles) {
    await prisma.role.upsert({
      where: { role },
      update: {},
      create: { role },
    });
  }

  console.log('FINISH seeding roles');
};
