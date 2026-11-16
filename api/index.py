import os
import sys

# Ensure backend directory is accessible to import server modules
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from server import HoopManagerHandler, migrate_db

# Run lightweight migrations upon cold start when database is available
try:
    migrate_db()
except Exception as e:
    print(f"[Vercel Startup Notice] Database initialization: {e}")

class handler(HoopManagerHandler):
    """
    Vercel Serverless Python Handler inheriting from HoopManagerHandler.
    Automatically handles all /api/* requests on Vercel infrastructure.
    """
    pass
