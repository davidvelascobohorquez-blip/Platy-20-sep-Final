// utils/signature.ts
import { createHmac } from 'crypto'

const SECRET = process.env.ACCESS_COOKIE_SECRET || 'dev-secret-change-me'

export function signPayload(payload: object) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const mac = createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${mac}`
}

export function verifyToken(token: string) {
  const [data, mac] = token.split('.')
  if (!data || !mac) return null
  const check = createHmac('sha256', SECRET).update(data).digest('base64url')
  if (check !== mac) return null
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString())
  } catch {
    return null
  }
}
