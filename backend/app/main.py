from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import hotspots, stream
from .cv.camera_node import camera_manager

app = FastAPI(title="ParkOptima AI Engine", version="1.0.0")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start the background CV pipeline thread when FastAPI starts
@app.on_event("startup")
def startup_event():
    print("Starting background CV threads...")
    camera_manager.start_all()

@app.on_event("shutdown")
def shutdown_event():
    camera_manager.stop_all()

@app.get("/")
def read_root():
    return {"message": "ParkOptima AI Engine is running with Supabase."}

app.include_router(hotspots.router, prefix="/api/hotspots", tags=["Hotspots"])
app.include_router(stream.router, prefix="/api/stream", tags=["stream"])
