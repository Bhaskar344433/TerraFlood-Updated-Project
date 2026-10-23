"""
TerraFlood Impact & Spatial Intersection Engine (Upgraded)
=========================================================
Performs high-performance vectorization, spatial overlays, road network
clipping, settlement exposure quantification, and GHSL zonal population
displacement accounting for Nepal's Terai corridor.

Upgraded Features:
- RAM Caching: @st.cache_data wrapped shapefile ingestion prevents repeated reading of 3.11GB data.
- Safe Supply Routing: Calculates inverse un-flooded road corridors (bright green) for relief logistics.
- Economic Damage Modeling: Multiplies severed road kilometers by Rs 50,000,000/km (50 Lakhs/km).
- NGO Custom Spatial File Uploader: Ingests uploaded GeoJSON/shapefiles and classifies medical camps.
"""

import os
import io
import tempfile
import zipfile
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List, Union

import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import shape, MultiPolygon, Polygon, Point
import rasterio
from rasterio.features import shapes
from rasterio.mask import mask

try:
    import streamlit as st
    cache_data_fn = st.cache_data
except Exception:
    def cache_data_fn(*args, **kwargs):
        def decorator(f):
            return f
        return decorator

from . import config

# Configure logging
logger = logging.getLogger("terraflood.impact")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [TerraFlood Impact] %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class VectorDataLoader:
    """Efficiently loads and spatially clips local OSM roads and HDX admin shapefiles with RAM caching."""

    @staticmethod
    @cache_data_fn(show_spinner=False)
    def load_admin_boundaries(
        aoi_coords: Tuple[float, float, float, float] = tuple(config.AOI_COORDINATES),
        shp_path_str: Optional[str] = None,
    ) -> gpd.GeoDataFrame:
        """Loads and crops HDX MoFALD Village/District administrative shapefile with RAM caching."""
        path = Path(shp_path_str) if shp_path_str else config.ADMIN_SHP_PATH
        if not path.exists():
            raise FileNotFoundError(f"Administrative boundaries shapefile not found at: {path}")

        min_lon, min_lat, max_lon, max_lat = aoi_coords
        logger.info(f"Loading administrative boundaries from {path} with bbox filter {aoi_coords}...")

        # Read using bounding box for fast indexing
        gdf = gpd.read_file(path, bbox=(min_lon, min_lat, max_lon, max_lat))
        if gdf.crs is None:
            gdf = gdf.set_crs(config.GEOGRAPHIC_CRS)
        elif gdf.crs.to_string() != config.GEOGRAPHIC_CRS:
            gdf = gdf.to_crs(config.GEOGRAPHIC_CRS)

        # Uniform column naming
        col_rename = {}
        if "HRRP_VNAME" in gdf.columns:
            col_rename["HRRP_VNAME"] = "settlement"
        elif "NAME" in gdf.columns:
            col_rename["NAME"] = "settlement"
        else:
            gdf["settlement"] = "Settlement_" + gdf.index.astype(str)

        if "HRRP_DNAME" in gdf.columns:
            col_rename["HRRP_DNAME"] = "district"
        elif "DISTRICT" in gdf.columns:
            col_rename["DISTRICT"] = "district"
        else:
            gdf["district"] = "Terai"

        if col_rename:
            gdf = gdf.rename(columns=col_rename)

        # Standardize total area in km²
        if "Sq_km" in gdf.columns:
            gdf["total_area_km2"] = pd.to_numeric(gdf["Sq_km"], errors="coerce")
        else:
            gdf_proj = gdf.to_crs(config.METRIC_CRS)
            gdf["total_area_km2"] = gdf_proj.geometry.area / 1e6

        logger.info(f"Loaded {len(gdf)} administrative units within AOI into cached RAM.")
        return gdf

    @staticmethod
    @cache_data_fn(show_spinner=False)
    def load_osm_roads(
        aoi_coords: Tuple[float, float, float, float] = tuple(config.AOI_COORDINATES),
        shp_path_str: Optional[str] = None,
    ) -> gpd.GeoDataFrame:
        """Loads and crops OpenStreetMap road network lines within AOI with RAM caching."""
        path = Path(shp_path_str) if shp_path_str else config.ROADS_SHP_PATH
        if not path.exists():
            raise FileNotFoundError(f"OSM roads shapefile not found at: {path}")

        min_lon, min_lat, max_lon, max_lat = aoi_coords
        logger.info(f"Loading road network from {path} with bbox filter {aoi_coords}...")

        gdf = gpd.read_file(path, bbox=(min_lon, min_lat, max_lon, max_lat))
        if gdf.crs is None:
            gdf = gdf.set_crs(config.GEOGRAPHIC_CRS)
        elif gdf.crs.to_string() != config.GEOGRAPHIC_CRS:
            gdf = gdf.to_crs(config.GEOGRAPHIC_CRS)

        if "highway" not in gdf.columns:
            gdf["highway"] = "unclassified"
        else:
            gdf["highway"] = gdf["highway"].fillna("unclassified")

        if "name" not in gdf.columns:
            gdf["name"] = "Unnamed Route"
        else:
            gdf["name"] = gdf["name"].fillna("Unnamed Route")

        logger.info(f"Loaded {len(gdf)} road segments within AOI into cached RAM.")
        return gdf


