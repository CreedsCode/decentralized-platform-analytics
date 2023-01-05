import { Block, TransactionLog } from "@prisma/client";
import { prisma } from "../server/db/client";

export async function getOrCreateBlock(_block: Block): Promise<Block> {
  let block = await prisma.block.findUnique({
    where: {
      id: _block.id,
    },
  });
  if (!block) {
    console.log("New block created!");
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

export async function getOrCreateLog(
  _log: TransactionLog
): Promise<TransactionLog> {
  let log = await prisma.transactionLog.findUnique({
    where: {
      id: _log.id,
    },
  });
  if (!log) {
    console.log("New block!");

    log = await prisma.transactionLog.create({
      data: {
        id: _log.id,
        logIndex: _log.logIndex,
        transactionHash: _log.transactionHash,
        address: _log.address,
        data: _log.data,
        topic0: _log.topic0,
        topic1: _log.topic1,
        topic2: _log.topic2,
        topic3: _log.topic3,
        receivedWebhookId: _log.receivedWebhookId,
      },
    });
  }
  return log;
}
1;
