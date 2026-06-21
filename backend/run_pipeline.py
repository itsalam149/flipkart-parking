import cv2
import time
import os
import numpy as np
from ultralytics import YOLO
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables for Supabase
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role for backend writing
if not SUPABASE_KEY:
    SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize YOLO model
print("Loading YOLOv8 model...")
model = YOLO("yolov8n.pt")

# Configuration
VIDEO_PATH = "sample_traffic.mp4"
CAMERA_NAME = "Live Camera - Outer Ring Road"
CAMERA_LAT = 12.9720
CAMERA_LNG = 77.5950
ILLEGAL_TIME_THRESHOLD_SEC = 0.2 # Flag instantly if they touch the restricted lane
PUSH_INTERVAL_SEC = 2.0 # Push to Supabase faster for the demo

# State trackers
tracked_vehicles = {} # {track_id: {"first_seen": timestamp, "last_seen": timestamp}}
last_push_time = time.time()

def point_in_polygon(point, polygon):
    """Ray casting algorithm to check if a point is inside a polygon."""
    x, y = point
    n = len(polygon)
    inside = False
    p1x, p1y = polygon[0]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

def calculate_umis(illegal_cars_count):
    """Calculate Urban Mobility Impact Score based on illegal cars."""
    # Base score of 20. Each illegal car adds 15 points. Max 99.9.
    score = 20.0 + (illegal_cars_count * 15.0)
    return min(99.9, score)

def push_to_supabase(illegal_cars_count):
    """Pushes the real-time data to Supabase hotspots table."""
    score = calculate_umis(illegal_cars_count)
    
    # We use an upsert based on location_name. If it doesn't exist, it creates it.
    # We'll first check if it exists to get the ID, else we insert without ID.
    try:
        data = {
            "location_name": CAMERA_NAME,
            "latitude": CAMERA_LAT,
            "longitude": CAMERA_LNG,
            "umis_score": score,
            "parked_cars_count": illegal_cars_count
        }
        
        # Check if exists
        existing = supabase.table("hotspots").select("id").eq("location_name", CAMERA_NAME).execute()
        if existing.data:
            data["id"] = existing.data[0]["id"]
            
        supabase.table("hotspots").upsert(data).execute()
        print(f"[Supabase Push] Sent {illegal_cars_count} illegal cars. UMIS: {score}")
    except Exception as e:
        print(f"[Supabase Error] Failed to push: {e}")

def main():
    global last_push_time
    
    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        print(f"Error: Could not open video {VIDEO_PATH}")
        print("Falling back to webcam (0)...")
        cap = cv2.VideoCapture(0)

    # Read first frame to get dimensions
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame.")
        return
        
    h, w = frame.shape[:2]
    
    # Define an illegal parking zone polygon (e.g., the rightmost lane)
    # This creates a massive trapezoid on the bottom half of the frame to catch almost all cars
    zone_polygon = [
        (int(w * 0.1), int(h * 0.5)),
        (int(w * 0.9), int(h * 0.5)),
        (int(w * 1.0), int(h * 1.0)),
        (int(w * 0.0), int(h * 1.0))
    ]
    np_zone = np.array(zone_polygon, np.int32)
    np_zone = np_zone.reshape((-1, 1, 2))

    print("Starting Live Computer Vision Pipeline...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            # Loop the video for the demo
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
            
        # Run YOLOv8 tracking, persist=True keeps IDs consistent across frames
        results = model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False)
        
        current_time = time.time()
        illegal_cars_count = 0
        
        # Draw the No Parking Zone
        cv2.polylines(frame, [np_zone], isClosed=True, color=(0, 0, 255), thickness=3)
        cv2.putText(frame, "RESTRICTED BUS LANE", (zone_polygon[0][0], zone_polygon[0][1] - 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            track_ids = results[0].boxes.id.cpu().numpy()
            classes = results[0].boxes.cls.cpu().numpy()
            
            for box, track_id, cls in zip(boxes, track_ids, classes):
                # Class 2 is 'car', 3 is 'motorcycle', 5 is 'bus', 7 is 'truck' in COCO dataset
                if int(cls) not in [2, 3, 5, 7]:
                    continue
                    
                x1, y1, x2, y2 = map(int, box)
                center_x = int((x1 + x2) / 2)
                center_y = int((y1 + y2) / 2)
                
                # Check if car center is inside the illegal zone
                is_inside = point_in_polygon((center_x, center_y), zone_polygon)
                
                if is_inside:
                    # Instantly flag as illegal for the high-action demo
                    box_color = (0, 0, 255) # Red for illegal
                    illegal_cars_count += 1
                    cv2.putText(frame, "VIOLATION!", (x1, y1 - 10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                        
                    cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 3)
                    cv2.circle(frame, (center_x, center_y), 5, box_color, -1)
                else:
                    # Draw green box for normal cars
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    
        # Cleanup old tracked vehicles that disappeared
        for tid in list(tracked_vehicles.keys()):
            if current_time - tracked_vehicles[tid]["last_seen"] > 2.0:
                del tracked_vehicles[tid]

        # Display dashboard stats on frame
        cv2.rectangle(frame, (10, 10), (400, 120), (0, 0, 0), -1)
        cv2.putText(frame, f"LIVE INTELLIGENCE FEED", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f"Illegal Parked Vehicles: {illegal_cars_count}", (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        cv2.putText(frame, f"Live UMIS Score: {calculate_umis(illegal_cars_count):.1f}", (20, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

        # Show the frame
        cv2.imshow("ParkOptima AI Camera Node", frame)
        
        # Push to Supabase every PUSH_INTERVAL_SEC
        if current_time - last_push_time > PUSH_INTERVAL_SEC:
            push_to_supabase(illegal_cars_count)
            last_push_time = current_time

        # Press 'q' to exit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
