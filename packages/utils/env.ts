import * as z from "zod"

export function createEnv<T extends z.ZodRawShape>(schema: T) {
  const env = z.object(schema).safeParse(process.env)

  if (!env.success) {
    console.error("Invalid environment variables:")
    for (const issue of env.error.issues) {
      const path = issue.path.join(".")
      const message = issue.message
      console.error(`- ${path}: ${message}`)
    }
    process.exit(1)
  }

  return env.data
}
