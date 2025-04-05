from dataclasses import dataclass
from typing import Optional

@dataclass
class GitHubPluginOptions:
    access_token: str
    username: str
    default_org: Optional[str] = None 