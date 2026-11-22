import os
import json
import time
from pathlib import Path
from typing import Dict, Any, Optional

USAGE_TRACKER_PATH = Path("backend/data/vision_usage.json")
DEFAULT_MONTHLY_LIMIT = 900  # Stricter than Google's 1000 free tier units


class VisionBudgetTracker:
    """
    Application-level usage tracking and circuit breaker for Google Cloud Vision API.
    Caps monthly requests at 900 image units to prevent unintended cloud billing.
    
    Notice: This tracker operates purely at the application level and cannot detect
    API usage consumed outside this application or across other services sharing
    the same Google Cloud project.
    """
    def __init__(self, limit: int = DEFAULT_MONTHLY_LIMIT):
        self.limit = limit
        self.tracker_file = USAGE_TRACKER_PATH
        self.tracker_file.parent.mkdir(parents=True, exist_ok=True)
        self._load_tracker()

    def _get_current_month(self) -> str:
        return time.strftime("%Y-%m")

    def _load_tracker(self):
        cur_month = self._get_current_month()
        if self.tracker_file.exists():
            try:
                with open(self.tracker_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if data.get("month") == cur_month:
                    self.count = data.get("count", 0)
                    return
            except Exception:
                pass
        # Reset for new month or new tracker file
        self.count = 0
        self._save_tracker()

    def _save_tracker(self):
        data = {
            "month": self._get_current_month(),
            "count": self.count,
            "limit": self.limit,
            "last_updated": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        with open(self.tracker_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def can_consume(self) -> bool:
        """Returns True if within budget, False if limit reached."""
        self._load_tracker()
        return self.count < self.limit

    def record_usage(self, units: int = 1) -> int:
        """Increments consumed units and persists state."""
        self.count += units
        self._save_tracker()
        return self.count

    def get_status(self) -> Dict[str, Any]:
        self._load_tracker()
        return {
            "current_month": self._get_current_month(),
            "used_units": self.count,
            "monthly_limit": self.limit,
            "remaining_units": max(0, self.limit - self.count),
            "is_quota_exhausted": self.count >= self.limit
        }
