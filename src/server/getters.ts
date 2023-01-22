import {
  ABI,
  Block,
  ContractMethod,
  Transaction,
  TransactionLog,
} from "@prisma/client";
import { prisma } from "../server/db/client";

export async function getOrCreateBlock(_block: Block): Promise<Block> {
  console.log("Searching for block", _block.id);
  let block = await prisma.block.findUnique({
    where: {
      id: _block.id,
    },
  });

  if (!block) {
    console.log("not found, start indexing");

    block = await prisma.block.create({
      data: {
        id: _block.id,
        hash: _block.hash,
        timestamp: _block.timestamp,
      },
    });

    console.log("Done indexing!");
  }
  return block;
}

export async function getOrCreateLog(
  _log: TransactionLog
): Promise<TransactionLog> {
  console.log("Searching for log", _log.id);
  let log = await prisma.transactionLog.findUnique({
    where: {
      id: _log.id,
    },
  });
  if (!log) {
    console.log("not found, start indexing");

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

    console.log("Done indexing!");
  }

  return log;
}

export async function getOrCreateTransaction(
  _transaction: Transaction
): Promise<Transaction> {
  console.log("Searching for transaction", _transaction.id);
  let transaction = await prisma.transaction.findUnique({
    where: {
      id: _transaction.id,
    },
  });
  if (!transaction) {
    console.log("not found, start indexing");

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

    console.log("Done indexing!");
  }

  return transaction;
}

export async function getOrCreateContractMethod(
  _contractMethod: ContractMethod
): Promise<ContractMethod> {
  console.log("Searching for contract method", _contractMethod.id);
  let contractMethod = await prisma.contractMethod.findUnique({
    where: {
      id: _contractMethod.id,
    },
  });

  if (!contractMethod) {
    console.log("not found, start indexing");
    console.log(_contractMethod, "ligma");
    contractMethod = await prisma.contractMethod.create({
      data: {
        id: _contractMethod.id,
        aBIId: _contractMethod.aBIId,
        name: _contractMethod.name,
      },
    });

    console.log("Done indexing!");
  }
  return contractMethod;
}

export async function getOrCreateABI(_abi: ABI): Promise<ABI> {
  console.log("Searching for ABI", _abi.id);
  let abi = await prisma.aBI.findUnique({
    where: {
      id: _abi.id,
    },
  });

  if (!abi) {
    console.log("not found, start indexing");

    abi = await prisma.aBI.create({
      data: {
        id: _abi.id,
        abi: _abi.abi,
      },
    });

    console.log("Done indexing!");
  }
  return abi;
}
