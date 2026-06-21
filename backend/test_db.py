from app.models import database
print(database.supabase.table("hotspots").select("*").execute())
