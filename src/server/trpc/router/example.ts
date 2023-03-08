import { sha3 } from "web3-utils";
import { z } from "zod";
import { typeParser } from "../../BetterDecoder";
import { getOrCreateABI, getOrCreateContractMethod } from "../../getters";

import { router, publicProcedure } from "../trpc";

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  addABI: publicProcedure
    .input(
      z.object({
        contractName: z.string(),
        abi: z.string(),
      })
    )
    .mutation(({ input }) => {
      // Here we do what in src/server/BetterDecoer.ts>BetterDecoder>addBI happends but just against the database table
      const contractName = input.contractName;
      const abi = JSON.parse(input.abi);

      const nullDate = new Date(0); // Just a null date for the schema will not be passed down to the prisma create context
      abi.map(async function (abi: any) {
        const methodSignature = `${abi["name"]}(${abi["inputs"]
          .map(typeParser)
          .join(",")})`;

        const signature = sha3(methodSignature);
        const abiSignature = sha3(input.abi);
        if (signature && abiSignature) {
          const storedABI = await getOrCreateABI({
            id: abiSignature,
            abi: input.abi,
            createdAt: nullDate,
          });

          // Tenary?
          if (abi["type"] === "event") {
            const contractMethod = await getOrCreateContractMethod({
              id: signature.slice(2),
              name: abi["name"],
              aBIId: storedABI.id,
            });
          } else {
            const contractMethod = await getOrCreateContractMethod({
              id: signature.slice(2, 10),
              name: abi["name"],
              aBIId: storedABI.id,
            });
          }
          return { message: "It worked!" };
        } else {
          console.log("idk error");
        }
        return {
          message: "Not worky, something happened with the signatures.",
          debug: { signature: signature, abiSignature: abiSignature },
        };
      });
    }),
});