class ImpactEngine:
    """Executes spatial overlays, road severance, un-flooded safe routes, and population displacement."""

    @staticmethod
    def polygonize_raster(
        raster_path: Path,
        min_area_km2: float = config.MIN_FLOOD_POLYGON_AREA_SQKM,
    ) -> gpd.GeoDataFrame:
        """Converts clean binary flood mask GeoTIFF into vectorized polygon GeoDataFrame."""
        if not raster_path.exists():
            raise FileNotFoundError(f"Flood raster not found at: {raster_path}")

        logger.info(f"Polygonizing flood mask: {raster_path}")
        with rasterio.open(raster_path) as src:
            image = src.read(1)
            transform = src.transform
            crs = src.crs or config.GEOGRAPHIC_CRS

            mask_arr = image == 1
            shape_gen = shapes(image, mask=mask_arr, transform=transform)

            polygon_list = []
            for geom, val in shape_gen:
                if val == 1:
                    poly = shape(geom)
                    if poly.is_valid and not poly.is_empty:
                        polygon_list.append(poly)

        if not polygon_list:
            logger.warning("No flood polygons detected in raster.")
            return gpd.GeoDataFrame(
                {"flood_id": [], "area_km2": []},
                geometry=[],
                crs=crs,
            )

        gdf = gpd.GeoDataFrame({"geometry": polygon_list}, crs=crs)
        gdf["flood_id"] = range(1, len(gdf) + 1)

        # Calculate exact area in km² using metric projection
        gdf_proj = gdf.to_crs(config.METRIC_CRS)
        gdf["area_km2"] = gdf_proj.geometry.area / 1e6

        clean_gdf = gdf[gdf["area_km2"] >= min_area_km2].copy()
        clean_gdf = clean_gdf.reset_index(drop=True)
        clean_gdf["flood_id"] = range(1, len(clean_gdf) + 1)

        logger.info(
            f"Polygonized {len(clean_gdf)} flood polygons (Total Area: {clean_gdf['area_km2'].sum():.2f} km²)."
        )
        return clean_gdf

    @staticmethod
    def calculate_displaced_population(
        flood_gdf: gpd.GeoDataFrame,
        population_raster_path: Path,
    ) -> Tuple[int, np.ndarray, rasterio.Affine]:
        """Calculates Total Displaced Population by summing GHSL population within flooded polygons."""
        if not population_raster_path.exists() or flood_gdf.empty:
            return 0, np.array([]), None

        logger.info(f"Extracting GHSL population displacement from: {population_raster_path}")
        with rasterio.open(population_raster_path) as src:
            geometries = [geom for geom in flood_gdf.geometry if geom.is_valid and not geom.is_empty]
            if not geometries:
                return 0, np.array([]), src.transform

            out_image, out_transform = mask(src, geometries, crop=False, filled=False)
            valid_pixels = out_image[0]
            valid_mask = (valid_pixels > 0) & (valid_pixels != src.nodata)
            total_displaced = int(np.round(np.sum(valid_pixels[valid_mask])))

        logger.info(f"Total Displaced Population calculated: {total_displaced:,} persons.")
        return total_displaced, out_image, out_transform

    @staticmethod
    def clip_severed_and_safe_roads(
        roads_gdf: gpd.GeoDataFrame,
        flood_gdf: gpd.GeoDataFrame,
    ) -> Tuple[gpd.GeoDataFrame, gpd.GeoDataFrame, float, Dict[str, float], float]:
        """
        Intersects road linestrings with flood footprint to identify severed routes (Hazard Red)
        and computes inverse DRY un-flooded highways (Safe Bright Green).
        Also calculates Estimated Infrastructure Damage at Rs 50,000,000 / km.
        """
        empty_gdf = gpd.GeoDataFrame(
            {"id": [], "name": [], "highway": [], "length_km": []},
            geometry=[],
            crs=config.GEOGRAPHIC_CRS,
        )

        if roads_gdf.empty:
            return empty_gdf, empty_gdf, 0.0, {}, 0.0

        if flood_gdf.empty:
            safe_proj = roads_gdf.to_crs(config.METRIC_CRS)
            roads_gdf_copy = roads_gdf.copy()
            roads_gdf_copy["length_km"] = (safe_proj.geometry.length / 1000.0).round(2)
            return empty_gdf, roads_gdf_copy, 0.0, {}, 0.0

        logger.info("Computing spatial intersection for severed & safe road infrastructure...")
        unified_flood = flood_gdf.unary_union

        # 1. Candidate roads intersecting flood
        intersecting_candidates = roads_gdf[roads_gdf.intersects(unified_flood)].copy()

        if intersecting_candidates.empty:
            safe_proj = roads_gdf.to_crs(config.METRIC_CRS)
            roads_gdf_copy = roads_gdf.copy()
            roads_gdf_copy["length_km"] = (safe_proj.geometry.length / 1000.0).round(2)
            return empty_gdf, roads_gdf_copy, 0.0, {}, 0.0

        # Precise geometric intersection for severed lines
        clipped_geoms = intersecting_candidates.geometry.intersection(unified_flood)
        valid_mask = (~clipped_geoms.is_empty) & (clipped_geoms.geom_type.isin(["LineString", "MultiLineString"]))
        severed_roads = intersecting_candidates[valid_mask].copy()
        severed_roads.geometry = clipped_geoms[valid_mask]

        severed_proj = severed_roads.to_crs(config.METRIC_CRS)
        severed_roads["length_km"] = (severed_proj.geometry.length / 1000.0).round(2)

        total_blocked_km = float(severed_roads["length_km"].sum())
        breakdown = {k: round(v, 2) for k, v in severed_roads.groupby("highway")["length_km"].sum().to_dict().items()}

        # 2. Inverse Dry / Safe Un-Flooded Roads (Upgrade 13)
        # Select major arterial highways that are NOT submerged
        major_types = ["motorway", "trunk", "primary", "secondary", "tertiary"]
        major_roads = roads_gdf[roads_gdf["highway"].isin(major_types)].copy()
        non_intersecting_major = major_roads[~major_roads.index.isin(intersecting_candidates.index)].copy()

        # For intersecting roads, subtract flood geometry to keep the dry segments
        dry_diff_geoms = intersecting_candidates.geometry.difference(unified_flood)
        valid_dry = (~dry_diff_geoms.is_empty) & (dry_diff_geoms.geom_type.isin(["LineString", "MultiLineString"]))
        dry_segments = intersecting_candidates[valid_dry].copy()
        dry_segments.geometry = dry_diff_geoms[valid_dry]

        safe_roads = pd.concat([non_intersecting_major, dry_segments]).reset_index(drop=True)
        safe_proj = safe_roads.to_crs(config.METRIC_CRS)
        safe_roads["length_km"] = (safe_proj.geometry.length / 1000.0).round(2)

        # 3. Estimated Infrastructure Damage (Upgrade 13): Rs 50,000,000 / km
        estimated_damage_npr = total_blocked_km * config.ROAD_DAMAGE_COST_PER_KM_NPR

        logger.info(
            f"Road impact: {len(severed_roads)} severed segments ({total_blocked_km:.2f} km blocked) | "
            f"Estimated Damage: Rs {estimated_damage_npr / 1e7:.2f} Crores | "
            f"{len(safe_roads)} safe supply route segments."
        )
        return severed_roads, safe_roads, total_blocked_km, breakdown, estimated_damage_npr

    @staticmethod
    def assess_settlement_impact(
        admin_gdf: gpd.GeoDataFrame,
        flood_gdf: gpd.GeoDataFrame,
        population_raster_path: Optional[Path] = None,
    ) -> Tuple[pd.DataFrame, gpd.GeoDataFrame]:
        """Quantifies settlement inundation, exposure %, GHSL displaced population, and dispatch rankings."""
        cols = [
            "Settlement Name",
            "District",
            "Flooded km²",
            "Exposure %",
            "Displaced Population",
            "Priority Level",
            "Impact Score",
        ]
        if admin_gdf.empty or flood_gdf.empty:
            return pd.DataFrame(columns=cols), gpd.GeoDataFrame()

        logger.info("Assessing settlement impact, exposure scoring, and displaced persons...")
        unified_flood = flood_gdf.unary_union

        intersecting_admin = admin_gdf[admin_gdf.intersects(unified_flood)].copy()
        if intersecting_admin.empty:
            return pd.DataFrame(columns=cols), gpd.GeoDataFrame()

        intersecting_admin["flood_geom"] = intersecting_admin.geometry.intersection(unified_flood)

        inter_gdf_proj = gpd.GeoDataFrame(
            intersecting_admin,
            geometry="flood_geom",
            crs=admin_gdf.crs,
        ).to_crs(config.METRIC_CRS)
        intersecting_admin["flooded_km2"] = inter_gdf_proj.geometry.area / 1e6

        affected_admin = intersecting_admin[intersecting_admin["flooded_km2"] >= 0.01].copy()

        affected_admin["total_area_km2"] = affected_admin["total_area_km2"].replace(0, np.nan)
        affected_admin["exposure_pct"] = (
            affected_admin["flooded_km2"] / affected_admin["total_area_km2"]
        ) * 100.0
        affected_admin["exposure_pct"] = affected_admin["exposure_pct"].clip(upper=100.0).fillna(0.0)

        displaced_list = []
        pop_src = None
        if population_raster_path and population_raster_path.exists():
            try:
                pop_src = rasterio.open(population_raster_path)
            except Exception:
                pop_src = None

        for _, row in affected_admin.iterrows():
            geom = row["flood_geom"]
            if pop_src and geom is not None and not geom.is_empty and geom.is_valid:
                try:
                    out_img, _ = mask(pop_src, [geom], crop=True, filled=False)
                    vals = out_img[0]
                    pop_count = int(np.round(np.sum(vals[(vals > 0) & (vals != pop_src.nodata)])))
                except Exception:
                    pop_count = int(round(row["flooded_km2"] * 450.0))
            else:
                pop_count = int(round(row["flooded_km2"] * 450.0))
            displaced_list.append(max(0, pop_count))

        if pop_src:
            pop_src.close()

        affected_admin["displaced_population"] = displaced_list
        criticality_weight = 1.0 + np.log10(1.0 + affected_admin["displaced_population"] / 250.0)
        affected_admin["impact_score"] = (affected_admin["exposure_pct"] * criticality_weight).round(2)

        def get_priority(row):
            exp = row["exposure_pct"]
            pop = row["displaced_population"]
            if exp >= 15.0 or pop >= 4000:
                return "CRITICAL"
            elif exp >= 7.0 or pop >= 1500:
                return "HIGH"
            elif exp >= 2.0 or pop >= 300:
                return "MEDIUM"
            else:
                return "WATCH"

        affected_admin["priority_level"] = affected_admin.apply(get_priority, axis=1)

        impact_df = pd.DataFrame(
            {
                "Settlement Name": affected_admin["settlement"],
                "District": affected_admin["district"],
                "Flooded km²": affected_admin["flooded_km2"].round(2),
                "Exposure %": affected_admin["exposure_pct"].round(2),
                "Displaced Population": affected_admin["displaced_population"],
                "Priority Level": affected_admin["priority_level"],
                "Impact Score": affected_admin["impact_score"],
            }
        ).sort_values(by=["Impact Score", "Displaced Population"], ascending=False)

        affected_gdf = affected_admin[
            [
                "settlement",
                "district",
                "total_area_km2",
                "flooded_km2",
                "exposure_pct",
                "displaced_population",
                "priority_level",
                "impact_score",
                "geometry",
            ]
        ].copy()
        affected_gdf["flooded_km2"] = affected_gdf["flooded_km2"].round(2)
        affected_gdf["exposure_pct"] = affected_gdf["exposure_pct"].round(1)
        affected_gdf["total_area_km2"] = affected_gdf["total_area_km2"].round(2)

        return impact_df, affected_gdf


