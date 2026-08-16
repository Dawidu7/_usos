import { env } from "./env"
import * as trpcExpress from "@trpc/server/adapters/express"
import express from "express"
import { appRouter } from "@usos/api"
import authRouter from "./auth"
import { errorHandler } from "./error"

const app = express()

app.use("/auth", authRouter)
app.use("/trpc", trpcExpress.createExpressMiddleware({ router: appRouter }))

app.use(errorHandler)

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`))
