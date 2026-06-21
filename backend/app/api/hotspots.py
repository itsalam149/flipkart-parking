from fastapi import APIRouter, HTTPException
from typing import List
from ..models import database
from pydantic import BaseModel

router = APIRouter()

# Pydantic Schemas
class HotspotResponse(BaseModel):
    id: int
    location_name: str
    latitude: float
    longitude: float
    umis_score: float
    parked_cars_count: int

@router.get("/", response_model=List[HotspotResponse])
def get_all_hotspots():
    """Fetch all critical hotspots to display on the Command Center Map from Supabase"""
    if not database.supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
        
    response = database.supabase.table("hotspots").select("*").order("umis_score", desc=True).execute()
    return response.data

@router.post("/seed")
def seed_mock_data():
    """A helper endpoint to seed mock hotspots for the demo into Supabase"""
    if not database.supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
        
    mock_data = [
        {"location_name": "Metro Gate 2", "latitude": 12.9716, "longitude": 77.5946, "umis_score": 85.0, "parked_cars_count": 12},
        {"location_name": "Market Road", "latitude": 12.9750, "longitude": 77.5910, "umis_score": 72.5, "parked_cars_count": 8},
        {"location_name": "Stadium Exit", "latitude": 12.9680, "longitude": 77.5850, "umis_score": 91.2, "parked_cars_count": 15},
        {"location_name": "Tech Park North", "latitude": 12.9810, "longitude": 77.6010, "umis_score": 88.4, "parked_cars_count": 22},
        {"location_name": "Hospital Entrance", "latitude": 12.9620, "longitude": 77.5980, "umis_score": 95.5, "parked_cars_count": 14},
        {"location_name": "Mall Junction", "latitude": 12.9780, "longitude": 77.5800, "umis_score": 64.0, "parked_cars_count": 5},
        {"location_name": "School Zone A", "latitude": 12.9650, "longitude": 77.5900, "umis_score": 82.1, "parked_cars_count": 9},
        {"location_name": "Railway Station", "latitude": 12.9770, "longitude": 77.5700, "umis_score": 93.0, "parked_cars_count": 18},
        {"location_name": "Bus Terminal", "latitude": 12.9730, "longitude": 77.5750, "umis_score": 78.5, "parked_cars_count": 11},
        {"location_name": "Airport Road Link", "latitude": 12.9850, "longitude": 77.6150, "umis_score": 89.9, "parked_cars_count": 25},
        {"location_name": "Commercial St East", "latitude": 12.9820, "longitude": 77.6080, "umis_score": 76.2, "parked_cars_count": 7},
        {"location_name": "Brigade Road X", "latitude": 12.9710, "longitude": 77.6060, "umis_score": 81.5, "parked_cars_count": 10},
    ]
    
    # Simple upset logic: delete existing mock data then insert fresh ones
    # (Since we lack a unique constraint on location_name to do upsert natively easily without schema access)
    try:
        for item in mock_data:
            # Check if it exists
            existing = database.supabase.table("hotspots").select("*").eq("location_name", item["location_name"]).execute()
            if not existing.data:
                database.supabase.table("hotspots").insert(item).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {"message": "Mock data seeded into Supabase"}
