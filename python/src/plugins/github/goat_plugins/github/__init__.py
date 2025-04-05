from typing import List
import aiohttp

from goat.classes.plugin_base import PluginBase
from goat.classes.wallet_client_base import WalletClientBase
from goat.types.chain import Chain
from goat.decorators.tool import Tool
from plugins.github.goat_plugins.github.options import GitHubPluginOptions
from plugins.github.goat_plugins.github.parameters import (
    CreateRepositoryParameters,
    CreateBranchParameters,
    ListRepositoriesParameters
)

class GitHubService:
    BASE_URL = "https://api.github.com"
    
    def __init__(self, options: 'GitHubPluginOptions'):
        self.options = options
        self.headers = {
            "Authorization": f"token {options.access_token}",
            "Accept": "application/vnd.github.v3+json"
        }

    @Tool({
        "description": "Create a new GitHub repository",
        "parameters_schema": CreateRepositoryParameters
    })
    async def create_repository(self, wallet: WalletClientBase, parameters: dict) -> dict:
        """Create a new GitHub repository."""
        print(dict)
        print("in")
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/user/repos"
                data = {
                    "name": parameters["name"],
                    "private": parameters.get("private", False),
                    "auto_init": True
                }
                if "description" in parameters:
                    data["description"] = parameters["description"]

                async with session.post(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    return await response.json()
        except Exception as error:
            raise Exception(f"Failed to create repository: {error}")

    @Tool({
        "description": "List all repositories for the authenticated user",
        "parameters_schema": ListRepositoriesParameters
    })
    async def list_repositories(self, wallet: WalletClientBase, parameters: dict) -> List[dict]:
        """List all repositories for the authenticated user."""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/user/repos"
                async with session.get(url, headers=self.headers) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    return await response.json()
        except Exception as error:
            raise Exception(f"Failed to list repositories: {error}")

    @Tool({
        "description": "Create a new branch in a GitHub repository",
        "parameters_schema": CreateBranchParameters
    })
    async def create_branch(self, wallet: WalletClientBase, parameters: dict) -> dict:
        """Create a new branch in a repository."""
        try:
            async with aiohttp.ClientSession() as session:
                # Get the SHA of the base branch
                url = f"{self.BASE_URL}/repos/{self.options.username}/{parameters['repo_name']}/git/refs/heads/{parameters.get('base_branch', 'main')}"
                async with session.get(url, headers=self.headers) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    base_sha = (await response.json())["object"]["sha"]

                # Create the new branch
                url = f"{self.BASE_URL}/repos/{self.options.username}/{parameters['repo_name']}/git/refs"
                data = {
                    "ref": f"refs/heads/{parameters['branch_name']}",
                    "sha": base_sha
                }
                async with session.post(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    return await response.json()
        except Exception as error:
            raise Exception(f"Failed to create branch: {error}")

class GitHubPlugin(PluginBase[WalletClientBase]):
    def __init__(self, options: 'GitHubPluginOptions'):
        super().__init__("github", [GitHubService(options)])

    def supports_chain(self, chain: Chain) -> bool:
        # GitHub plugin supports all chains since it's not chain-specific
        return True


def github(options: GitHubPluginOptions) -> GitHubPlugin:
    """Factory function to create a new instance of the GitHub plugin."""
    return GitHubPlugin(options)
