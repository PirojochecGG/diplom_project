import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_PATH = os.getenv("CTI_TEST_DB") or str(DATA_DIR / "cti.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
