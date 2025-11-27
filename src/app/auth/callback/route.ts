import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
      const supabase = await createClient()
      await supabase.auth.exchangeCodeForSession(code)
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${origin}/`)
  } catch {
    // If Supabase is not configured, redirect to home
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(`${requestUrl.origin}/`)
  }
}

