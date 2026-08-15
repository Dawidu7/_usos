import { env } from "./env"
import crypto from "crypto"
import OAuth from "oauth-1.0a"

function createOAuthClient(url: string, key: string, secret: string) {
  const oauth = new OAuth({
    consumer: { key, secret },
    signature_method: "HMAC-SHA1",
    hash_function: (base_string, key) =>
      crypto.createHmac("sha1", key).update(base_string).digest("base64"),
  })

  const request = async (
    _requestData: {
      endpoint: string
      data?: Record<string, string>
    },
    token?: { key: string; secret: string },
  ) => {
    const requestData = {
      url: `${url}/services/${_requestData.endpoint}`,
      method: "POST",
      data: _requestData.data,
    }

    const headers = oauth.toHeader(oauth.authorize(requestData, token))

    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: { ...headers },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`USOS request failed: ${error}`)
    }

    const text = await response.text()
    return new URLSearchParams(text)
  }

  return { url, request }
}

export const usos = {
  UKEN: createOAuthClient(
    "https://usosapps.uken.krakow.pl",
    env.USOS_UKEN_KEY,
    env.USOS_UKEN_SECRET,
  ),
}
