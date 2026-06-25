import { PrismaPg } from "@prisma/adapter-pg";
import { type $Enums, PrismaClient } from "./generated/client";
import data from "./test_data.json";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const STATUS: Record<string, $Enums.Status> = {
  Planning: "PLANNING",
  "In Progress": "IN_PROGRESS",
  "On Hold": "ON_HOLD",
  Completed: "COMPLETED",
};
const PRIORITY: Record<string, $Enums.Priority> = {
  Low: "LOW",
  Medium: "MEDIUM",
  High: "HIGH",
};

// Replace with your email to seed projects into your account.
const SEED_USER_EMAIL = "seed@koda.local";

async function main() {
  const seedUser = await prisma.user.upsert({
    where: { email: SEED_USER_EMAIL },
    create: {
      id: crypto.randomUUID(),
      email: SEED_USER_EMAIL,
      name: "Seed User",
      emailVerified: true,
    },
    update: {},
  });

  await prisma.project.deleteMany({ where: { userId: seedUser.id } });
  await prisma.project.createMany({
    data: data.map(
      ({ id: _id, status, priority, startDate, dueDate, ...rest }) => ({
        ...rest,
        status: STATUS[status],
        priority: PRIORITY[priority],
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
        userId: seedUser.id,
      }),
    ),
  });
  console.log(`Seeded ${data.length} projects for ${SEED_USER_EMAIL}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
