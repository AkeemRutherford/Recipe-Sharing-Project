# Deployment Instructions for Netlify

## Environment Variables Required

After deploying to Netlify, you **MUST** configure the following environment variables in your Netlify site settings:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add these variables:

```
VITE_SUPABASE_URL=https://lgvhisbcrdcherbsllhx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndmhpc2JjcmRjaGVyYnNsbGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODkyOTgsImV4cCI6MjA3NTY2NTI5OH0.blm3lmqDRGP455BF7WURcW_5jsw9lhC2Sm_xDCq2vrA
```

4. After adding the variables, trigger a **new deploy** (Site settings → Deploys → Trigger deploy → Clear cache and deploy site)

## Quick Deploy

Upload the `dist` folder to Netlify at: https://app.netlify.com/drop

Then configure the environment variables as described above and redeploy.

## Test Account

Once deployed and configured, you can test the app using:
- Email: test@kollabkitchen.com
- Password: TestAccount123!

Or click the "Test Account (Demo)" button on the login page.
