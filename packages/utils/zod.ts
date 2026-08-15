import type { ZodError } from "zod"

export function logZodErrors(title: string, err: ZodError) {
  console.error(title)
  for (const issue of err.issues) {
    const path = issue.path.join(".")
    const message = issue.message
    console.error(`- ${path}: ${message}`)
  }
}
