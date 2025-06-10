import 'server-only'
import { cookies } from 'next/headers';
export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}