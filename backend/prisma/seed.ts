import { PrismaClient } from '../src/generated/prisma';
import { seedRoles } from './seeds/roles';
import { seedFakeData } from './seeds/fakeData';



import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })



async function main() {
  await seedRoles(prisma);
  await seedFakeData(prisma);
  // Add future seed functions here
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
