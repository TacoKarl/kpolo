import { PrismaClient } from '../../src/generated/prisma';


export async function seedRoles(prisma: PrismaClient) {
  const roles = ['System Admin', 'Club Admin','Club Member', 'Guest'];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { role },
      update: {},
      create: { role },
    });
  }
};
