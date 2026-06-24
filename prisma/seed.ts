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

async function main() {
  await prisma.project.deleteMany();
  await prisma.project.createMany({
    data: data.map(
      ({ id: _id, status, priority, startDate, dueDate, ...rest }) => ({
        ...rest,
        status: STATUS[status],
        priority: PRIORITY[priority],
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
      }),
    ),
  });
  console.log(`Seeded ${data.length} projects`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
