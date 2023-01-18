import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../server/db/client";
import {
  getOrCreateBlock,
  getOrCreateLog,
  getOrCreateTransaction,
} from "../../server/getters";
import abi from "./../../../TalentLayerID-Abi.json";
import BetterDecoder from "../../server/BetterDecoder";
const receive = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("Received new webhook call!");

  // TODO validate the origin. should only be from moralis
  if (req.method !== "POST") {
    console.log("Not post a request, exiting!");
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  const webhookData = JSON.parse(req.body);
  console.log("moralis id ", webhookData["streamId"]);

  console.log("Indexing the webook.");
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
      }).then((block) => {
        return block.id;
      }),
    },
  });

  console.log("indexing the transaction logs");
  const transactionLogs = webhookData["logs"];
  transactionLogs.forEach(async (transactionLog: any) => {
    await getOrCreateLog({
      id: `${receivedWebhook.blockId}-${transactionLog["transactionHash"]}-${transactionLog["logIndex"]}`,
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

  console.log("indexing the transactions");
  const transactions = webhookData["txs"];
  transactions.forEach(async (transaction: any) => {
    await getOrCreateTransaction({
      id: `${receivedWebhook.blockId}-${transaction["hash"]}`,
      gas: transaction["gas"],
      gasPrice: transaction["gasPrice"],
      nonce: transaction["nonce"],
      input: transaction["input"],
      transactionIndex: transaction["transactionIndex"],
      fromAddress: transaction["fromAddress"],
      toAddress: transaction["toAddress"],
      value: transaction["value"],
      type: transaction["type"],
      v: transaction["v"],
      r: transaction["r"],
      s: transaction["s"],
      receiptCumulativeGasUsed: transaction["receiptCumulativeGasUsed"],
      receiptGasUsed: transaction["receiptGasUsed"],
      receiptContractAddress: transaction["receiptContractAddress"],
      receiptRoot: transaction["receiptRoot"],
      receiptStatus: transaction["receiptStatus"],
      receivedWebhookId: receivedWebhook.id,
    });
  });

  const betterDecoder = new BetterDecoder();
  betterDecoder.addABI(abi["abi"]);
  // decoder.addABI([abi["abi"]]);
  const input_logs = webhookData["logs"].map(function (log: any) {
    return {
      data: log["data"],
      topics: [
        log["topic0"],
        log["topic1"],
        log["topic2"],
        log["topic3"],
      ].filter((entry: any) => entry),
    };
  });

  console.log(betterDecoder.decodeLogs(input_logs), "decoding log result");
  // console.log(
  //   betterDecoder.decodeMethod(transactions[0]["input"]),
  //   "decoding result"
  // );

  res.status(200).json("received!");
  return;
};
export default receive;
