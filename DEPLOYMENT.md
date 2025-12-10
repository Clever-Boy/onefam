# Deployment Guide - OneFam to Vercel

This guide will help you deploy the OneFam family tree application to Vercel (frontend) and a backend hosting service.

## Prerequisites

1. GitHub account with the code pushed to: https://github.com/Clever-Boy/onefam.git
2. Vercel account (free tier available at https://vercel.com)
3. MongoDB Atlas account (free tier at https://www.mongodb.com/cloud/atlas)
4. SendGrid account for email notifications (optional, free tier at https://sendgrid.com)

---

## Part 1: Deploy Backend (Choose One Option)

### Option A: Deploy to Render (Recommended - Free Tier Available)

1. **Go to Render**: https://render.com
2. **Sign up/Login** with your GitHub account
3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Clever-Boy/onefam`
   - Configure:
     - **Name**: `onefam-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. **Add Environment Variables**:
   ```
   MONGO_URL=your_mongodb_atlas_connection_string
   DB_NAME=onefam_database
   CORS_ORIGINS=*
   SECRET_KEY=your-random-secret-key-here
   SENDGRID_API_KEY=your-sendgrid-api-key (optional)
   SENDER_EMAIL=noreply@yourdomain.com (optional)
   ```
5. **Deploy** - Render will automatically deploy your backend
6. **Copy Backend URL** - You'll get a URL like: `https://onefam-backend.onrender.com`

### Option B: Deploy to Railway

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **New Project** → "Deploy from GitHub repo"
4. Select `Clever-Boy/onefam` repository
5. **Add Environment Variables** (same as above)
6. **Configure**:
   - Root Directory: `backend`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
7. Railway will auto-deploy and provide a URL

---

## Part 2: Setup MongoDB Atlas (Database)

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Create Free Account** and new cluster (M0 Free tier)
3. **Database Access**:
   - Create a database user with password
   - Remember username and password
4. **Network Access**:
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. **Use this in your backend environment variables as MONGO_URL**

---

## Part 3: Deploy Frontend to Vercel

### Step-by-Step Vercel Deployment

1. **Push Code to GitHub**:
   ```bash
   cd /app
   git add .
   git commit -m "Initial commit - OneFam family tree application"
   git push -u origin main
   ```
   
   If you get authentication error, use GitHub personal access token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Use token as password when pushing

2. **Go to Vercel**: https://vercel.com

3. **Sign Up/Login** with GitHub

4. **Import Project**:
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find and select your `onefam` repository
   - Click "Import"

5. **Configure Project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: Click "Edit" and select `frontend`
   - **Build Command**: `yarn build` (default)
   - **Output Directory**: `build` (default)
   - **Install Command**: `yarn install` (default)

6. **Environment Variables** - Add these:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
   ```
   Replace with your actual backend URL from Part 1

7. **Deploy** - Click "Deploy"
   - Vercel will build and deploy your frontend
   - This takes 2-3 minutes

8. **Get Your App URL**:
   - After deployment, you'll get a URL like: `https://onefam-xyz123.vercel.app`
   - This is your live application!

9. **Update CORS** (Important):
   - Go back to your backend hosting (Render/Railway)
   - Update the `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://onefam-xyz123.vercel.app
   ```
   - Replace with your actual Vercel URL
   - Redeploy backend if needed

---

## Part 4: Optional - Custom Domain

### Add Custom Domain to Vercel

1. **In Vercel Dashboard**:
   - Go to your project
   - Click "Settings" → "Domains"
   - Add your domain (e.g., `onefam.yourdomain.com`)

2. **Update DNS** (at your domain registrar):
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Wait for DNS propagation (5-30 minutes)

3. **Update CORS**:
   - Update backend `CORS_ORIGINS` to include your custom domain

---

## Part 5: Testing Your Deployment

1. **Visit Your Vercel URL**: `https://onefam-xyz123.vercel.app`

2. **Test Login**:
   - Username: `onefam`
   - Password: `Welcome1`

3. **Test Features**:
   - Create a family
   - Add family members with photos
   - Try both Tree and Cards view
   - Add birthdays/anniversaries
   - Check alerts panel
   - Test email notifications (if SendGrid configured)

---

## Part 6: Environment Variables Summary

### Backend Environment Variables
```env
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=onefam_database
CORS_ORIGINS=https://your-vercel-app.vercel.app
SECRET_KEY=generate-a-random-secret-key
SENDGRID_API_KEY=SG.xxxxx (optional)
SENDER_EMAIL=noreply@yourdomain.com (optional)
```

### Frontend Environment Variables
```env
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
```

---

## Troubleshooting

### Frontend can't connect to backend
- Check that `REACT_APP_BACKEND_URL` is correct in Vercel
- Ensure backend URL includes `https://` and no trailing slash
- Verify CORS_ORIGINS in backend includes your Vercel URL

### Database connection error
- Verify MongoDB Atlas connection string is correct
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Ensure database user has read/write permissions

### Email notifications not working
- Verify SendGrid API key is valid
- Check sender email is verified in SendGrid
- Email functionality is optional - app works without it

### Build fails on Vercel
- Check that `frontend` is set as root directory
- Ensure `package.json` is in the frontend folder
- Verify all dependencies are listed in `package.json`

---

## Maintenance

### Update Application
1. Make changes to code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. Vercel automatically redeploys frontend
4. Backend (Render/Railway) auto-redeploys on push

### Monitor Application
- **Vercel Dashboard**: View deployment logs and analytics
- **Render/Railway Dashboard**: Monitor backend performance
- **MongoDB Atlas**: Monitor database usage

---

## Cost Estimate

- **Vercel (Frontend)**: Free for hobby projects
- **Render/Railway (Backend)**: Free tier available (sleeps after inactivity)
- **MongoDB Atlas**: Free tier (512MB storage)
- **SendGrid**: Free tier (100 emails/day)

**Total**: $0/month for small family use!

For production use with guaranteed uptime:
- Render: $7/month
- Railway: $5/month
- MongoDB: Free tier sufficient
- SendGrid: Free tier sufficient

---

## Security Notes

1. **Never commit .env files** to GitHub
2. **Use strong SECRET_KEY** (generate random 32+ character string)
3. **Update default password** after first deployment
4. **Restrict CORS_ORIGINS** to your actual domain
5. **Use MongoDB Atlas IP whitelist** for production

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check backend logs in Render/Railway
3. Verify all environment variables are set correctly
4. Ensure MongoDB Atlas is accessible

---

**Congratulations!** 🎉 Your OneFam application is now live!
