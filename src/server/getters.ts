import { Block } from "@prisma/client";
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
