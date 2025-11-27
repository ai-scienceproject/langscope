# Supabase Auth Setup Guide

## ✅ Setup Complete!

Supabase Auth has been integrated into your application. Here's what was set up:

## Files Created/Modified

### New Files:
- `src/lib/supabase/client.ts` - Browser client for Supabase
- `src/lib/supabase/server.ts` - Server client for Supabase
- `src/lib/supabase/middleware.ts` - Middleware helper for session management
- `src/middleware.ts` - Next.js middleware for route protection
- `src/app/auth/callback/route.ts` - OAuth callback handler

### Modified Files:
- `src/contexts/AuthContext.tsx` - Updated to use Supabase
- `src/app/layout.tsx` - Removed NextAuth SessionProvider

## Next Steps

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up for a free account
3. Create a new project
4. Wait for the project to be set up (takes ~2 minutes)

### 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll see two sections:
   - **"Publishable and secret API keys"** (new format)
   - **"Legacy anon, service_role API keys"** (old format - still works)

**Option A: Use New API Keys (Recommended)**

If you see **"Create API keys"** or **"Create new API keys"**:

1. Click **"Create new API keys"** (if you haven't created any yet)
2. You'll get:
   - **Publishable key** → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Secret key** → This is your `SUPABASE_SERVICE_ROLE_KEY`
3. Copy both keys

**Option B: Use Legacy Keys (If Available)**

If you see **"Legacy anon, service_role API keys"**:

1. Look for **"anon public"** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Look for **"service_role"** key → This is your `SUPABASE_SERVICE_ROLE_KEY`
3. Copy both keys

**Get Project URL:**

- Look for **"Project URL"** or **"URL"** field (usually at the top of the API page)
- Format: `https://xxxxxxxxxxxxx.supabase.co`
- This is your `NEXT_PUBLIC_SUPABASE_URL`

**Summary:**
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL (e.g., `https://xxxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Publishable key (new) OR anon public key (legacy)
- `SUPABASE_SERVICE_ROLE_KEY` = Secret key (new) OR service_role key (legacy) ⚠️ **Keep secret!**

**Visual Guide:**
```
Settings → API
├── Project URL: https://xxxxx.supabase.co  ← NEXT_PUBLIC_SUPABASE_URL
├── Publishable and secret API keys:
│   ├── Publishable key: eyJhbGc...  ← NEXT_PUBLIC_SUPABASE_ANON_KEY
│   └── Secret key: eyJhbGc...  ← SUPABASE_SERVICE_ROLE_KEY (keep secret!)
└── OR Legacy anon, service_role API keys:
    ├── anon public: eyJhbGc...  ← NEXT_PUBLIC_SUPABASE_ANON_KEY
    └── service_role: eyJhbGc...  ← SUPABASE_SERVICE_ROLE_KEY (keep secret!)
```

### 3. Add Environment Variables

**For Local Development:**

Create or update `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**For Production (Azure App Service):**

1. Go to Azure Portal → Your App Service → **Configuration** → **Application settings**
2. Add these as environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` = Your service_role key (⚠️ Keep secret!)

**For GitHub Actions (CI/CD):**

1. Go to GitHub → Your repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` = Your service_role key (⚠️ Keep secret!)

### 4. Enable OAuth Providers (Optional)

In Supabase Dashboard → **Authentication** → **Providers**:

1. **Google OAuth**:
   - Enable Google provider
   - Add your Google OAuth credentials
   - Set redirect URL: `http://localhost:3000/auth/callback` (dev)
   - Set redirect URL: `https://yourapp.azurewebsites.net/auth/callback` (prod)

2. **GitHub OAuth**:
   - Enable GitHub provider
   - Add your GitHub OAuth credentials
   - Set redirect URL: `http://localhost:3000/auth/callback` (dev)
   - Set redirect URL: `https://yourapp.azurewebsites.net/auth/callback` (prod)

### 5. Configure Email Templates (Optional)

Supabase handles email verification automatically. You can customize templates in:
**Authentication** → **Email Templates**

### 6. Test the Setup

1. Start your dev server: `npm run dev`
2. Go to `/signup` and create an account
3. Check your email for verification (if enabled)
4. Try logging in
5. Test OAuth providers (if configured)

## Features Included

✅ **Email/Password Authentication**
- Sign up with email and password
- Login with email and password
- Password reset (handled by Supabase)

✅ **Social OAuth** (when configured)
- Google OAuth
- GitHub OAuth
- Easy to add more providers

✅ **Session Management**
- Automatic session handling
- Protected routes via middleware
- Session refresh

✅ **User Management**
- User profiles
- User metadata (name, role, etc.)
- User updates

## Cost

- **Free Tier**: 50,000 MAU/month
- **Paid Tier**: $25/month + $0.00325/MAU after 50K
- **Database**: Included (PostgreSQL)
- **Storage**: Included (1GB free)

## Benefits Over Clerk

- ✅ **5x more free users** (50K vs 10K)
- ✅ **50% cheaper** at scale
- ✅ **Includes database** (PostgreSQL)
- ✅ **Includes storage** (1GB free)
- ✅ **Open source** (can self-host if needed)

## Migration from NextAuth

✅ **NextAuth has been completely removed** from the codebase. The AuthContext API remains the same, so your existing code should work without changes. The only differences are:
- Users are now stored in Supabase instead of MongoDB
- Sessions are managed by Supabase
- OAuth callbacks go through `/auth/callback`
- No NextAuth dependencies or files remain

## Troubleshooting

### Issue: "Invalid API key"
- Make sure you've added the environment variables
- Restart your dev server after adding env vars

### Issue: OAuth not working
- Check redirect URLs in Supabase dashboard
- Make sure OAuth providers are enabled
- Verify OAuth credentials are correct

### Issue: Users not persisting
- Check Supabase dashboard → Authentication → Users
- Verify database connection in Supabase

## Next Steps

1. ✅ Add environment variables
2. ✅ Test email/password auth
3. ✅ Configure OAuth providers (optional)
4. ✅ Customize email templates (optional)
5. ✅ Deploy to Azure with environment variables

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Supabase Discord: https://discord.supabase.com

Your Supabase Auth setup is complete! 🎉

