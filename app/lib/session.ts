import 'server-only'
import { cookies } from 'next/headers'
import { encrypt } from './crypto';

export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ userId, expiresAt });
    const cookiesStore = await cookies();
    cookiesStore.set('session',session,{
        httpOnly:true,
        secure:true,
        expires:expiresAt,
        sameSite:'lax',
        path:'/'
    })
}
 
export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
  }