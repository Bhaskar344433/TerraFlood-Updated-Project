"""
TerraFlood Public API & Citizen Dispatch Backend
================================================
FastAPI server serving live flood telemetry, assessed relief camps,
severed & safe road vectors, official emergency helplines,
and real-time Citizen SOS Distress reporting.
"""

import os
import sys
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Ensure project root is on sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from terraflood import config

app = FastAPI(
    title="TerraFlood Citizen & Relief API",
    description="High-speed REST API providing real-time flood extent telemetry, medical camp statuses, and citizen SOS dispatch for Nepal's Terai corridor.",
    version="2.0.0",
)

# Enable CORS for React frontend (Vite dev server and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SOS_DATA_FILE = root_dir / "api" / "sos_reports.json"
SOS_DATA_FILE.parent.mkdir(parents=True, exist_ok=True)


class SOSRequest(BaseModel):
    name: str = Field(..., description="Name of citizen or reporting contact")
    phone: str = Field(..., description="Phone number for rescue callback")
    district: str = Field(..., description="District e.g. Sunsari, Morang, Dhanusha, Chitwan")
    location_name: str = Field(..., description="Village, ward, or prominent landmark")
    lat: Optional[float] = Field(None, description="GPS Latitude if available")
    lon: Optional[float] = Field(None, description="GPS Longitude if available")
    people_count: int = Field(1, ge=1, description="Number of stranded or affected individuals")
    emergency_type: str = Field(..., description="Medical, Water/Food, Stranded on Roof, Elderly/Infant")
    notes: Optional[str] = Field("", description="Critical notes e.g. rising water level, pregnant woman")


