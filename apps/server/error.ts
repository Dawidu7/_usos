import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"
import { logZodErrors } from "@usos/utils"

export class ExpressError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
  ) {
    super(message)
    this.statusCode = statusCode
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof ExpressError)
    return res.status(err.statusCode).json({ error: err.message })

  if (err instanceof ZodError) {
    logZodErrors("Client request validation failed:", err)

    return res.status(400).json({ error: "Invalid request" })
  }

  console.error(err)
  return res.status(500).json({ error: "Internal server error" })
}
