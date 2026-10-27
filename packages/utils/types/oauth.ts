import type { ZodObject } from "zod"

export type OAuthRequestData = {
  endpoint: string
  data?: Record<string, string>
}

export type OAuthToken = { key: string; secret: string }

export type OAuthClient = {
  url: string
  request: (
    requestData: OAuthRequestData,
    schema: ZodObject,
    token: OAuthToken,
  ) => Promise<any>
  requestToken: (
    requestData: OAuthRequestData,
    token?: OAuthToken,
  ) => Promise<OAuthToken>
}
