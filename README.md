# AI Learning Roadmap Generator

A full-stack application for generating and displaying personalized AI learning roadmaps.

## Architecture

This project is organized into two main parts:
- `backend/`: A Python-based FastAPI application that serves the API.
- `frontend/`: A React application built with Vite and styled with Tailwind CSS.

## Getting Started

### Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows: venv\Scripts\activate
   # On macOS/Linux: source venv/bin/activate
   ```
3. Install dependencies, assuming a `requirements.txt` is present:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   The backend will typically be available at `http://localhost:8000`.

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will typically be available at `http://localhost:5173`.

## Environment Variables

Make sure to set up the necessary `.env` files in both the `backend/` and `frontend/` directories if there are specific environment variables required by the application.
