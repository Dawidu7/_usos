import { env } from "./env"
import crypto from "crypto"
import OAuth from "oauth-1.0a"
import * as z from "zod"
import { logZodErrors } from "@usos/utils"
import type { OAuthRequestData, OAuthToken } from "@usos/utils/types"
import { ExpressError } from "./error"

function createOAuthClient(url: string, key: string, secret: string) {
  const oauth = new OAuth({
    consumer: { key, secret },
    signature_method: "HMAC-SHA1",
    hash_function: (base_string, key) =>
      crypto.createHmac("sha1", key).update(base_string).digest("base64"),
  })

  const _request = async (
    _requestData: OAuthRequestData,
    token?: OAuthToken,
  ) => {
    const requestData = {
      url: `${url}/services/${_requestData.endpoint}`,
      method: "POST",
      data: _requestData.data,
    }

    const headers = oauth.toHeader(oauth.authorize(requestData, token))
    const body = requestData.data
      ? new URLSearchParams(requestData.data)
      : undefined

    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: { ...headers },
      body,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`USOS request failed: ${error}`)
    }

    return response
  }

  return {
    url,
    request: async (
      requestData: OAuthRequestData,
      schema: z.ZodObject,
      token: OAuthToken,
    ) => {
      const response = await _request(requestData, token)
      const json = await response.json()
      return schema.parse(json)
    },
    requestToken: async (requestData: OAuthRequestData, token?: OAuthToken) => {
      const response = await _request(requestData, token)
      const text = await response.text()
      const params = new URLSearchParams(text)

      const result = z
        .object({
          key: z.string(),
          secret: z.string(),
        })
        .safeParse({
          key: params.get("oauth_token"),
          secret: params.get("oauth_token_secret"),
        })

      if (!result.success) {
        logZodErrors("OAuth token parsing failed:", result.error)
        throw new ExpressError("Invalid tokens received from OAuth server", 502)
      }

      return result.data
    },
  }
}

export const usos = {
  UKEN: createOAuthClient(
    "https://usosapps.uken.krakow.pl",
    env.USOS_UKEN_KEY,
    env.USOS_UKEN_SECRET,
  ),
}
