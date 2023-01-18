import { z } from "zod";

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
        abi: z.array(
          z.object({
            inputs: z.array(
              z.object({
                internalType: z.string(),
                name: z.string(),
                type: z.string(),
              })
            ),
          })
        ),
      })
    )
    .mutation(({ input }) => {
      // prisma.

      return { message: "It worked!" };
    }),
});
