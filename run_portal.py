"""
TerraFlood Unified Web Portal Launcher
======================================
Launches:
1. FastAPI Telemetry & Citizen SOS Backend + Web Portal on http://localhost:8000
2. Optional Vite + React dev server on http://localhost:3000 (if node_modules present)

Usage:
    python run_portal.py
"""

import sys
import os
import subprocess
import time
from pathlib import Path

def main():
    root_dir = Path(__file__).resolve().parent
    portal_dir = root_dir / "portal"

    print("=" * 70)
    print("   🌊 TERRAFLOOD // PUBLIC CITIZEN SAFETY WEB PORTAL")
    print("   Emergency Flood Extent Mapping & Medical Camps Evacuation Hub")
    print("=" * 70)

    # 1. Start FastAPI backend + Static Web Portal
    print("\n[1/2] ⚡ Launching FastAPI Server & Citizen Portal on http://localhost:8000 ...")
    api_cmd = [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
    api_process = subprocess.Popen(api_cmd, cwd=str(root_dir))

    time.sleep(2)

    portal_process = None
    # 2. Check if Vite React frontend node_modules is installed
    if (portal_dir / "node_modules").exists():
        print("[2/2] 🚀 Launching Vite + React Citizen Portal on http://localhost:3000 ...")
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        try:
            portal_process = subprocess.Popen([npm_cmd, "run", "dev"], cwd=str(portal_dir))
        except Exception as e:
            print(f"Note: Vite dev server not started ({e}). FastAPI is serving the portal directly.")
    else:
        print("[2/2] 🌐 High-Performance Citizen Web Portal active via FastAPI on port 8000.")

    print("\n" + "=" * 70)
    print("   🟢 ALL SERVICES ACTIVE & LIVE:")
    print("   🌐 Public Citizen Web Portal:   http://localhost:8000")
    if portal_process:
        print("   ⚛️ Vite React Dev Server:       http://localhost:3000")
    print("   ⚡ Telemetry & SOS REST API:    http://localhost:8000/docs")
    print("   🛡️ Tactical Command Center:     http://localhost:8501")
    print("=" * 70 + "\n")
    print("Press Ctrl+C to stop the server.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down TerraFlood Web Portal...")
        if api_process:
            api_process.terminate()
        if portal_process:
            portal_process.terminate()

if __name__ == "__main__":
    main()