def assess_uploaded_camps(
    uploaded_file_or_path: Any,
    flood_gdf: gpd.GeoDataFrame,
) -> Tuple[gpd.GeoDataFrame, int, int]:
    """
    NGO Shapefile / GeoJSON Uploader Processor (Upgrade 5).
    Ingests an uploaded spatial file (GeoJSON or zipped Shapefile) representing
    custom field medical camps, relief shelters, or staging centers.
    Performs spatial overlay against the flood mask to return which specific points
    are underwater vs safe.
    """
    try:
        # Check if uploaded file is a Streamlit UploadedFile or BytesIO
        if hasattr(uploaded_file_or_path, "name") and hasattr(uploaded_file_or_path, "getvalue"):
            file_name = uploaded_file_or_path.name
            raw_bytes = uploaded_file_or_path.getvalue()

            if file_name.endswith(".zip"):
                with tempfile.TemporaryDirectory() as tmp_dir:
                    zip_path = Path(tmp_dir) / file_name
                    with open(zip_path, "wb") as f:
                        f.write(raw_bytes)
                    with zipfile.ZipFile(zip_path, "r") as zf:
                        zf.extractall(tmp_dir)
                    # Find extracted shapefile
                    shp_files = list(Path(tmp_dir).glob("*.shp"))
                    if not shp_files:
                        raise ValueError("No .shp file found inside uploaded zip archive.")
                    camps_gdf = gpd.read_file(shp_files[0])
            else:
                # GeoJSON or JSON
                camps_gdf = gpd.read_file(io.BytesIO(raw_bytes))
        else:
            # File path or string
            camps_gdf = gpd.read_file(uploaded_file_or_path)

        if camps_gdf.empty:
            return gpd.GeoDataFrame(), 0, 0

        # Ensure WGS84 CRS
        if camps_gdf.crs is None:
            camps_gdf = camps_gdf.set_crs(config.GEOGRAPHIC_CRS)
        elif camps_gdf.crs.to_string() != config.GEOGRAPHIC_CRS:
            camps_gdf = camps_gdf.to_crs(config.GEOGRAPHIC_CRS)

        # Standardize facility name column
        if "name" not in camps_gdf.columns:
            for cand in ["Name", "camp_name", "CAMP_NAME", "facility", "title"]:
                if cand in camps_gdf.columns:
                    camps_gdf["name"] = camps_gdf[cand]
                    break
            else:
                camps_gdf["name"] = [f"Relief Facility #{i+1}" for i in range(len(camps_gdf))]

        if "facility_type" not in camps_gdf.columns:
            camps_gdf["facility_type"] = "Humanitarian Medical Post"

        # Check intersection with flood footprint
        if not flood_gdf.empty:
            unified_flood = flood_gdf.unary_union
            is_submerged = camps_gdf.geometry.intersects(unified_flood)
            camps_gdf["status"] = np.where(is_submerged, "UNDERWATER / CUT OFF", "OPERATIONAL / SECURE")
            camps_gdf["priority_action"] = np.where(
                is_submerged,
                "URGENT: Waterborne Extraction & Boat Rescue",
                "ACTIVE: Safe Supply Hub & Staging Area",
            )
        else:
            camps_gdf["status"] = "OPERATIONAL / SECURE"
            camps_gdf["priority_action"] = "ACTIVE: Safe Supply Hub & Staging Area"

        flooded_count = int((camps_gdf["status"] == "UNDERWATER / CUT OFF").sum())
        safe_count = int((camps_gdf["status"] == "OPERATIONAL / SECURE").sum())

        logger.info(f"NGO Upload Assessment: {len(camps_gdf)} camps processed ({flooded_count} submerged, {safe_count} safe).")
        return camps_gdf, flooded_count, safe_count

    except Exception as e:
        logger.error(f"Error assessing uploaded NGO spatial file: {e}")
        return gpd.GeoDataFrame(), 0, 0


