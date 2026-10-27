import * as z from "zod"
import { protectedProcedure, router } from "./trpc"

export const appRouter = router({
  hi: protectedProcedure.query(async ({ ctx }) => {
    const _ = await ctx.oauth.request(
      {
        endpoint: "users/user",
        data: { fields: "id|first_name|last_name|student_number" },
      },
      z.object({
        id: z.string(),
        student_number: z.string(),
        first_name: z.string(),
        last_nae: z.string(),
      }),
    )

    return _
  }),
})

export type AppRouter = typeof appRouter
