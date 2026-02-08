import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export interface AuthPayload extends JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'user'
  name: string
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const JWT_ISSUER = 'favorite-tenant-map'
const JWT_EXPIRATION = '7d'

export async function signToken(
  payload: Omit<AuthPayload, 'iat' | 'exp' | 'iss'>
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET)
}

export async function verifyToken(
  token: string
): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    })
    return payload as AuthPayload
  } catch {
    return null
  }
}
