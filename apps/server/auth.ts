import { env } from "./env"
import { Router } from "express"
import * as z from "zod"
import { logZodErrors } from "@usos/utils"
import { ExpressError } from "./error"
import { usos } from "./oauth"
import { redis } from "./redis"

function parseTokens(response: URLSearchParams) {
  const result = z
    .object({
      token: z.string(),
      secret: z.string(),
    })
    .safeParse({
      token: response.get("oauth_token"),
      secret: response.get("oauth_token_secret"),
    })

  if (!result.success) {
    logZodErrors("OAuth token parsing failed:", result.error)
    throw new ExpressError("Invalid tokens received from OAuth server", 502)
  }
  return result.data
}

const oauth = usos["UKEN"]

const authRouter = Router()

authRouter.get("/login", async (req, res) => {
  const response = await oauth.request({
    endpoint: "oauth/request_token",
    data: { oauth_callback: `${env.APP_URL}:${env.PORT}/auth/callback` },
  })

  if (response.get("oauth_callback_confirmed") !== "true") {
    throw new ExpressError("OAuth server failed to confirm callback", 502)
  }

  const { token, secret } = parseTokens(response)

  redis.setEx(`request:${token}`, 60 * 10, secret)

  res.redirect(`${oauth.url}/services/oauth/authorize?oauth_token=${token}`)
})

authRouter.get("/callback", async (req, res) => {
  const { oauth_token, oauth_verifier } = z
    .object({
      oauth_token: z.string(),
      oauth_verifier: z.string(),
    })
    .parse(req.query)

  const oauth_secret = await redis.get(`request:${oauth_token}`)
  await redis.del(`request:${oauth_token}`)
  if (!oauth_secret)
    throw new ExpressError("Login session expired or invalid", 400)

  const response = await oauth.request(
    {
      endpoint: "oauth/access_token",
      data: { oauth_verifier },
    },
    { key: oauth_token, secret: oauth_secret },
  )

  const token = parseTokens(response)

  res.send("OK")
})

export default authRouter