def run_full_impact_pipeline(
    raster_path: Path,
    population_raster_path: Optional[Path] = None,
    aoi_coords: List[float] = config.AOI_COORDINATES,
) -> Dict[str, Any]:
    """
    Master vector impact pipeline:
    - Raster to flood polygons
    - GHSL Displaced Population
    - Severed roads identification & Safe Dry un-flooded road corridors
    - Infrastructure Economic Damage modeling (Rs 50,000,000/km)
    - Settlement exposure scoring & prioritized dispatch rankings
    """
    if population_raster_path is None:
        population_raster_path = config.DEFAULT_POPULATION_RASTER

    aoi_tuple = tuple(aoi_coords)

    # 1. Polygonize flood mask
    flood_gdf = ImpactEngine.polygonize_raster(raster_path)
    total_flooded_km2 = float(flood_gdf["area_km2"].sum()) if not flood_gdf.empty else 0.0

    # 2. Total Displaced Population strictly within flood polygons
    total_displaced_pop, _, _ = ImpactEngine.calculate_displaced_population(
        flood_gdf=flood_gdf,
        population_raster_path=population_raster_path,
    )

    # 3. Load local OSM roads and HDX admin data with RAM caching
    roads_gdf = VectorDataLoader.load_osm_roads(aoi_coords=aoi_tuple)
    admin_gdf = VectorDataLoader.load_admin_boundaries(aoi_coords=aoi_tuple)

    # 4. Clip severed roads and compute safe dry routes + economic damage (Upgrade 13)
    severed_roads_gdf, safe_roads_gdf, total_blocked_km, road_breakdown, estimated_damage_npr = (
        ImpactEngine.clip_severed_and_safe_roads(
            roads_gdf=roads_gdf,
            flood_gdf=flood_gdf,
        )
    )

    # 5. Assess settlement impact and rank top affected
    all_settlements_df, affected_admin_gdf = ImpactEngine.assess_settlement_impact(
        admin_gdf=admin_gdf,
        flood_gdf=flood_gdf,
        population_raster_path=population_raster_path,
    )

    top_5_df = all_settlements_df.head(5).reset_index(drop=True)

    metrics = {
        "total_flooded_km2": round(total_flooded_km2, 2),
        "total_blocked_road_km": round(total_blocked_km, 2),
        "total_displaced_population": total_displaced_pop,
        "impacted_settlements_count": len(all_settlements_df),
        "critical_settlements_count": int((all_settlements_df["Priority Level"] == "CRITICAL").sum()),
        "high_settlements_count": int((all_settlements_df["Priority Level"] == "HIGH").sum()),
        "road_breakdown": road_breakdown,
        "estimated_damage_npr": estimated_damage_npr,
        "estimated_damage_crores": round(estimated_damage_npr / 10_000_000.0, 2),
    }

    return {
        "metrics": metrics,
        "top_5_settlements": top_5_df,
        "all_settlements_df": all_settlements_df,
        "flood_gdf": flood_gdf,
        "severed_roads_gdf": severed_roads_gdf,
        "safe_roads_gdf": safe_roads_gdf,
        "affected_admin_gdf": affected_admin_gdf,
    }
