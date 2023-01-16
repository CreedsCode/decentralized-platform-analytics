import type { Block, Transaction, TransactionLog } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import webhookMock from "/home/wsl/Development/TalentLayer/talentlayer-indi-pi/src/platform_test.json";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding starting");
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
