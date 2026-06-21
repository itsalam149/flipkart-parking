import cv2
import time
import threading
import numpy as np
from ultralytics import YOLO
import os
from dotenv import load_dotenv
from supabase import create_client, Client

class CameraNode:
    def __init__(self, video_path="sample_traffic.mp4"):
        self.video_path = video_path
        self.model = None
        self.cap = None
        self.is_running = False
        self.thread = None
        
        # We will store the latest processed frame here
        self.latest_frame = None
        self.lock = threading.Lock()
        
        # Supabase Setup
        load_dotenv()
        self.supabase = None
        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        if url and key:
            self.supabase = create_client(url, key)
            
        self.camera_name = "Live Camera - Outer Ring Road"
        self.camera_lat = 12.9720
        self.camera_lng = 77.5950
        self.push_interval_sec = 2.0
        self.last_push_time = time.time()

    def _point_in_polygon(self, point, polygon):
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

    def _calculate_umis(self, illegal_cars_count):
        score = 20.0 + (illegal_cars_count * 15.0)
        return min(99.9, score)

    def _push_to_supabase(self, illegal_cars_count):
        if not self.supabase:
            return
            
        score = self._calculate_umis(illegal_cars_count)
        try:
            data = {
                "location_name": self.camera_name,
                "latitude": self.camera_lat,
                "longitude": self.camera_lng,
                "umis_score": score,
                "parked_cars_count": illegal_cars_count
            }
            existing = self.supabase.table("hotspots").select("id").eq("location_name", self.camera_name).execute()
            if existing.data:
                data["id"] = existing.data[0]["id"]
            self.supabase.table("hotspots").upsert(data).execute()
        except Exception as e:
            print(f"[Supabase Error] {e}")

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.is_running = False
        if self.thread:
            self.thread.join()

    def get_latest_frame_jpeg(self):
        """Returns the latest frame encoded as JPEG bytes."""
        with self.lock:
            if self.latest_frame is None:
                return None
            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', self.latest_frame)
            if not ret:
                return None
            return buffer.tobytes()

    def _run_loop(self):
        print("Loading YOLOv8 model for background thread...")
        self.model = YOLO("yolov8n.pt")
        
        self.cap = cv2.VideoCapture(self.video_path)
        if not self.cap.isOpened():
            print(f"Error: Could not open {self.video_path}, falling back to 0")
            self.cap = cv2.VideoCapture(0)
            
        ret, frame = self.cap.read()
        if not ret:
            return
            
        h, w = frame.shape[:2]
        zone_polygon = [
            (int(w * 0.1), int(h * 0.5)),
            (int(w * 0.9), int(h * 0.5)),
            (int(w * 1.0), int(h * 1.0)),
            (int(w * 0.0), int(h * 1.0))
        ]
        np_zone = np.array(zone_polygon, np.int32).reshape((-1, 1, 2))

        while self.is_running:
            ret, frame = self.cap.read()
            if not ret:
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
                
            results = self.model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False)
            current_time = time.time()
            illegal_cars_count = 0
            
            cv2.polylines(frame, [np_zone], isClosed=True, color=(0, 0, 255), thickness=3)
            cv2.putText(frame, "RESTRICTED BUS LANE", (zone_polygon[0][0], zone_polygon[0][1] - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

            if results[0].boxes.id is not None:
                boxes = results[0].boxes.xyxy.cpu().numpy()
                classes = results[0].boxes.cls.cpu().numpy()
                
                for box, cls in zip(boxes, classes):
                    if int(cls) not in [2, 3, 5, 7]:
                        continue
                        
                    x1, y1, x2, y2 = map(int, box)
                    center_x, center_y = int((x1 + x2) / 2), int((y1 + y2) / 2)
                    is_inside = self._point_in_polygon((center_x, center_y), zone_polygon)
                    
                    if is_inside:
                        box_color = (0, 0, 255)
                        illegal_cars_count += 1
                        cv2.putText(frame, "VIOLATION!", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                    else:
                        box_color = (0, 255, 0)
                        
                    cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)
                    cv2.circle(frame, (center_x, center_y), 4, box_color, -1)

            cv2.rectangle(frame, (10, 10), (400, 120), (0, 0, 0), -1)
            cv2.putText(frame, f"LIVE INTELLIGENCE FEED", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Violations Detected: {illegal_cars_count}", (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            cv2.putText(frame, f"Live UMIS Score: {self._calculate_umis(illegal_cars_count):.1f}", (20, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

            # Update the global frame safely
            with self.lock:
                self.latest_frame = frame.copy()

            if current_time - self.last_push_time > self.push_interval_sec:
                self._push_to_supabase(illegal_cars_count)
                self.last_push_time = current_time

            # Small sleep to prevent maxing out CPU
            time.sleep(0.03)

        self.cap.release()

# Global singleton instance
camera_node = CameraNode()
