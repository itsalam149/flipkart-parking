import cv2
import time
import threading
import numpy as np
from ultralytics import YOLO
import os
from dotenv import load_dotenv
from supabase import create_client, Client

class CameraEngine:
    def __init__(self, video_path="sample_traffic.mp4"):
        self.video_path = video_path
        self.model = None
        self.cap = None
        self.is_running = False
        self.thread = None
        
        self.latest_raw_frame = None
        self.latest_results = None
        self.lock = threading.Lock()
        
        load_dotenv()
        self.supabase = None
        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        if url and key:
            self.supabase = create_client(url, key)
            
        self.push_interval_sec = 2.0
        self.last_push_time = time.time()
        
        # Camera Definitions
        self.cameras = {
            1: {"name": "Outer Ring Road", "lat": 12.9720, "lng": 77.5950, "transform": "normal"},
            2: {"name": "Metro Station Gate", "lat": 12.9716, "lng": 77.5946, "transform": "flip"},
            3: {"name": "Tech Park Exit", "lat": 12.9810, "lng": 77.6010, "transform": "gray"}
        }

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

    def _calculate_umis(self, count):
        return min(99.9, 20.0 + (count * 15.0))

    def _push_to_supabase(self, cam_id, count):
        if not self.supabase: return
        cam = self.cameras[cam_id]
        score = self._calculate_umis(count)
        try:
            data = {
                "location_name": cam["name"],
                "latitude": cam["lat"],
                "longitude": cam["lng"],
                "umis_score": score,
                "parked_cars_count": count
            }
            existing = self.supabase.table("hotspots").select("id").eq("location_name", cam["name"]).execute()
            if existing.data:
                data["id"] = existing.data[0]["id"]
            self.supabase.table("hotspots").upsert(data).execute()
        except Exception:
            pass

    def start_all(self):
        if self.is_running: return
        self.is_running = True
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()

    def stop_all(self):
        self.is_running = False
        if self.thread:
            self.thread.join()

    def get_latest_frame_jpeg(self, camera_id):
        # Process the raw frame on-demand for the specific camera to save massive CPU
        with self.lock:
            if self.latest_raw_frame is None or self.latest_results is None:
                return None
            frame = self.latest_raw_frame.copy()
            results = self.latest_results

        h, w = frame.shape[:2]
        cam = self.cameras.get(camera_id, self.cameras[1])
        transform = cam["transform"]

        # 1. Apply Base Transformation
        if transform == "flip":
            frame = cv2.flip(frame, 1)
        elif transform == "gray":
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)

        # 2. Define Polygon
        if transform == "flip":
            zone_polygon = [(int(w * 0.2), int(h * 0.2)), (int(w * 0.8), int(h * 0.2)),
                            (int(w * 1.0), int(h * 1.0)), (int(w * 0.0), int(h * 1.0))]
        else:
            zone_polygon = [(int(w * 0.1), int(h * 0.5)), (int(w * 0.9), int(h * 0.5)),
                            (int(w * 1.0), int(h * 1.0)), (int(w * 0.0), int(h * 1.0))]
            
        np_zone = np.array(zone_polygon, np.int32).reshape((-1, 1, 2))
        
        cv2.polylines(frame, [np_zone], isClosed=True, color=(0, 0, 255), thickness=3)
        label = "RESTRICTED LANE (VIOLATION)" if transform == "flip" else "RESTRICTED BUS LANE"
        cv2.putText(frame, label, (zone_polygon[0][0], max(30, zone_polygon[0][1] - 10)), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # 3. Draw Bounding Boxes
        illegal_cars_count = 0
        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            classes = results[0].boxes.cls.cpu().numpy()
            
            for box, cls in zip(boxes, classes):
                if int(cls) not in [2, 3, 5, 7]: continue
                
                # Adjust box coordinates if flipped
                x1, y1, x2, y2 = map(int, box)
                if transform == "flip":
                    x1, x2 = w - x2, w - x1

                center_x, center_y = int((x1 + x2) / 2), int((y1 + y2) / 2)
                is_inside = self._point_in_polygon((center_x, center_y), zone_polygon)
                
                if is_inside:
                    box_color = (0, 0, 255)
                    illegal_cars_count += 1
                    cv2.putText(frame, "VIOLATION!", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                else:
                    box_color = (0, 255, 0)
                    
                cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)

        # 4. Draw HUD
        cv2.rectangle(frame, (10, 10), (450, 120), (0, 0, 0), -1)
        cv2.putText(frame, f"CAM {camera_id} - {cam['name'].upper()}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f"Violations Detected: {illegal_cars_count}", (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        cv2.putText(frame, f"Live UMIS Score: {self._calculate_umis(illegal_cars_count):.1f}", (20, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

        # Periodically Push to Supabase for THIS camera only when viewed (to save DB calls)
        current_time = time.time()
        if current_time - self.last_push_time > self.push_interval_sec:
            # We push for all cameras to keep map updated, but simulate counts for others if needed
            # Actually, just push the current camera's count, and let others use default
            self._push_to_supabase(camera_id, illegal_cars_count)
            self.last_push_time = current_time

        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        if not ret: return None
        return buffer.tobytes()

    def _run_loop(self):
        print("Loading SINGLE YOLOv8 model to save CPU...")
        self.model = YOLO("yolov8n.pt")
        self.cap = cv2.VideoCapture(self.video_path)
        if not self.cap.isOpened():
            self.cap = cv2.VideoCapture(0)

        while self.is_running:
            ret, frame = self.cap.read()
            if not ret:
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
                
            results = self.model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False)

            with self.lock:
                self.latest_raw_frame = frame
                self.latest_results = results

            # Sleep longer to reduce CPU load (15 FPS processing is enough for demo)
            time.sleep(0.06)

        self.cap.release()

camera_manager = CameraEngine()
