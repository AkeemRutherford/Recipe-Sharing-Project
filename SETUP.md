# KollabKitchen - Team Setup Guide

Welcome to KollabKitchen! This guide will help you set up authentication for the team.

## Current Status

✅ Database is set up and ready
✅ Application is built and deployed
⚠️ OAuth providers need to be configured (one-time setup)

## Authentication Setup Required

Before your team can log in, you need to configure Google and/or Apple OAuth providers in Supabase.

### Step 1: Configure Google OAuth (Recommended)

1. Visit your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle it to **Enabled**
6. Follow the instructions to:
   - Create OAuth credentials in Google Cloud Console
   - Add authorized redirect URIs
   - Copy Client ID and Client Secret to Supabase

**Authorized Redirect URI for your project:**
```
https://lgvhisbcrdcherbsllhx.supabase.co/auth/v1/callback
```

### Step 2: Configure Apple OAuth (Optional)

1. In the same **Providers** section
2. Find **Apple** and enable it
3. Follow the setup instructions for Apple Developer account

### Step 3: Test Login

Once OAuth is configured:
1. Visit your app
2. Click "Continue with Google" or "Continue with Apple"
3. Complete the OAuth flow
4. You'll be automatically logged in!

## Features Available

### 🍳 Recipe Management
- Browse all team recipes
- Add new recipes with full details
- Edit your own recipes
- Like recipes from teammates

### 👥 Community Collaboration
- Suggest modifications (substitutions, additions, tips)
- Ask questions on any recipe
- See popular community modifications
- Like helpful suggestions

### 🔔 Real-time Notifications
- Get notified when someone modifies your recipe
- See when your recipes are liked
- Real-time updates via bell icon in header

### 📊 My Recipes Dashboard
- View all your created recipes
- See recent community activity
- Track popular modifications

## Team Roles

Everyone on the team has equal access to:
- Create recipes
- View all recipes
- Comment and suggest modifications
- Like and save recipes
- Receive notifications

## Support

If you encounter any issues:
1. Check that OAuth providers are enabled in Supabase
2. Verify the redirect URLs are correct
3. Clear browser cache and try again
4. Check browser console for any error messages

## Privacy & Security

- All data is stored securely in Supabase
- Row Level Security (RLS) policies protect all data
- Users can only edit their own recipes
- All community suggestions are tracked and attributed
- OAuth authentication via Google/Apple (no passwords stored)

## Next Steps

1. Configure OAuth providers (see Step 1 above)
2. Share the app URL with your team
3. Have everyone sign in
4. Start collaborating on recipes!

Enjoy collaborating on recipes together!
