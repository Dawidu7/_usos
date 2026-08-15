import { env } from "./env"
import crypto from "crypto"
import express from "express"
import OAuth from "oauth-1.0a"

const USOS_URL = "https://usosapps.uken.krakow.pl"

let secret: string

const oauth = new OAuth({
  consumer: { key: env.USOS_CONSUMER_KEY, secret: env.USOS_CONSUMER_SECRET },
  signature_method: "HMAC-SHA1",
  hash_function: (base_string, key) =>
    crypto.createHmac("sha1", key).update(base_string).digest("base64"),
})

const app = express()

app.get("/auth/login", async (req, res) => {
  const requestData = {
    url: `${USOS_URL}/services/oauth/request_token`,
    method: "POST",
    data: {
      oauth_callback: `${env.APP_URL}:${env.PORT}/auth/callback`,
    },
  }

  const headers = oauth.toHeader(oauth.authorize(requestData))

  const response = await fetch(requestData.url, {
    method: requestData.method,
    headers: { ...headers },
  })

  const text = await response.text()

  const _ = new URLSearchParams(text)
  secret = _.get("oauth_token_secret")!

  return res.redirect(
    `${USOS_URL}/services/oauth/authorize?oauth_token=${_.get("oauth_token")}`,
  )
})

app.get("/auth/callback", async (req, res) => {
  const requestData = {
    url: `${USOS_URL}/services/oauth/access_token`,
    method: "POST",
    data: {
      oauth_verifier: req.query.oauth_verifier,
    },
  }

  const headers = oauth.toHeader(
    oauth.authorize(requestData, { key: req.query.oauth_token, secret }),
  )

  const response = await fetch(requestData.url, {
    method: "POST",
    headers: { ...headers },
  })

  const text = await response.text()

  return res.send(text)
})

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}.`))
