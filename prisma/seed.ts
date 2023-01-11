import type { Block, Transaction, TransactionLog } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import webhookMock from "/home/wsl/Development/TalentLayer/talentlayer-indi-pi/src/platform_test.json";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding starting");

  webhookMock.forEach(async (webhookData: any) => {
    console.log(webhookData["streamId"]);

    console.log("start with the received webhook");
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
          console.log("adding the block");

          return data.id;
        }),
      },
    });

    // console.log("start with the txs");
    // const transactions = webhookData["txs"];
    // transactions.forEach(async (transaction: any) => {
    //   console.log("Transaction");

    //   await getOrCreateTransaction({
    //     id: `${receivedWebhook.blockId}-${transaction["hash"]}`,
    //     gas: Number.parseInt(transaction["gas"]),
    //     gasPrice: Number.parseInt(transaction["gasPrice"]),
    //     nonce: Number.parseInt(transaction["nonce"]),
    //     input: transaction["input"],
    //     transactionIndex: Number.parseInt(transaction["transactionIndex"]),
    //     fromAddress: transaction["fromAddress"],
    //     toAddress: transaction["toAddress"],
    //     value: Number.parseInt(transaction["value"]),
    //     type: Number.parseInt(transaction["type"]),
    //     v: transaction["v"]),
    //     r: transaction["r"]),
    //     s: transaction["s"]),
    //     receiptCumulativeGasUsed: Number.parseInt(
    //       transaction["receiptCumulativeGasUse"]
    //     ),
    //     receiptGasUsed: Number.parseInt(transaction["receiptGasUsed"]),
    //     receiptContractAddress: transaction["receiptContractAddress"],
    //     receiptRoot: transaction["receiptRoot"],
    //     receiptStatus: Number.parseInt(transaction["receiptStatus"]),
    //     receivedWebhookId: receivedWebhook.id,
    //   });
    // });
    console.log("lets go logs");
    const transactionLogs = webhookData["logs"];
    transactionLogs.forEach(async (transactionLog: any) => {
      await getOrCreateLog({
        id: `${receivedWebhook.blockId}-${transactionLog["logIndex"]}`,
        logIndex: Number.parseInt(transactionLog["logIndex"]),
        transactionHash: transactionLog["transactionHash"],
        address: transactionLog["address"],
        data: transactionLog["data"],
        topic0: transactionLog["topic0"],
        topic1: transactionLog["topic1"],
        topic2: transactionLog["topic2"],
        topic3: transactionLog["topic3"],
        receivedWebhookId: receivedWebhook.id,
      });
    });

    console.log("lets go txs");
    const transactions = webhookData["txs"];
    transactions.forEach(async (transaction: any) => {
      console.log(transaction);
      await getOrCreateTransaction({
        id: `${receivedWebhook.blockId}-${transaction["hash"]}`,
        gas: BigInt(transaction["gas"]),
        gasPrice: BigInt(transaction["gasPrice"]),
        nonce: Number.parseInt(transaction["nonce"]),
        input: transaction["input"],
        transactionIndex: Number.parseInt(transaction["transactionIndex"]),
        fromAddress: transaction["fromAddress"],
        toAddress: transaction["toAddress"],
        value: Number.parseInt(transaction["value"]),
        type: Number.parseInt(transaction["type"]),
        v: Number.parseInt(transaction["v"]),
        r: BigInt(transaction["r"]),
        s: BigInt(transaction["s"]),
        receiptCumulativeGasUsed: BigInt(
          transaction["receiptCumulativeGasUsed"]
        ),
        receiptGasUsed: BigInt(transaction["receiptGasUsed"]),
        receiptContractAddress: transaction["receiptContractAddress"],
        receiptRoot: transaction["receiptRoot"],
        receiptStatus: Number.parseInt(transaction["receiptStatus"]),
        receivedWebhookId: receivedWebhook.id,
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

async function getOrCreateLog(_log: TransactionLog): Promise<TransactionLog> {
  let log = await prisma.transactionLog.findUnique({
    where: {
      id: _log.id,
    },
  });
  if (!log) {
    console.log("New log!");

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
  console.log(log);

  return log;
}

async function getOrCreateTransaction(
  _transaction: Transaction
): Promise<Transaction> {
  let transaction = await prisma.transaction.findUnique({
    where: {
      id: _transaction.id,
    },
  });
  if (!transaction) {
    console.log("New txs!");

    transaction = await prisma.transaction.create({
      data: {
        id: _transaction.id,
        gas: _transaction.gas,
        gasPrice: _transaction.gasPrice,
        nonce: _transaction.nonce,
        input: _transaction.input,
        transactionIndex: _transaction.transactionIndex,
        fromAddress: _transaction.fromAddress,
        toAddress: _transaction.toAddress,
        value: _transaction.value,
        type: _transaction.type,
        v: _transaction.v,
        r: _transaction.r,
        s: _transaction.s,
        receiptCumulativeGasUsed: _transaction.receiptCumulativeGasUsed,
        receiptGasUsed: _transaction.receiptGasUsed,
        receiptContractAddress: _transaction.receiptContractAddress,
        receiptRoot: _transaction.receiptRoot,
        receiptStatus: _transaction.receiptStatus,
      },
    });
  }
  console.log(transaction);

  return transaction;
}
