import * as z from "zod"
import { createEnv } from "@usos/utils"

export const env = createEnv({
  APP_URL: z.url(),
  PORT: z.coerce.number().default(3000),
  USOS_CONSUMER_KEY: z.string(),
  USOS_CONSUMER_SECRET: z.string(),
})
