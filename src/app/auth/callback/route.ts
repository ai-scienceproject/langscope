import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  // Get origin without port (Azure App Service sometimes includes port in URL)
  let origin = requestUrl.origin
  
  // Fix for Azure App Service: if origin contains container hostname (hex string),
  // use the actual Azure App Service URL from environment
  const hostname = requestUrl.hostname
  // Check if hostname looks like a container ID (hex string, typically 12+ chars)
  if (/^[a-f0-9]{12,}$/i.test(hostname)) {
    // Use WEBSITE_HOSTNAME from Azure (automatically set by Azure App Service)
    if (process.env.WEBSITE_HOSTNAME) {
      origin = `https://${process.env.WEBSITE_HOSTNAME}`
    } else {
      // If WEBSITE_HOSTNAME is not available, try to get from request headers
      const hostHeader = request.headers.get('host')
      if (hostHeader && !/^[a-f0-9]{12,}$/i.test(hostHeader)) {
        origin = `https://${hostHeader}`
      }
      // If still not available, log warning and use original origin
      if (origin === requestUrl.origin) {
        console.warn('Could not determine Azure App Service hostname, using request origin:', origin)
      }
    }
  }
  
  // Remove port from HTTPS URLs (ports shouldn't be in HTTPS URLs)
  if (origin.includes(':8080') || origin.includes(':443')) {
    origin = origin.replace(/:8080|:443/g, '')
  }

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    // Redirect to login with error message
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', error)
    if (errorDescription) {
      loginUrl.searchParams.set('message', errorDescription)
    }
    return NextResponse.redirect(loginUrl.toString())
  }

  // Handle OAuth callback with code
  if (code) {
    try {
      const supabase = await createClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        const loginUrl = new URL('/login', origin)
        loginUrl.searchParams.set('error', 'oauth_error')
        loginUrl.searchParams.set('message', exchangeError.message)
        return NextResponse.redirect(loginUrl.toString())
      }

      // Success - check for redirect parameter in cookies or default to home
      // Note: OAuth redirects don't preserve query params, so we default to home
      // Users can navigate to /arena after login
      return NextResponse.redirect(`${origin}/`)
    } catch (err) {
      console.error('Unexpected error in OAuth callback:', err)
      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('error', 'oauth_error')
      loginUrl.searchParams.set('message', 'An unexpected error occurred during authentication')
      return NextResponse.redirect(loginUrl.toString())
    }
  }

  // No code and no error - redirect to home
  return NextResponse.redirect(`${origin}/`)
}

