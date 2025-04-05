from typing import Optional, Dict, List
import aiohttp
from goat.decorators.tool import Tool
from .options import VercelPluginOptions
from .parameters import (
    VercelDeployParameters,
    VercelProjectParameters,
    VercelDeploymentParameters
)
import os

class VercelService:
    BASE_URL = "https://api.vercel.com"
    
    def __init__(self, options: VercelPluginOptions):
        self.options = options
        self.headers = {
            "Authorization": f"Bearer {options.access_token}",
            "Content-Type": "application/json"
        }

    async def _make_request(self, method: str, endpoint: str, data: Optional[dict] = None) -> dict:
        """Make a request to the Vercel API."""
        async with aiohttp.ClientSession() as session:
            url = f"{self.BASE_URL}{endpoint}"
            async with session.request(method, url, headers=self.headers, json=data) as response:
                if not response.ok:
                    error_text = await response.text()
                    raise Exception(f"Vercel API error: {error_text}")
                return await response.json()

    @Tool({
        "name": "create_project",
        "description": "Create a new Vercel project",
        "parameters_schema": VercelProjectParameters
    })
    async def create_project(self, parameters: dict) -> dict:
        """Create a new Vercel project."""
        try:
            params = VercelProjectParameters(**parameters)
            data = {
                "name": params.project_name,
                "framework": params.framework
            }
            if params.git_repository:
                data["gitRepository"] = {
                    "type": "github",
                    "repo": params.git_repository
                }
            if self.options.team_id:
                data["teamId"] = self.options.team_id

            response = await self._make_request("POST", "/v9/projects", data)
            return {
                "status": "success",
                "project": response
            }
        except Exception as error:
            raise Exception(f"Failed to create project: {error}")

    def _sanitize_project_name(self, name: str) -> str:
        """Sanitize a project name to meet Vercel's requirements."""
        # Convert to lowercase
        name = name.lower()
        # Replace spaces and special characters with hyphens
        name = ''.join(c if c.isalnum() or c in '._-' else '-' for c in name)
        # Remove consecutive hyphens
        while '---' in name:
            name = name.replace('---', '--')
        # Remove leading/trailing hyphens
        name = name.strip('-')
        # Ensure length is within limits
        return name[:100]

    @Tool({
        "name": "deploy_branch",
        "description": "Deploy a GitHub repository branch to Vercel",
        "parameters_schema": VercelDeployParameters
    })
    async def deploy_branch(self, parameters: dict) -> dict:
        """Deploy a GitHub repository branch to Vercel."""
        try:
            params = VercelDeployParameters(**parameters)
            # Sanitize the project name
            project_name = self._sanitize_project_name(params.project_name or params.repo_name)
            
            # First, ensure the project exists
            try:
                await self._make_request("GET", f"/v9/projects/{project_name}")
            except Exception:
                # Project doesn't exist, create it
                await self.create_project({
                    "project_name": project_name,
                    "framework": params.framework,
                    "git_repository": params.repo_name
                })
            
            # Get the GitHub repository ID
            github_headers = {
                "Authorization": f"Bearer {os.getenv('GITHUB_ACCESS_TOKEN')}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            # First try with the full repository path
            repo_path = params.repo_name
            if '/' not in repo_path:
                # If no organization is specified, use the authenticated user
                github_username = os.getenv('GITHUB_USERNAME')
                if not github_username:
                    raise Exception("GitHub username not found in environment variables. Please set GITHUB_USERNAME in your .env file.")
                repo_path = f"{github_username}/{repo_path}"
            
            async with aiohttp.ClientSession() as session:
                github_url = f"https://api.github.com/repos/{repo_path}"
                async with session.get(github_url, headers=github_headers) as response:
                    if response.status == 404:
                        raise Exception(f"Repository '{repo_path}' not found. Please check if the repository exists and you have access to it.")
                    elif not response.ok:
                        error_text = await response.text()
                        raise Exception(f"Failed to get GitHub repository info: {error_text}")
                    repo_info = await response.json()
                    repo_id = repo_info["id"]
            
            # Deploy the branch
            deploy_data = {
                "name": project_name,
                "gitSource": {
                    "type": "github",
                    "repoId": repo_id,
                    "ref": params.branch_name
                }
            }
            if params.framework:
                deploy_data["framework"] = params.framework
            if params.environment_variables:
                deploy_data["env"] = params.environment_variables
            if self.options.team_id:
                deploy_data["teamId"] = self.options.team_id

            response = await self._make_request("POST", "/v13/deployments", deploy_data)
            return {
                "status": "success",
                "deployment": response
            }
        except Exception as error:
            raise Exception(f"Failed to deploy branch: {error}")

    @Tool({
        "name": "get_deployment_status",
        "description": "Get the status of a deployment",
        "parameters_schema": VercelDeploymentParameters
    })
    async def get_deployment_status(self, parameters: dict) -> dict:
        """Get the status of a deployment."""
        try:
            params = VercelDeploymentParameters(**parameters)
            response = await self._make_request("GET", f"/v6/deployments?project={params.project_name}")
            return {
                "status": "success",
                "deployments": response.get("deployments", [])
            }
        except Exception as error:
            raise Exception(f"Failed to get deployment status: {error}")

    @Tool({
        "name": "list_projects",
        "description": "List all Vercel projects",
        "parameters_schema": None
    })
    async def list_projects(self, parameters: dict) -> dict:
        """List all Vercel projects."""
        try:
            endpoint = "/v9/projects"
            if self.options.team_id:
                endpoint += f"?teamId={self.options.team_id}"
            response = await self._make_request("GET", endpoint)
            return {
                "status": "success",
                "projects": response.get("projects", [])
            }
        except Exception as error:
            raise Exception(f"Failed to list projects: {error}")

    @Tool({
        "name": "delete_project",
        "description": "Delete a Vercel project",
        "parameters_schema": VercelProjectParameters
    })
    async def delete_project(self, parameters: dict) -> dict:
        """Delete a Vercel project."""
        try:
            params = VercelProjectParameters(**parameters)
            endpoint = f"/v9/projects/{params.project_name}"
            if self.options.team_id:
                endpoint += f"?teamId={self.options.team_id}"
            await self._make_request("DELETE", endpoint)
            return {
                "status": "success",
                "message": f"Project {params.project_name} deleted successfully"
            }
        except Exception as error:
            raise Exception(f"Failed to delete project: {error}")
