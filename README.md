# 🏙️ ParkOptima AI

**ParkOptima AI** is a next-generation City Traffic Command Center built to autonomously detect, track, and dispatch enforcement teams to illegal parking zones using real-time Computer Vision and distributed edge computing.

Built for high-performance hackathons and scalable city infrastructure.

## 🚀 Core Features

- **Real-Time Edge AI (YOLOv8 + ByteTrack)**: A continuous Python-based Computer Vision pipeline that runs object detection and assigning persistent ID tracking on live camera feeds.
- **Dynamic Violation Engine**: Uses Point-in-Polygon geometric mathematics to instantly detect when a vehicle breaches a "Restricted Bus Lane" or "No Parking Zone".
- **MJPEG Video Streaming**: Bypasses native desktop windows by actively encoding the annotated AI feed into an HTTP multipart stream, broadcasting the live video feed directly into the web dashboard.
- **Urban Mobility Impact Score (UMIS)**: A custom algorithm that calculates the severity of traffic congestion and automatically pushes the intelligence data to a cloud database.
- **Digital Twin Dispatch Center**: A Next.js glassmorphic UI featuring a 3D Mapbox instance and an AI-driven Dispatch Panel that automatically allocates response teams based on UMIS priority.

## 🏗️ Architecture Stack

### Frontend (Command Center)
- **Framework**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS (Glassmorphism & Micro-animations)
- **Mapping**: Mapbox GL JS / React Map GL
- **Icons**: Lucide React

### Backend (Edge Node & API)
- **API Server**: FastAPI (High-performance async Python server)
- **Computer Vision**: Ultralytics YOLOv8, OpenCV (cv2)
- **Concurrency**: Native Python Threading (for non-blocking MJPEG streaming)
- **Database Integration**: Supabase (PostgreSQL with Realtime REST APIs)

## 📸 The Dashboard
The Command Center features three primary sectors:
1. **The Digital Twin Map**: A dark-mode 3D map dynamically plotting critical zones.
2. **The Deployment Panel**: A real-time updating list of active dispatch teams assigned to the most critical zones.
3. **The Live Camera HUD**: A floating glassmorphic window directly streaming the YOLOv8 AI pipeline doing its magic.

## 🛠️ Setup & Execution
Please refer to the [RUN.md](RUN.md) file for complete step-by-step instructions on how to boot up both the Edge Backend and the Next.js Frontend.
