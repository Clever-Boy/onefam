# Quick Deploy Reference Card

## 🚀 3-Step Deployment

### 1️⃣ Push to GitHub (2 min)
```bash
cd /app
git remote set-url origin https://github.com/Clever-Boy/onefam.git
git push -u origin main
```
*Use GitHub Personal Access Token when prompted for password*
- Get token: https://github.com/settings/tokens
- Scope needed: `repo`

---

### 2️⃣ Deploy Frontend to Vercel (3 min)
1. Go to: https://vercel.com/new
2. Import `Clever-Boy/onefam` repo
3. **Root Directory**: `frontend` ⚠️ Important!
4. Add env var: `REACT_APP_BACKEND_URL` = (get from step 3)
5. Deploy!

**Result**: `https://onefam-xyz.vercel.app`

---

### 3️⃣ Deploy Backend to Render (5 min)
1. Go to: https://render.com
2. New Web Service → Connect `Clever-Boy/onefam`
3. Configure:
   - Root: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   ```
   MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
   DB_NAME=onefam_database
   CORS_ORIGINS=https://your-vercel-url.vercel.app
   SECRET_KEY=random-32-char-secret
   ```
5. Deploy!

**Result**: `https://onefam-backend-xyz.onrender.com`

---

## 🗄️ MongoDB Setup (Free Tier)
1. https://www.mongodb.com/cloud/atlas/register
2. Create M0 Free cluster
3. Add database user + password
4. Network Access → Allow 0.0.0.0/0
5. Get connection string → Use as `MONGO_URL`

---

## 🔄 Link Everything Together

### Update Vercel with Backend URL:
- Vercel Dashboard → Settings → Environment Variables
- Edit `REACT_APP_BACKEND_URL` → `https://onefam-backend-xyz.onrender.com`
- Redeploy

### Update Backend with Frontend URL:
- Render Dashboard → Environment
- Edit `CORS_ORIGINS` → `https://onefam-xyz.vercel.app`
- Auto-redeploys

---

## ✅ Test Your App

Visit: `https://onefam-xyz.vercel.app`

**Login**: username=`onefam`, password=`Welcome1`

**Test**:
- ✓ Create family
- ✓ Add members with emails
- ✓ Select father & mother
- ✓ Upload photos
- ✓ View tree & cards
- ✓ Check alerts
- ✓ Send email notifications

---

## 📊 Deployment Status

| Service | URL | Status |
|---------|-----|--------|
| GitHub | https://github.com/Clever-Boy/onefam | ☐ Not Pushed |
| Vercel (Frontend) | https://onefam-xyz.vercel.app | ☐ Not Deployed |
| Render (Backend) | https://onefam-backend-xyz.onrender.com | ☐ Not Deployed |
| MongoDB Atlas | Connection String | ☐ Not Setup |

---

## 💰 Cost: $0/month (Free Tier)

- GitHub: Free
- Vercel: Free
- Render: Free (sleeps after 15min)
- MongoDB: Free (512MB)

---

## 🆘 Common Issues

**CORS Error**: Update `CORS_ORIGINS` in backend with exact Vercel URL

**Can't Connect to DB**: Check MongoDB allows 0.0.0.0/0 in Network Access

**Build Failed**: Verify Root Directory is set to `frontend` in Vercel

**Backend Not Starting**: Check all environment variables are set

---

## 📚 Full Documentation

- **Complete Guide**: `/app/DEPLOYMENT.md`
- **Detailed Steps**: `/app/PUSH_TO_GITHUB_STEPS.md`
- **README**: `/app/README.md`

---

**Total Time**: ~15 minutes for complete deployment! ⚡
