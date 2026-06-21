def calculate_umis(
    lane_blockage_pct: float, 
    queue_length_meters: float, 
    speed_reduction_delta: float, 
    violation_duration_mins: float
) -> float:
    """
    Calculates the Urban Mobility Impact Score (UMIS) based on normalized inputs.
    Returns a score from 0 to 100.
    """
    
    # 1. Normalization (assuming max theoretical bounds for scaling to 0-100)
    # Lane Blockage: already a percentage, so max is 100
    norm_lane_blockage = min(lane_blockage_pct, 100.0)
    
    # Queue Length: assume 500 meters is max critical queue (score 100)
    norm_queue = min((queue_length_meters / 500.0) * 100.0, 100.0)
    
    # Speed Reduction Delta: assume 30 km/h drop is max critical (score 100)
    norm_speed_drop = min((speed_reduction_delta / 30.0) * 100.0, 100.0)
    
    # Violation Duration: assume 60 mins is max critical (score 100)
    norm_duration = min((violation_duration_mins / 60.0) * 100.0, 100.0)
    
    # 2. Weighting Formula (as defined in pitch)
    umis = (
        (0.35 * norm_lane_blockage) + 
        (0.30 * norm_queue) + 
        (0.20 * norm_speed_drop) + 
        (0.15 * norm_duration)
    )
    
    return round(umis, 2)
