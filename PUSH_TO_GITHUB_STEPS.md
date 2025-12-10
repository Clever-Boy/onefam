# Steps to Push Code to GitHub and Deploy

## Step 1: Push Code to GitHub

Since the code is ready but needs authentication to push, follow these steps:

### Option A: Using Personal Access Token (Recommended)

1. **Generate GitHub Personal Access Token**:
   - Go to GitHub: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name: "OneFam Deployment"
   - Select scopes: Check `repo` (Full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Push to GitHub** (Run these commands in your terminal):
   ```bash
   cd /app
   git remote set-url origin https://github.com/Clever-Boy/onefam.git
   git branch -M main
   git push -u origin main
   ```
   
   When prompted for credentials:
   - Username: `Clever-Boy`
   - Password: Paste your Personal Access Token

### Option B: Using SSH (Alternative)

1. **Generate SSH Key** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add SSH Key to GitHub**:
   - Copy your public key:
     ```bash
     cat ~/.ssh/id_ed25519.pub
     ```
   - Go to GitHub → Settings → SSH and GPG keys
   - Click "New SSH key"
   - Paste your public key

3. **Change remote to SSH and push**:
   ```bash
   cd /app
   git remote set-url origin git@github.com:Clever-Boy/onefam.git
   git push -u origin main
   ```

---

## Step 2: Verify GitHub Repository

After pushing, verify at: https://github.com/Clever-Boy/onefam

You should see:
- ✅ `frontend/` folder with React app
- ✅ `backend/` folder with FastAPI server
- ✅ `README.md`
- ✅ `DEPLOYMENT.md`
- ✅ `.gitignore`

---

## Step 3: Deploy to Vercel (Frontend)

### Quick Deploy (5 minutes)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Repository**:
   - Click "Add New..." → "Project"
   - If not connected, click "Import Git Repository" and authorize GitHub
   - Select `Clever-Boy/onefam` repository
   - Click "Import"

3. **Configure Build Settings**:
   ```
   Framework Preset: Create React App
   Root Directory: frontend (Click Edit button to change)
   Build Command: yarn build
   Output Directory: build
   Install Command: yarn install
   ```

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add: `REACT_APP_BACKEND_URL` = `https://your-backend-url-here.onrender.com`
   - (You'll update this after deploying backend in Step 4)
   - For now, you can use: `https://kin-connect-16.preview.emergentagent.com/api` (temporary)

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - You'll get a URL like: `https://onefam-abc123.vercel.app`

6. **Test**:
   - Visit your Vercel URL
   - Login with: username=`onefam`, password=`Welcome1`

---

## Step 4: Deploy Backend (Choose One)

### Option A: Render (Recommended)

1. **Sign Up**: https://render.com (use GitHub to sign in)

2. **Create Web Service**:
   - Dashboard → "New +" → "Web Service"
   - Connect your GitHub: `Clever-Boy/onefam`
   - Click "Connect"

3. **Configure**:
   ```
   Name: onefam-backend
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```

4. **Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
   DB_NAME=onefam_database
   CORS_ORIGINS=*
   SECRET_KEY=your-random-32-character-secret-key
   ```
   
   For MONGO_URL, you need MongoDB Atlas (see Step 5)

5. **Create Web Service** (will take 3-5 minutes to deploy)

6. **Copy Backend URL**: 
   - You'll get something like: `https://onefam-backend-abc.onrender.com`
   - Copy this URL

7. **Update Vercel Frontend**:
   - Go to Vercel dashboard
   - Your project → Settings → Environment Variables
   - Edit `REACT_APP_BACKEND_URL` to: `https://onefam-backend-abc.onrender.com`
   - Redeploy frontend: Deployments → Latest → ... → Redeploy

8. **Update Backend CORS**:
   - Go back to Render dashboard
   - Your service → Environment
   - Edit `CORS_ORIGINS` to: `https://onefam-abc123.vercel.app`
   - (Use your actual Vercel URL)
   - Save changes (Render will auto-redeploy)

### Option B: Railway

1. **Sign Up**: https://railway.app
2. **New Project** → "Deploy from GitHub repo"
3. Select `Clever-Boy/onefam`
4. Add same environment variables as above
5. Railway will give you a URL
6. Follow same steps to update Vercel and CORS

---

## Step 5: Setup MongoDB Atlas (Database)

1. **Sign Up**: https://www.mongodb.com/cloud/atlas/register

2. **Create Cluster**:
   - Choose: "M0 Free" tier
   - Provider: AWS (or any)
   - Region: Choose closest to you
   - Cluster Name: "OneFam"
   - Click "Create Cluster"

3. **Database Access**:
   - Left sidebar → "Database Access"
   - Click "Add New Database User"
   - Choose: "Password" authentication
   - Username: `onefam_user`
   - Password: Generate and save it securely
   - Built-in Role: "Atlas admin" (or "Read and write to any database")
   - Click "Add User"

4. **Network Access**:
   - Left sidebar → "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Confirm (this adds 0.0.0.0/0)

5. **Get Connection String**:
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Python, Version: 3.12 or later
   - Copy the connection string:
     ```
     mongodb+srv://onefam_user:<password>@onefam.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - This is your `MONGO_URL`

6. **Update Backend Environment**:
   - Go to Render/Railway
   - Update `MONGO_URL` environment variable with your connection string
   - Backend will auto-restart

---

## Step 6: Final Testing

1. **Visit your Vercel app**: `https://onefam-abc123.vercel.app`

2. **Login**:
   - Username: `onefam`
   - Password: `Welcome1`

3. **Test Complete Flow**:
   - ✅ Create a family
   - ✅ Add family members with email addresses
   - ✅ Select father and mother for children
   - ✅ Upload photos
   - ✅ Add birthdays and anniversaries
   - ✅ View in Tree mode and Cards mode
   - ✅ Check alerts panel
   - ✅ Add custom events
   - ✅ Filter events by month/year

4. **Test Email Notifications** (Optional):
   - Add SendGrid API key to backend environment
   - Add family member with valid email
   - Add birthday for tomorrow
   - Click "Send Alert Emails" in alerts panel

---

## Step 7: Optional - Custom Domain

### Add Custom Domain to Vercel

1. **In Vercel**:
   - Project → Settings → Domains
   - Add your domain: `onefam.yourdomain.com`

2. **Update DNS** (at domain registrar):
   - Add CNAME record:
     - Name: `onefam`
     - Value: `cname.vercel-dns.com`
   - Save and wait for DNS propagation (5-30 min)

3. **Update Backend CORS**:
   - Add your custom domain to `CORS_ORIGINS`
   - Example: `https://onefam.yourdomain.com`

---

## Troubleshooting

### Can't push to GitHub
- Make sure you're using the correct repository URL
- Check your GitHub token has `repo` scope
- Try: `git remote -v` to verify remote URL

### Frontend deployment fails on Vercel
- Verify "Root Directory" is set to `frontend`
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`

### Backend not starting
- Check environment variables are set correctly
- View logs in Render/Railway dashboard
- Verify MongoDB connection string is correct

### Database connection error
- Check MongoDB Atlas allows connections from 0.0.0.0/0
- Verify password in connection string doesn't need URL encoding
- Test connection string format is correct

### CORS errors in browser
- Verify `CORS_ORIGINS` in backend matches your Vercel URL exactly
- Must include `https://` and no trailing slash
- Redeploy backend after changing CORS

---

## Summary of URLs You'll Need

After deployment, keep track of:

- **GitHub Repository**: https://github.com/Clever-Boy/onefam
- **Frontend (Vercel)**: https://onefam-abc123.vercel.app
- **Backend (Render)**: https://onefam-backend-abc.onrender.com
- **MongoDB**: Connection string with credentials
- **Login**: username=`onefam`, password=`Welcome1`

---

## Cost Summary

- ✅ GitHub: Free
- ✅ Vercel: Free (hobby tier)
- ✅ Render: Free (with sleep after 15min inactivity)
- ✅ MongoDB Atlas: Free (M0 tier, 512MB)
- ✅ SendGrid: Free (100 emails/day) - Optional

**Total: $0/month** for personal/family use! 🎉

For production with guaranteed uptime:
- Render Starter: $7/month (no sleep)
- Everything else stays free

---

## Next Steps

1. ☐ Push code to GitHub (Step 1)
2. ☐ Deploy frontend to Vercel (Step 3)
3. ☐ Setup MongoDB Atlas (Step 5)
4. ☐ Deploy backend to Render (Step 4)
5. ☐ Update environment variables
6. ☐ Test complete application
7. ☐ Share with family! 👨‍👩‍👧‍👦

**Need help?** Open an issue on GitHub: https://github.com/Clever-Boy/onefam/issues

---

Good luck with your deployment! 🚀
