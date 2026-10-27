import { env } from "./env"
import cookieParser from "cookie-parser"
import express from "express"
import authRouter from "./auth"
import { errorHandler } from "./error"
import { trpcMiddleware } from "./trpc"

const app = express()
app.use(cookieParser())

app.use("/auth", authRouter)

app.use("/trpc", trpcMiddleware)

app.use(errorHandler)

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`))
