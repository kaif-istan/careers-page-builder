// src/lib/auth-server.ts
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Get the current user session from server-side request
 * Returns null if not authenticated
 */
export async function getServerSession() {
  try {
    const cookieStore = await cookies()
    
    // Supabase stores session in cookies with pattern: sb-<project-ref>-auth-token
    // We need to check for the session cookie
    const allCookies = cookieStore.getAll()
    const sessionCookie = allCookies.find(cookie => 
      cookie.name.includes('auth-token') || cookie.name.includes('access-token')
    )
    
    if (!sessionCookie) {
      return null
    }

    // Create a Supabase client to verify the session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    // Try to parse the session from cookie
    try {
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value))
      if (sessionData?.access_token) {
        const { data: { user }, error } = await supabase.auth.getUser(sessionData.access_token)
        if (!error && user) {
          return { user, session: sessionData }
        }
      }
    } catch (e) {
      // Cookie format might be different, try alternative approach
    }

    return null
  } catch (error) {
    console.error('Error getting server session:', error)
    return null
  }
}

