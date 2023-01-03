import { Block, PrismaClient } from "@prisma/client";
import webhookMock from "/home/wsl/Development/TalentLayer/talentlayer-indi-pi/src/platform_test.json";

const prisma = new PrismaClient();

async function main() {
  webhookMock.forEach(async (webhookData: any) => {
    console.log(webhookData["confirmed"]);

    const receivedWebhook = await prisma.receivedWebhook.create({
      data: {
        confirmed: webhookData["confirmed"],
        chainId: webhookData["chainId"],
        abi: webhookData["abi"].toString(),
        moralisStreamId: webhookData["streamId"],
        tag: webhookData["tag"],
        retries: webhookData["retries"],
        blockId: await getOrCreateBlock({
          id: `${webhookData["chainId"]}-${webhookData["block"]["number"]}`,
          hash: webhookData["block"]["hash"],
          timestamp: webhookData["block"]["timestamp"],
        }).then((data) => {
          return data.id;
        }),
      },
    });

    const transactionLogs = webhookData["logs"];
    transactionLogs.forEach(async (transactionLog: any) => {
      console.log(transactionLog[0]);

      await prisma.transactionLog.create({
        data: {
          logIndex: Number.parseInt(transactionLog["logIndex"]),
          transactionHash: transactionLog["transactionHash"],
          address: transactionLog["address"],
          data: transactionLog["data"],
          topic0: transactionLog["topic0"],
          topic1: transactionLog["topic1"],
          topic2: transactionLog["topic2"],
          topic3: transactionLog["topic3"],
          receivedWebhookId: receivedWebhook.id,
        },
      });
    });
  });
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

async function getOrCreateBlock(_block: Block): Promise<Block> {
  let block = await prisma.block.findUnique({
    where: {
      id: _block.id,
    },
  });
  if (!block) {
    console.log("New block!");

    block = await prisma.block.create({
      data: {
        id: _block.id,
        hash: _block.hash,
        timestamp: _block.timestamp,
      },
    });
  }
  return block;
}
