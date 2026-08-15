import * as z from "zod"
import { logZodErrors } from "./zod"

export function createEnv<T extends z.ZodRawShape>(schema: T) {
  const env = z.object(schema).safeParse(process.env)

  if (!env.success) {
    logZodErrors("Invalid environment variables:", env.error)
    process.exit(1)
  }

  return env.data
}
