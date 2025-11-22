# Setup Instructions for Online-MART

## Fix Registration Error

The registration error you're experiencing is due to a missing Supabase Service Role Key. Follow these steps to fix it:

### Step 1: Get Your Supabase Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (xqedkahmicwcwhnnxmks)
3. Click on the **Settings** icon (gear icon) in the left sidebar
4. Click on **API** under Project Settings
5. Scroll down to the **Project API keys** section
6. Copy the **service_role** key (NOT the anon key)

### Step 2: Add the Key to .env.local

1. Open the `.env.local` file in your project root
2. Find the line that says:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```
3. Replace `your_supabase_service_role_key_here` with your actual service role key
4. Save the file

### Step 3: Restart the Development Server

1. Stop the current Next.js server (press Ctrl+C in the terminal)
2. Start it again with: `npm run dev`

### Step 4: Test Registration

Try registering a new user again. The error should now be fixed!

## What Was Fixed

The following issues were corrected in your codebase:

1. **Missing Service Role Key**: Added `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (you need to fill in the actual key)

2. **Server-Side Registration API**: Fixed `/app/api/auth/register/route.ts`
   - Removed incorrect import of client-side Supabase on the server
   - Removed server-side sign-in attempt (moved to client)
   - Added better error handling with cleanup on failure
   - Returns success response for client-side sign-in

3. **Client-Side Auth Service**: Updated `/lib/services/AuthService.ts`
   - After server creates user, client now signs in properly
   - Removed fallback to client-side registration (unnecessary complexity)
   - Better error messages

4. **Admin Client**: Improved `/lib/supabase/admin.ts`
   - Added clear error messages when env vars are missing
   - Better validation

## Security Note

⚠️ **IMPORTANT**: The Service Role Key has elevated privileges and can bypass Row Level Security (RLS). 

- NEVER expose it in client-side code
- NEVER commit it to version control (it should only be in `.env.local` which is gitignored)
- Only use it in server-side API routes or server components

## Troubleshooting

If you still get errors after following these steps:

1. **Check the browser console** for detailed error messages
2. **Check the terminal** where Next.js is running for server-side errors
3. **Verify your Supabase URL** is correct in `.env.local`
4. **Verify your Service Role Key** is correct (copy it again from Supabase Dashboard)
5. **Check Supabase Dashboard > Authentication > Providers** - ensure Email provider is enabled
6. **Check your database** - ensure all tables exist (run the SQL scripts in `/scripts/` if needed)

## Database Setup

If you haven't set up your database yet:

1. Go to Supabase Dashboard > SQL Editor
2. Run the scripts in this order:
   - `scripts/01-create-schema.sql`
   - `scripts/02-seed-data.sql`

## Need Help?

If you're still experiencing issues, check:
- The error message in your browser's console (F12 > Console tab)
- The terminal output where Next.js is running
- Supabase Dashboard > Logs for any database errors
