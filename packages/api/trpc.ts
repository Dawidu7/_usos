import { TRPCError, initTRPC } from "@trpc/server"
import type { ZodObject } from "zod"
import type {
  OAuthClient,
  OAuthRequestData,
  OAuthToken,
} from "@usos/utils/types"

type Context = {
  token: OAuthToken | null
  oauth: OAuthClient
}

const t = initTRPC.context<Context>().create()

export const router = t.router

export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.token) throw new TRPCError({ code: "UNAUTHORIZED" })

  const { token, oauth } = ctx

  return next({
    ctx: {
      token,
      oauth: {
        ...oauth,
        request: (requestData: OAuthRequestData, schema: ZodObject) =>
          oauth.request(requestData, schema, token),
      },
    },
  })
})
