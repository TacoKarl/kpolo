import 'server-only'
import { cookies } from 'next/headers'
 
export async function createSession(token: string) {
  const cookieStore = await cookies()
 
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })
}