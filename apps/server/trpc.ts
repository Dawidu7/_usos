import * as trpcExpress from "@trpc/server/adapters/express"
import { appRouter } from "@usos/api"
import { usos } from "./oauth"
import { redis } from "./redis"

export const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext: async ({ req }) => {
    const sessionId = req.cookies.session
    let token: { key: string; secret: string } | null = null

    if (sessionId) {
      const raw = await redis.get(`session:${sessionId}`)
      if (raw) token = JSON.parse(raw)
    }

    return { token, oauth: usos["UKEN"] }
  },
})
