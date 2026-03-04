# Deployment Guide for PathFinder AI

## 1. Frontend (Vercel)

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and import the `frontend` folder.
3. Vercel will automatically detect Vite. 
4. Important: Set the following environment variable in Vercel:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api` (Wait until backend is deployed to get this).
5. The `vercel.json` file is already included to handle React Router paths.

## 2. Backend (Render or Railway)

We recommend **Render.com** or **Railway.app** because they both support running a `web` service (FastAPI) and a `worker` service (Celery) easily, along with provisioned Redis and MongoDB databases.

### Prerequisites (Database & Cache)
1. **MongoDB**: Create a free cluster on MongoDB Atlas. Get the connection string.
2. **Redis**: Create a free Redis instance on Render or Redis Labs. Get the connection string.

### Option A: Render.com
1. Connect your GitHub repository.
2. Create a **Web Service** for the FastAPI app:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Create a **Background Worker** for Celery:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `celery -A celery_worker.celery worker --loglevel=info`

### Option B: Railway.app
1. Create a new project, deploy from GitHub, select the `/backend` folder.
2. Railway will use the `Procfile` automatically to spin up the web and worker processes.

## Required Backend Environment Variables

Add all of these exactly as written to your hosting provider's Secrets/Environment Variables tab:

```env
# Database
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/pathfinder?retryWrites=true&w=majority

# Cache & Message Broker (Celery)
REDIS_URL=redis://default:<password>@<redis-host>:<port>

# AI Engine
GEMINI_API_KEY=AIzaSyB...

# Security Auth
JWT_SECRET=YOUR_SUPER_SECRET_KEY_HERE
JWT_ALGORITHM=HS256

# Payments (If active)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_secret...
```

## 3. Finishing Touch
Once both are deployed, make sure the frontend's `VITE_API_URL` points to the live backend URL, and the backend's CORS settings in `main.py` allow the live Vercel frontend URL.
