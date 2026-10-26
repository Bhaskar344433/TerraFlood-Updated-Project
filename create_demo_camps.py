"""
create_demo_camps.py
====================
Standalone utility script for TerraFlood NGO Logistics Module (Tab 3).
Generates a realistic sample GeoJSON file ('demo_medical_camps.geojson') containing
5 humanitarian medical camps, trauma posts, and relief staging centers located
across Nepal's Terai flood corridor.

Usage:
    python create_demo_camps.py
"""

from pathlib import Path
import geopandas as gpd
from shapely.geometry import Point

def generate_demo_camps(output_path: Path = Path("demo_medical_camps.geojson")):
    # 5 Strategic humanitarian relief camps within the Nepal Terai AOI [84.0, 26.5, 87.5, 27.5]
    camps_data = [
        {
            "camp_id": "CAMP-001",
            "p_id": "IP-001",
            "name": "Koshi Flood Evacuation Camp (Koshi Corridor)",
            "facility_type": "Emergency Field Hospital",
            "organization": "Nepal Red Cross / WHO",
            "district": "Sunsari (Koshi Corridor)",
            "address": "Koshi Barrage High Staging Area, Sunsari",
            "capacity_beds": 120,
            "medical_staff": 18,
            "lat": 26.78,
            "lon": 87.08,
            "contact_channel": "VHF-Ch-16",
            "phone_helpline": "+977-25-520111",
        },
        {
            "camp_id": "CAMP-002",
            "p_id": "IP-002",
            "name": "Biratnagar Sub-Metropolitan Relief Station",
            "facility_type": "Mobile Trauma Clinic",
            "organization": "Doctors Without Borders (MSF)",
            "district": "Morang (Biratnagar)",
            "address": "Main Road Relief Complex, Ward 12, Biratnagar",
            "capacity_beds": 80,
            "medical_staff": 12,
            "lat": 26.48,
            "lon": 87.28,
            "contact_channel": "HF-8422kHz",
            "phone_helpline": "+977-21-460222",
        },
        {
            "camp_id": "CAMP-003",
            "p_id": "IP-003",
            "name": "Janakpur Primary Relief Post",
            "facility_type": "Maternal & Child Health Post",
            "organization": "UNICEF / Ministry of Health",
            "district": "Dhanusha (Janakpur)",
            "address": "Ramanand Chowk Community Center, Janakpur",
            "capacity_beds": 65,
            "medical_staff": 9,
            "lat": 26.71,
            "lon": 85.92,
            "contact_channel": "VHF-Ch-09",
            "phone_helpline": "+977-41-520333",
        },
        {
            "camp_id": "CAMP-004",
            "p_id": "IP-004",
            "name": "Kamalamai High-Ground Trauma Staging Point",
            "facility_type": "Air-Drop Logistics & Surgical Base",
            "organization": "Nepal Army Disaster Directorate",
            "district": "Sindhuli (Kamalamai)",
            "address": "Kamalamai High Ridge Ground, Sindhuli",
            "capacity_beds": 150,
            "medical_staff": 25,
            "lat": 27.22,
            "lon": 85.90,
            "contact_channel": "SAT-IRIDIUM-01",
            "phone_helpline": "+977-47-520444",
        },
        {
            "camp_id": "CAMP-005",
            "p_id": "IP-005",
            "name": "Chitwan Floodplain Medical Outpost",
            "facility_type": "Waterborne Rescue & First-Aid Post",
            "organization": "Armed Police Force (APF) Disaster Unit",
            "district": "Chitwan (Bharatpur)",
            "address": "Narayani Riverbank Elevated Staging, Bharatpur",
            "capacity_beds": 45,
            "medical_staff": 8,
            "lat": 27.35,
            "lon": 84.45,
            "contact_channel": "VHF-Ch-12",
            "phone_helpline": "+977-56-520555",
        },
    ]

    geometries = [Point(c["lon"], c["lat"]) for c in camps_data]
    gdf = gpd.GeoDataFrame(camps_data, geometry=geometries, crs="EPSG:4326")

    output_path = Path(output_path)
    gdf.to_file(output_path, driver="GeoJSON")
    print(f"[OK] Generated {len(gdf)} sample NGO medical camps at: {output_path.resolve()}")
    return output_path

if __name__ == "__main__":
    generate_demo_camps()
