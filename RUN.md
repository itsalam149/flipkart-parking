# ⚙️ How to Run ParkOptima AI

We have unified the boot process! You no longer need to open separate terminals.

## 1. Setup Environment
First, ensure you have set up your Supabase database.
Copy `example.env` to `backend/.env` and fill in your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 2. Install Dependencies
If this is your first time, install the frontend dependencies.
```bash
cd frontend
npm install
```

Make sure your backend Python virtual environment is set up and requirements installed:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 3. Run the Entire System
We use `concurrently` to run both the FastAPI Backend (Computer Vision & Database logic) and the Next.js Frontend (Command Center UI) with a single command!

Open a terminal and run:
```bash
cd frontend
npm run dev
```

That's it! Both servers will start simultaneously.

## 4. View the Dashboard
1. Open your browser and navigate to **`http://localhost:3000`**.
2. The Live Camera HUD in the bottom right corner will connect to the MJPEG stream.
3. Use the **CAM 1 / CAM 2 / CAM 3** toggles on the HUD to shift between simulated camera angles.
4. The system automatically pushes live violation data to Supabase, updating the Digital Twin Map and UMIS charts dynamically!
