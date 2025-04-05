from dataclasses import dataclass
from typing import Optional

@dataclass
class VercelPluginOptions:
    access_token: str
    team_id: Optional[str] = None
    default_region: str = "sfo1" 