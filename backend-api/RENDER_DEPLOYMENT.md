# Deploy to Render.com

This guide will help you deploy the KaasproFoods backend to Render.com.

## Prerequisites

- GitHub account (to connect with Render)
- Render.com account (free) - Sign up at https://render.com

## Step-by-Step Deployment

### Step 1: Push Code to GitHub

Make sure your latest code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare backend for Render deployment"
git push
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Click "Get Started" or "Sign Up"
3. Sign up with your GitHub account
4. Authorize Render to access your repositories

### Step 3: Deploy Using render.yaml (Recommended)

1. **In Render Dashboard:**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository: `SANJEEV-1208/caters`
   - Render will detect `backend-api/render.yaml`
   - Click "Apply"

2. **Configure Environment Variables:**

   Render will automatically create:
   - PostgreSQL database (`kaaspro-db`)
   - Web service (`kaaspro-backend`)

   You need to manually add:
   - `CLOUDINARY_CLOUD_NAME`: `dgejbxsy7`
   - `CLOUDINARY_API_KEY`: `847672925565527`
   - `CLOUDINARY_API_SECRET`: `EzXIpFPtpcXkFW0KdTA1bVPTi90`

3. **Database Initialization:**
   - After first deploy, the database will be automatically initialized with schema and seed data
   - This happens via the `postDeployCommand: npm run init-db` in render.yaml

### Step 4: Get Your Backend URL

After deployment completes (5-10 minutes):
- Your backend URL will be: `https://kaaspro-backend.onrender.com`
- Test it: `https://kaaspro-backend.onrender.com/health`
- Should return: `{"status":"OK","message":"Server is running"}`

### Step 5: Update Mobile App

Update `delivery-app/src/config/api.ts`:
```typescript
const BASE_URL_IP = 'kaaspro-backend.onrender.com';
const PORT = '443'; // HTTPS
const USE_HTTPS = true; // Set to true for Render

export const API_CONFIG = {
  BASE_URL: `https://${BASE_URL_IP}/api`, // Use HTTPS
  TIMEOUT: 10000,
};
```

### Alternative: Manual Deployment (If Blueprint Fails)

If the Blueprint method doesn't work, deploy manually:

#### Create PostgreSQL Database:
1. New + → PostgreSQL
2. Name: `kaaspro-db`
3. Database: `kaaspro_delivery_db`
4. User: `kaaspro_user`
5. Region: Choose closest to you
6. Plan: Free
7. Create Database

#### Create Web Service:
1. New + → Web Service
2. Connect your repository: `SANJEEV-1208/caters`
3. Root Directory: `backend-api`
4. Name: `kaaspro-backend`
5. Runtime: Node
6. Build Command: `npm install`
7. Start Command: `npm start`
8. Plan: Free

#### Add Environment Variables:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=[Copy from your PostgreSQL instance]
JWT_SECRET=[Generate a random string]
CLOUDINARY_CLOUD_NAME=dgejbxsy7
CLOUDINARY_API_KEY=847672925565527
CLOUDINARY_API_SECRET=EzXIpFPtpcXkFW0KdTA1bVPTi90
```

#### Initialize Database:
After deployment, go to your web service:
1. Click "Shell" tab
2. Run: `npm run init-db`

## Testing

Test your deployed backend:

```bash
# Health check
curl https://kaaspro-backend.onrender.com/health

# Test login
curl -X POST https://kaaspro-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210"}'
```

## Important Notes

⚠️ **Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- First request after spin down takes 30-60 seconds (cold start)
- 750 hours/month free (enough for one service running 24/7)

💡 **Database Persistence:**
- Free PostgreSQL databases expire after 90 days
- Upgrade to paid plan ($7/month) for permanent database

🔒 **Security:**
- HTTPS is automatically enabled
- Database passwords are auto-generated
- Use environment variables for secrets (already configured)

## Troubleshooting

**Build fails:**
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json

**Database connection errors:**
- Verify DATABASE_URL is set correctly
- Check database is running and accessible

**App doesn't start:**
- Check logs: Dashboard → your service → Logs
- Ensure PORT environment variable is set

## Need Help?

- Render Docs: https://render.com/docs
- PostgreSQL on Render: https://render.com/docs/databases
