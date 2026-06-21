# ⚙️ How to Run ParkOptima AI

To launch the complete ParkOptima AI system locally, you need to run both the FastAPI Edge Backend (which handles the Computer Vision and Database sync) and the Next.js Frontend (which serves the dashboard UI).

Follow these steps exactly. Open **two separate terminal windows**.

---

## 1. Start the Backend (Terminal 1)

The backend runs the YOLOv8 AI pipeline, connects to the Supabase database, and streams the MJPEG video feed to the frontend.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the Python Virtual Environment:
   ```bash
   # On Mac/Linux:
   source venv/bin/activate
   
   # On Windows:
   .\venv\Scripts\activate
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *You should see a message saying "Starting background CV thread..." and "Uvicorn running on http://127.0.0.1:8000".*

---

## 2. Start the Frontend (Terminal 2)

The frontend is the glassmorphic Command Center UI that the judges will interact with.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if this is your first time):
   ```bash
   npm install
   ```
3. Start the Next.js Development Server:
   ```bash
   npm run dev
   ```
   *The server will boot up on http://localhost:3000.*

---

## 3. Presenting the Demo

Once both servers are running:
1. Open your browser and navigate to **`http://localhost:3000`**.
2. **The Live Camera HUD** in the bottom right corner will automatically connect to the Backend's MJPEG stream and begin rendering the YOLOv8 detections.
3. Every 2 seconds, the backend will push the latest `illegal_cars_count` and `UMIS Score` to Supabase.
4. The Next.js frontend will automatically fetch this data, and you will see the **Dispatch Panel** and **Digital Twin Map** updating dynamically based on the live camera feed!

> **Troubleshooting Tip:** If the video stream doesn't load immediately, ensure your `backend` terminal is active and no errors were thrown regarding missing OpenCV libraries. The YOLOv8 model (`yolov8n.pt`) and sample video (`sample_traffic.mp4`) are already included in the backend folder.
