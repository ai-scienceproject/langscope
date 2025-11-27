# Deployment Checklist

## ✅ GitHub Secrets (Already Set)

Make sure you have these secrets in GitHub:
- [x] `AZURE_WEBAPP_PUBLISH_PROFILE`
- [x] `DATABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `AZURE_WEBAPP_NAME` (optional - defaults to `langscope-h3eph9deh7e8b6d5`)
- [ ] `NEXT_PUBLIC_API_URL` (optional - has default)
- [ ] `NEXT_PUBLIC_WS_URL` (optional - has default)

## ⚠️ Azure App Service Environment Variables

**IMPORTANT:** You also need to set environment variables in Azure App Service!

1. Go to Azure Portal → Your App Service (`langscope-h3eph9deh7e8b6d5`)
2. Click **Configuration** → **Application settings**
3. Add these environment variables:

   **Required:**
   - `DATABASE_URL` = Your MongoDB connection string
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key
   - `NODE_ENV` = `production`

   **Optional (with defaults):**
   - `NEXT_PUBLIC_API_URL` = `https://langscope-h3eph9deh7e8b6d5.eastasia-01.azurewebsites.net`
   - `NEXT_PUBLIC_WS_URL` = `wss://langscope-h3eph9deh7e8b6d5.eastasia-01.azurewebsites.net`

4. Click **Save** (this will restart your app)

## 🚀 Deploy Your App

### Option 1: Automatic Deployment (Push to GitHub)

1. Commit and push your code:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. The workflow will automatically run
3. Check progress: GitHub → **Actions** tab

### Option 2: Manual Deployment (Trigger Workflow)

1. Go to: https://github.com/ai-scienceproject/langscope
2. Click **Actions** tab
3. Select **"Deploy to Azure App Service"** workflow
4. Click **"Run workflow"** → **"Run workflow"** button
5. Watch the deployment progress

## 📊 Monitor Deployment

1. **GitHub Actions:**
   - Go to **Actions** tab
   - Click on the latest workflow run
   - Watch the build and deploy steps

2. **Azure Portal:**
   - Go to App Service → **Deployment Center**
   - Check **Logs** for deployment status

3. **App Logs:**
   - Go to App Service → **Log stream**
   - Or **Logs** → **Download** to see application logs

## ✅ Verify Deployment

After deployment completes:

1. **Check App URL:**
   - Go to: `https://langscope-h3eph9deh7e8b6d5.eastasia-01.azurewebsites.net`
   - App should load

2. **Test API:**
   - Try: `https://langscope-h3eph9deh7e8b6d5.eastasia-01.azurewebsites.net/api/domains`
   - Should return JSON data

3. **Check Logs:**
   - Look for any errors in App Service logs
   - Check for database connection issues
   - Verify environment variables are loaded

## 🔧 Troubleshooting

### App Not Loading
- Check App Service → **Overview** → Status should be "Running"
- Check **Log stream** for errors
- Verify environment variables are set correctly

### Build Fails
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Check for TypeScript/build errors

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Cosmos DB firewall rules
- Ensure database is accessible from Azure

### Authentication Not Working
- Verify Supabase keys are correct
- Check OAuth redirect URLs in Supabase
- Verify environment variables are set in Azure

## 🎉 Success!

Once deployed, your app will be live at:
`https://langscope-h3eph9deh7e8b6d5.eastasia-01.azurewebsites.net`

