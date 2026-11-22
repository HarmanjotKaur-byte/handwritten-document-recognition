import os
import json
import time
import logging
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger("simplehtr.usage")

USAGE_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "vision_usage.json"
DEFAULT_LIMIT = int(os.getenv("MONTHLY_USAGE_LIMIT", "900"))


class UsageService:
    """
    Tracks and enforces application-level usage limits.
    Prevents requests beyond the free allowance.
    """
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self, limit: int = DEFAULT_LIMIT):
        self.limit = limit
        self.file_path = USAGE_FILE
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        self.count = 0
        self._load()

    def _get_current_month(self) -> str:
        return time.strftime("%Y-%m")

    def _load(self):
        cur_month = self._get_current_month()
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if data.get("month") == cur_month:
                    self.count = data.get("count", 0)
                    return
            except Exception as e:
                logger.warning(f"Failed to read usage file: {e}")
        self.count = 0
        self._save()

    def _save(self):
        try:
            data = {
                "month": self._get_current_month(),
                "count": self.count,
                "limit": self.limit,
                "last_updated": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save usage tracker: {e}")

    def can_consume(self) -> bool:
        self._load()
        return self.count < self.limit

    def record_usage(self, units: int = 1) -> int:
        self._load()
        self.count += units
        self._save()
        return self.count

    def get_status(self) -> Dict[str, Any]:
        self._load()
        return {
            "current_month": self._get_current_month(),
            "used_units": self.count,
            "monthly_limit": self.limit,
            "remaining_units": max(0, self.limit - self.count),
            "is_quota_exhausted": self.count >= self.limit
        }
