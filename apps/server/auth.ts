import { env } from "./env"
import { Router } from "express"
import * as z from "zod"
import { ExpressError } from "./error"
import { usos } from "./oauth"
import { redis } from "./redis"

const oauth = usos["UKEN"]

const authRouter = Router()

authRouter.get("/login", async (req, res) => {
  const { key, secret } = await oauth.requestToken({
    endpoint: "oauth/request_token",
    data: {
      oauth_callback: `${env.APP_URL}:${env.PORT}/auth/callback`,
      scopes: "studies",
    },
  })

  redis.setEx(`request:${key}`, 60 * 10, secret)

  res.redirect(`${oauth.url}/services/oauth/authorize?oauth_token=${key}`)
})

authRouter.get("/callback", async (req, res) => {
  const { oauth_token: key, oauth_verifier } = z
    .object({
      oauth_token: z.string(),
      oauth_verifier: z.string(),
    })
    .parse(req.query)

  const secret = await redis.get(`request:${key}`)
  await redis.del(`request:${key}`)
  if (!secret) throw new ExpressError("Login session expired or invalid", 400)

  const token = await oauth.requestToken(
    {
      endpoint: "oauth/access_token",
      data: { oauth_verifier },
    },
    { key, secret },
  )

  const sessionId = crypto.randomUUID()
  const age = 60 * 60 * 24 * 14

  await redis.setEx(`session:${sessionId}`, age, JSON.stringify(token))

  res.cookie("session", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 1000 * age,
  })

  res.send("OK")
})

export default authRouter
