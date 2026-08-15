import { env } from "./env"
import express from "express"
import authRouter from "./auth"
import { errorHandler } from "./error"

const app = express()

app.use("/auth", authRouter)

app.use(errorHandler)

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`))
