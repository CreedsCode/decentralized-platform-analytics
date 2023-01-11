import { TransactionLog } from "@prisma/client";
import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../server/db/client";
import { getOrCreateBlock, getOrCreateTransaction } from "../../server/getters";

const receive = async (req: NextApiRequest, res: NextApiResponse) => {
  // validate the origin. should only be from moralis
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  const webhookData = JSON.parse(req.body);
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

  // const transactions = webhookData["txs"];
  // transactions.forEach(async (transaction: any) => {
  //   console.log("Transaction");

  //   await getOrCreateTransaction({
  //     id: `${receivedWebhook.blockId}-${transaction["hash"]}`,
  //     gas: transaction["gas"],
  //     gasPrice: transaction["gasPrice"],
  //     nonce: transaction["nonce"],
  //     input: transaction["input"],
  //     transactionIndex: transaction["transactionIndex"],
  //     fromAddress: transaction["fromAddress"],
  //     toAddress: transaction["toAddress"],
  //     value: transaction["value"],
  //     type: transaction["type"],
  //     v: transaction["v"],
  //     r: transaction["r"],
  //     s: transaction["s"],
  //     receiptCumulativeGasUsed: transaction["receiptCumulativeGasUse"],
  //     receiptGasUsed: transaction["receiptGasUsed"],
  //     receiptContractAddress: transaction["receiptContractAddress"],
  //     receiptRoot: transaction["receiptRoot"],
  //     receiptStatus: transaction["receiptStatus"],
  //   });
  // });

  // const transactionLogs = webhookData["logs"];
  // transactionLogs.forEach(async (transactionLog: any) => {
  //   await prisma.transactionLog.create({
  //     data: {
  //       id: `${receivedWebhook.blockId}-${transactionLog["logIndex"]}`,
  //       logIndex: Number.parseInt(transactionLog["logIndex"]),
  //       transactionHash: transactionLog["transactionHash"],
  //       address: transactionLog["address"],
  //       data: transactionLog["data"],
  //       topic0: transactionLog["topic0"],
  //       topic1: transactionLog["topic1"],
  //       topic2: transactionLog["topic2"],
  //       topic3: transactionLog["topic3"],
  //       receivedWebhookId: receivedWebhook.id,
  //     },
  //   });
  // });

  res.status(200).json("received!");
  return;
};
export default receive;
