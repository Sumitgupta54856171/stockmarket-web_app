import { SignJWT, jwtVerify } from 'jose'
import { cookies } from "next/headers";
import { Session } from './models/sessiondb';
import axios from 'axios';
import dbconnect from './db';
interface Sessionpayload {
  userId: String,
  expiresAt: Date,
}

const secret_key = new TextEncoder().encode(process.env.sessionSecret as string)
export async function encrypt(payload: Sessionpayload): Promise<string> {
  return new SignJWT({data: payload})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(secret_key);
}
export async function decrypt(token: string) {
  try {
      if (typeof token !== 'string' || token.trim() === '') {
          console.error("Decrypt received an invalid token type or empty string.");
          return null;
        }
    const { payload } = await jwtVerify(token, secret_key)
    return payload.data as any
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function getSession() {
  console.log("get session called")
  dbconnect()
  const session = (await cookies()).get('session')?.value
  console.log("session")
  if(!session){
    return { userId: null };
  }
    const sessionId = await decrypt(session);
    console.log(sessionId)
    const sessionData = await Session.findOne({ userId:sessionId.userId });
    if (!sessionData) {
      return { userId: null };
    } 
    return { userId: sessionData.userId };
}

