'use server'
import 'server-only'
import { cookies } from 'next/headers'

function getTokenExpiration(token: string): Date {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'))
  return new Date(payload.exp * 1000)
}

export async function createSession(refreshToken: string) {
  const cookieStore = await cookies()

  cookieStore.set('kpolo_refresh', refreshToken, {
    httpOnly: true,
    secure: true,
    expires: getTokenExpiration(refreshToken),
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('kpolo_refresh')
}