def _load_sos_reports() -> List[Dict[str, Any]]:
    if not SOS_DATA_FILE.exists():
        # Pre-seed with 2 realistic demo distress alerts in the Terai region
        demo_reports = [
            {
                "id": "SOS-101",
                "name": "Ram Bahadur Thapa",
                "phone": "+977-9842011223",
                "district": "Sunsari (Koshi Corridor)",
                "location_name": "Prakashpur Ward 4, near Koshi Embankment",
                "lat": 26.74,
                "lon": 87.05,
                "people_count": 6,
                "emergency_type": "Stranded on Roof",
                "notes": "Floodwaters reached 4 feet; elderly grandmother needs immediate boat extraction.",
                "status": "DISPATCH_ASSIGNED",
                "timestamp": "2026-10-24 07:15:00 UTC",
            },
            {
                "id": "SOS-102",
                "name": "Sunita Kumari Sah",
                "phone": "+977-9819234567",
                "district": "Dhanusha (Janakpur)",
                "location_name": "Loharpatti Village, Ward 2",
                "lat": 26.68,
                "lon": 85.95,
                "people_count": 4,
                "emergency_type": "Medical / Clean Water",
                "notes": "Infant suffering from acute dehydration; drinking water wells submerged.",
                "status": "PENDING_VERIFICATION",
                "timestamp": "2026-10-24 08:30:00 UTC",
            },
        ]
        with open(SOS_DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(demo_reports, f, indent=2)
        return demo_reports

    try:
        with open(SOS_DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _save_sos_reports(reports: List[Dict[str, Any]]):
    with open(SOS_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(reports, f, indent=2)


@app.get("/api/health")
def get_health():
    return {
        "status": "OPERATIONAL",
        "service": "TerraFlood Live Disaster API",
        "region": "Nepal Terai Flood Corridor",
        "server_time": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
    }


@app.get("/api/metrics")
def get_metrics():
    """Returns top disaster impact indicators & relief stats."""
    ranking_csv = config.EXPORTS_DIR / "terraflood_settlements_ranking.csv"
    displaced_pop = 13580
    flooded_km2 = 28.4
    severed_roads_km = 42.1
    damage_crores = 21.05
    impacted_settlements = 24

    if ranking_csv.exists():
        try:
            import pandas as pd
            df = pd.read_csv(ranking_csv)
            if not df.empty and "Displaced Population" in df.columns:
                displaced_pop = int(df["Displaced Population"].sum())
                impacted_settlements = len(df)
        except Exception:
            pass

    camps_file = root_dir / "demo_medical_camps.geojson"
    total_beds = 460
    total_staff = 72
    safe_camps = 5
    flooded_camps = 0

    if camps_file.exists():
        try:
            with open(camps_file, "r", encoding="utf-8") as f:
                c_data = json.load(f)
                features = c_data.get("features", [])
                safe_camps = len(features)
                total_beds = sum(f["properties"].get("capacity_beds", 0) for f in features)
                total_staff = sum(f["properties"].get("medical_staff", 0) for f in features)
        except Exception:
            pass

    return {
        "inundated_km2": flooded_km2,
        "displaced_population": displaced_pop,
        "severed_roads_km": severed_roads_km,
        "estimated_damage_crores": damage_crores,
        "impacted_settlements_count": impacted_settlements,
        "active_safe_camps": safe_camps,
        "flooded_camps": flooded_camps,
        "total_available_beds": total_beds,
        "on_duty_medical_personnel": total_staff,
        "last_radar_scan": "Sentinel-1 SAR C-Band Synthetic Aperture",
    }


@app.get("/api/camps")
def get_relief_camps():
    """Returns all verified medical & relief camps in GeoJSON format."""
    camps_file = root_dir / "demo_medical_camps.geojson"
    if not camps_file.exists():
        raise HTTPException(status_code=404, detail="Relief camps data not found")

    with open(camps_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Enhance properties with statuses if not set
    for feat in data.get("features", []):
        props = feat.setdefault("properties", {})
        if "status" not in props:
            props["status"] = "OPERATIONAL / SECURE"
        if "priority_action" not in props:
            props["priority_action"] = "ACTIVE: Safe Supply Hub & Staging Area"
        if "phone_helpline" not in props:
            props["phone_helpline"] = "+977-1155"

    return data


@app.get("/api/flood-extent")
def get_flood_extent():
    """Returns the multi-temporal SAR inundation footprint GeoJSON."""
    extent_file = config.EXPORTS_DIR / "terraflood_extent.geojson"
    if not extent_file.exists():
        # Return fallback empty FeatureCollection
        return {"type": "FeatureCollection", "features": []}

    with open(extent_file, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/severed-roads")
def get_severed_roads():
    """Returns cut-off / submerged highway corridors."""
    roads_file = config.EXPORTS_DIR / "terraflood_severed_roads.geojson"
    if not roads_file.exists():
        return {"type": "FeatureCollection", "features": []}

    with open(roads_file, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/helplines")
def get_emergency_helplines():
    """Returns official Nepal disaster hotlines."""
    return [
        {
            "service": "Flood Early Warning (जल तथा मौसम पूर्वसूचना)",
            "number": "1155",
            "type": "Toll-Free",
            "hours": "24/7 Hours Active",
            "description": "Real-time river gauge levels, dam overflows & flash flood alerts",
            "agency": "Department of Hydrology and Meteorology (DHM)",
            "theme": "red",
        },
        {
            "service": "National Emergency Operations Centre (NEOC)",
            "number": "1149",
            "type": "Toll-Free",
            "hours": "24/7 Command Center",
            "description": "Direct army/police boat rescue dispatch & airlift requests",
            "agency": "Ministry of Home Affairs (MoHA)",
            "theme": "amber",
        },
        {
            "service": "National Ambulance Network (एम्बुलेन्स सेवा)",
            "number": "102",
            "type": "Emergency Toll-Free",
            "hours": "24/7 Rapid Response",
            "description": "Emergency medical transit and trauma evacuation",
            "agency": "Nepal Red Cross / Ministry of Health",
            "theme": "cyan",
        },
        {
            "service": "Nepal Police Disaster Rescue (प्रहरी उद्धार)",
            "number": "100",
            "type": "Emergency Toll-Free",
            "hours": "24/7 Immediate",
            "description": "Ground security, cordon establishment & swift water extraction",
            "agency": "Nepal Police Disaster Management Division",
            "theme": "blue",
        },
        {
            "service": "Nepal Red Cross Society (नेपाल रेडक्रस)",
            "number": "1130",
            "type": "Relief Helpline",
            "hours": "24/7 Humanitarian Hub",
            "description": "Emergency dry rations, water purification kits, hygiene packs & tarpaulins",
            "agency": "Nepal Red Cross Society (NRCS)",
            "theme": "green",
        },
    ]


@app.get("/api/prediction")
def get_flood_prediction(
    horizon: int = 48,
    rain: float = 180.0,
    discharge: float = 40.0,
    saturation: float = 85.0,
):
    """
    Returns AI flood forecast KPIs, future affected settlements directory,
    and 72-hour river basin hydrographs for authorities.
    """
    from terraflood import prediction, impact
    import geopandas as gpd

    extent_file = config.EXPORTS_DIR / "terraflood_extent.geojson"
    if not extent_file.exists():
        extent_file = config.DUMMY_FLOOD_GEOJSON_PATH

    flood_gdf = gpd.read_file(extent_file) if extent_file.exists() else None
    try:
        admin_gdf = impact.VectorDataLoader.load_admin_boundaries()
    except Exception:
        admin_gdf = None

    proj_gdf, future_df, kpis, hydro_df = prediction.simulate_future_flood(
        current_flood_gdf=flood_gdf,
        admin_gdf=admin_gdf,
        horizon_hours=horizon,
        rainfall_mm_24h=rain,
        river_discharge_pct=discharge,
        soil_saturation_pct=saturation,
    )
    return {
        "kpis": kpis,
        "threatened_settlements": future_df.to_dict(orient="records"),
        "hydrographs": hydro_df.to_dict(orient="records"),
    }


@app.get("/api/sos")
def list_sos_reports():
    """Returns list of active citizen SOS distress signals."""
    return _load_sos_reports()


@app.post("/api/sos", status_code=status.HTTP_201_CREATED)
def submit_sos_report(req: SOSRequest):
    """Allows stranded citizens to broadcast an emergency distress signal."""
    reports = _load_sos_reports()
    new_report = {
        "id": f"SOS-{len(reports) + 101}",
        "name": req.name.strip(),
        "phone": req.phone.strip(),
        "district": req.district.strip(),
        "location_name": req.location_name.strip(),
        "lat": req.lat,
        "lon": req.lon,
        "people_count": req.people_count,
        "emergency_type": req.emergency_type.strip(),
        "notes": req.notes.strip(),
        "status": "DISPATCH_PENDING",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
    }
    reports.insert(0, new_report)
    _save_sos_reports(reports)
    return {
        "success": True,
        "message": "🚨 SOS Alert broadcasted to TerraFlood Emergency Rescue Command!",
        "report": new_report,
    }


@app.get("/api/sitrep-pdf")
def download_sitrep_pdf():
    """Downloads the official TerraFlood Executive SitRep PDF."""
    pdf_path = config.EXPORTS_DIR / "TerraFlood_SitRep_Terai.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="SitRep PDF not yet generated by command center.")
    return FileResponse(
        path=str(pdf_path),
        filename="TerraFlood_Disaster_SitRep.pdf",
        media_type="application/pdf",
    )


# Mount static citizen web portal at root (after all /api/ routes)
web_dir = root_dir / "web"
if web_dir.exists():
    app.mount("/", StaticFiles(directory=str(web_dir), html=True), name="web")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
