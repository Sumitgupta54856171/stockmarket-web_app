import { cookies } from 'next/headers'
import { deleteSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
 
 async function logout() {
  await deleteSession()
  redirect('/login')
}
export default logout;