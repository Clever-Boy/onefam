# OneFam Deployment Checklist

## ✅ Step 1: GitHub - COMPLETE!
- [x] Code pushed to: https://github.com/Clever-Boy/onefam
- [x] Repository is public and accessible
- [x] All files uploaded successfully

**Verify**: Visit https://github.com/Clever-Boy/onefam and check you can see:
- `frontend/` folder
- `backend/` folder
- `README.md`
- `DEPLOYMENT.md`

---

## 📋 Step 2: Deploy to Vercel (Frontend) - ~3 minutes

### Instructions:

1. **Go to Vercel**: https://vercel.com/new

2. **Sign In/Sign Up**: 
   - Use GitHub to sign in
   - Authorize Vercel to access your repositories

3. **Import Repository**:
   - Click "Import Git Repository"
   - Search for "onefam" or find `Clever-Boy/onefam`
   - Click "Import"

4. **Configure Project** - IMPORTANT SETTINGS:
   ```
   Framework Preset: Create React App
   Root Directory: frontend  ⚠️ MUST CLICK "EDIT" AND SELECT "frontend"
   Build Command: yarn build
   Output Directory: build
   Install Command: yarn install
   ```

5. **Environment Variables** - Click "Add" and enter:
   ```
   Key: REACT_APP_BACKEND_URL
   Value: https://kin-connect-16.preview.emergentagent.com
   ```
   (We'll update this after deploying backend)

6. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy your Vercel URL: `https://onefam-xxxxx.vercel.app`

7. **Test**:
   - Visit your Vercel URL
   - Login: username=`onefam`, password=`Welcome1`
   - Should see the login page and dashboard

**Status**: ☐ Not Started | ☐ In Progress | ☐ Complete

**My Vercel URL**: _________________________________

---

## 📋 Step 3: Setup MongoDB Atlas (Database) - ~3 minutes

### Instructions:

1. **Sign Up**: https://www.mongodb.com/cloud/atlas/register
   - Use Google/GitHub for quick signup

2. **Create Free Cluster**:
   - Choose: **M0 FREE** tier
   - Cloud Provider: AWS (or any)
   - Region: Choose closest to your location
   - Cluster Name: `OneFam`
   - Click "Create Cluster" (takes 1-3 minutes)

3. **Create Database User**:
   - Left menu → "Database Access"
   - Click "Add New Database User"
   - Authentication Method: "Password"
   - Username: `onefam_admin`
   - Password: Click "Autogenerate Secure Password" and SAVE IT!
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Setup Network Access**:
   - Left menu → "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Confirm (adds 0.0.0.0/0)

5. **Get Connection String**:
   - Left menu → "Database"
   - Click "Connect" button on your cluster
   - Choose "Connect your application"
   - Driver: Python / Version: 3.12 or later
   - **Copy the connection string** - looks like:
     ```
     mongodb+srv://onefam_admin:<password>@onefam.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **Replace `<password>`** with the password you saved in step 3

**Status**: ☐ Not Started | ☐ In Progress | ☐ Complete

**My MongoDB Connection String**: _________________________________

---

## 📋 Step 4: Deploy Backend to Render - ~5 minutes

### Instructions:

1. **Sign Up**: https://render.com
   - Click "Get Started"
   - Sign in with GitHub

2. **Create Web Service**:
   - Dashboard → Click "New +" → "Web Service"
   - Click "Connect account" if needed to authorize GitHub
   - Find and select `Clever-Boy/onefam` repository
   - Click "Connect"

3. **Configure Service**:
   ```
   Name: onefam-backend
   Root Directory: backend
   Environment: Python 3
   Region: Choose closest to you
   Branch: main
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```

4. **Add Environment Variables** - Click "Advanced" then "Add Environment Variable":
   
   Add these ONE BY ONE:
   
   ```
   MONGO_URL = [Your MongoDB connection string from Step 3]
   DB_NAME = onefam_database
   CORS_ORIGINS = *
   SECRET_KEY = onefam-secret-key-2024-change-this-in-production
   ```
   
   Optional (for email notifications):
   ```
   SENDGRID_API_KEY = [Your SendGrid key if you have one]
   SENDER_EMAIL = noreply@onefam.com
   ```

5. **Create Web Service**:
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Watch the logs - should see "Application startup complete"

6. **Copy Backend URL**:
   - Top of page shows URL like: `https://onefam-backend-xxxx.onrender.com`
   - **Copy this URL**

**Status**: ☐ Not Started | ☐ In Progress | ☐ Complete

**My Render Backend URL**: _________________________________

---

## 📋 Step 5: Connect Frontend and Backend - ~2 minutes

### Part A: Update Vercel with Backend URL

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your "onefam" project
3. Click "Settings" tab
4. Click "Environment Variables" in left menu
5. Find `REACT_APP_BACKEND_URL`
6. Click "..." → "Edit"
7. **Change value to your Render backend URL** (from Step 4)
   - Example: `https://onefam-backend-xxxx.onrender.com`
   - ⚠️ NO trailing slash!
8. Click "Save"
9. Go to "Deployments" tab
10. Click "..." on latest deployment → "Redeploy"
11. Wait 1-2 minutes for redeployment

### Part B: Update Backend CORS with Vercel URL

1. **Go to Render Dashboard**: https://dashboard.render.com
2. Click on your "onefam-backend" service
3. Click "Environment" in left menu
4. Find `CORS_ORIGINS`
5. Click "Edit" button
6. **Change value to your Vercel URL** (from Step 2)
   - Example: `https://onefam-xxxxx.vercel.app`
   - ⚠️ NO trailing slash!
7. Click "Save Changes"
8. Render will automatically redeploy (wait 1-2 minutes)

**Status**: ☐ Not Started | ☐ In Progress | ☐ Complete

---

## 📋 Step 6: Final Testing - ~5 minutes

### Test Your Live Application:

1. **Visit Your Vercel URL**: `https://onefam-xxxxx.vercel.app`

2. **Login**:
   - Username: `onefam`
   - Password: `Welcome1`
   - ✓ Should redirect to dashboard

3. **Create Family**:
   - Click "Create Family" button
   - Enter name: "Test Family"
   - ✓ Should create and show in list

4. **Add Family Member**:
   - Click on family card
   - Click "Add Member"
   - Fill in:
     - First Name: John
     - Last Name: Doe
     - Email: your-email@example.com (for testing)
     - Birthday: Pick a date
   - Upload a photo (optional)
   - Click "Add Member"
   - ✓ Should appear in tree view

5. **Test Views**:
   - ✓ Click "Cards View" - should show member in card
   - ✓ Click "Tree View" - should show member in tree

6. **Test Alerts**:
   - Click bell icon (alerts)
   - ✓ Should show upcoming birthdays
   - ✓ Try "Send Alert Emails" button

7. **Test Events Calendar**:
   - Click calendar icon
   - Add custom event
   - Filter by month
   - ✓ Should display events

8. **Add Another Member with Parents**:
   - Add another member
   - Set "Father" to John Doe
   - ✓ Should show parent-child relationship in tree

**Status**: ☐ Not Started | ☐ In Progress | ☐ Complete

**Test Results**: ☐ All Working | ☐ Issues Found: _________________

---

## 🎉 Deployment Complete!

### Your Live URLs:

- **GitHub**: https://github.com/Clever-Boy/onefam
- **Frontend**: https://onefam-xxxxx.vercel.app
- **Backend**: https://onefam-backend-xxxx.onrender.com
- **MongoDB**: [Connection string in Render env vars]

### Share with Your Family:

Send them:
1. Your Vercel URL
2. Login credentials: username=`onefam`, password=`Welcome1`
3. Instructions to add their email for notifications

---

## 📊 Deployment Summary

| Step | Service | Time | Status |
|------|---------|------|--------|
| 1 | GitHub | 1 min | ✅ Complete |
| 2 | Vercel (Frontend) | 3 min | ☐ |
| 3 | MongoDB Atlas | 3 min | ☐ |
| 4 | Render (Backend) | 5 min | ☐ |
| 5 | Connect Services | 2 min | ☐ |
| 6 | Testing | 5 min | ☐ |
| **Total** | | **~20 min** | |

---

## 🆘 Troubleshooting

### Frontend shows blank page or errors:
- Check browser console for errors (F12)
- Verify `REACT_APP_BACKEND_URL` is set correctly in Vercel
- Redeploy frontend after changing env vars

### Backend not responding:
- Check Render logs: Dashboard → Service → Logs tab
- Verify all environment variables are set
- Check MongoDB connection string is correct

### CORS errors:
- Most common issue!
- Backend `CORS_ORIGINS` MUST match Vercel URL exactly
- Include `https://` and NO trailing slash
- Redeploy backend after changing CORS

### Can't login:
- Check browser Network tab (F12 → Network)
- Verify backend URL is responding
- Check backend logs for errors

### Database connection failed:
- Verify MongoDB Atlas allows 0.0.0.0/0 in Network Access
- Check password in connection string doesn't have special chars
- Try connection string in MongoDB Compass to test

---

## 💰 Free Tier Limits

- **Vercel**: 100GB bandwidth/month (plenty for family use)
- **Render**: Sleeps after 15 minutes of inactivity (restarts in ~30 seconds)
- **MongoDB Atlas**: 512MB storage (thousands of family members)

**Tip**: First request after backend sleep may be slow (~30s). After that, it's fast!

---

## 📝 Next Steps After Deployment

1. **Change Default Password**:
   - Currently uses: `Welcome1`
   - Recommend updating in backend code and redeploying

2. **Setup SendGrid** (Optional):
   - Get free API key: https://sendgrid.com
   - Add to Render environment variables
   - Enable email notifications

3. **Custom Domain** (Optional):
   - In Vercel → Settings → Domains
   - Add your domain
   - Update DNS CNAME record

4. **Invite Family Members**:
   - Share your Vercel URL
   - Help them create profiles
   - Add emails for notifications

---

## 📞 Support

**Issues?** 
- Check troubleshooting section above
- Review logs in Vercel and Render dashboards
- Open issue on GitHub: https://github.com/Clever-Boy/onefam/issues

**Documentation**:
- `/app/DEPLOYMENT.md` - Detailed guide
- `/app/QUICK_DEPLOY.md` - Quick reference
- `/app/README.md` - Project overview

---

**Good luck with your deployment!** 🚀👨‍👩‍👧‍👦
