from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import time
from ..cv.camera_node import camera_node

router = APIRouter()

def generate_frames():
    """Generator function that yields JPEG frames as a multipart MJPEG stream."""
    while True:
        frame_bytes = camera_node.get_latest_frame_jpeg()
        if frame_bytes is None:
            time.sleep(0.1)
            continue
            
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        # Limit to ~30 FPS
        time.sleep(1/30.0)

@router.get("/video")
def video_feed():
    """Returns a continuous MJPEG stream for the frontend `<img src="..."/>` tag."""
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")
