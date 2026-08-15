import { env } from "./env"
import { createClient } from "redis"

export const redis = await createClient({ url: env.REDIS_URL })
  .on("error", err => console.log("Redis Client Error", err))
  .connect()
