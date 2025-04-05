from typing import Optional, List
import aiohttp
from dataclasses import dataclass
from goat.decorators.tool import Tool
from .options import GitHubPluginOptions
from .parameters import (
    CreateRepositoryParameters,
    CreateCommitParameters,
    ListRepositoriesParameters,
    CreateBranchParameters,
    DeleteBranchParameters,
    AddCollaboratorParameters,
    RemoveCollaboratorParameters,
    UpdateRepositoryVisibilityParameters,
    CreateIssueParameters,
    CreatePullRequestParameters,
    MergePullRequestParameters
)


@dataclass
class Repository:
    name: str
    description: Optional[str]
    private: bool
    html_url: str


@dataclass
class Commit:
    sha: str
    message: str
    author: str
    date: str
    html_url: str


class GitHubService:
    BASE_URL = "https://api.github.com"
    
    def __init__(self, options: GitHubPluginOptions):
        self.options = options
        self.headers = {
            "Authorization": f"token {options.access_token}",
            "Accept": "application/vnd.github.v3+json"
        }

    @Tool({
        "name": "create_repository",
        "description": "Create a new GitHub repository",
        "parameters_schema": CreateRepositoryParameters
    })
    async def create_repository(self, parameters: dict) -> Repository:
        """Create a new GitHub repository."""
        try:
            params = CreateRepositoryParameters(**parameters)
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/user/repos"
                data = {
                    "name": params.name,
                    "private": params.private,
                    "auto_init": True
                }
                if params.description:
                    data["description"] = params.description

                async with session.post(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    repo_data = await response.json()
                    
                    return Repository(
                        name=repo_data["name"],
                        description=repo_data.get("description"),
                        private=repo_data["private"],
                        html_url=repo_data["html_url"]
                    )
        except Exception as error:
            raise Exception(f"Failed to create repository: {error}")

    @Tool({
        "name": "create_commit",
        "description": "Create a new commit in a GitHub repository",
        "parameters_schema": CreateCommitParameters
    })
    async def create_commit(self, parameters: dict) -> Commit:
        """Create a new commit in a repository."""
        try:
            params = CreateCommitParameters(**parameters)
            async with aiohttp.ClientSession() as session:
                # First, get the current commit SHA
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/git/refs/heads/main"
                async with session.get(url, headers=self.headers) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    current_sha = (await response.json())["object"]["sha"]

                # Get the tree SHA
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/git/commits/{current_sha}"
                async with session.get(url, headers=self.headers) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    tree_sha = (await response.json())["tree"]["sha"]

                # Create a blob with the file content
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/git/blobs"
                data = {
                    "content": params.content,
                    "encoding": "utf-8"
                }
                async with session.post(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    blob_sha = (await response.json())["sha"]

                # Create a new tree
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/git/trees"
                data = {
                    "base_tree": tree_sha,
                    "tree": [{
                        "path": params.file_path,
                        "mode": "100644",
                        "type": "blob",
                        "sha": blob_sha
                    }]
                }
                async with session.post(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    new_tree_sha = (await response.json())["sha"]

                # Create a new commit
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/git/commits"
                data = {
                    "message": params.message,
                    "tree": new_tree_sha,
                    "parents": [current_sha]
                }
                async with session.post(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    commit_sha = (await response.json())["sha"]

                # Update the reference
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/git/refs/heads/main"
                data = {
                    "sha": commit_sha
                }
                async with session.patch(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    response_data = await response.json()

                    return Commit(
                        sha=commit_sha,
                        message=params.message,
                        author=self.options.username,
                        date=response_data["object"]["url"],
                        html_url=f"https://github.com/{self.options.username}/{params.repo_name}/commit/{commit_sha}"
                    )
        except Exception as error:
            raise Exception(f"Failed to create commit: {error}")

    @Tool({
        "name": "list_repositories",
        "description": "List all repositories for the authenticated user",
        "parameters_schema": ListRepositoriesParameters
    })
    async def list_repositories(self, parameters: dict) -> List[Repository]:
        """List all repositories for the authenticated user."""
        try:
            params = ListRepositoriesParameters(**parameters)
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/user/repos"
                async with session.get(url, headers=self.headers) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    repos_data = await response.json()
                    
                    return [
                        Repository(
                            name=repo["name"],
                            description=repo.get("description"),
                            private=repo["private"],
                            html_url=repo["html_url"]
                        )
                        for repo in repos_data
                    ]
        except Exception as error:
            raise Exception(f"Failed to list repositories: {error}")

    @Tool({
        "name": "create_branch",
        "description": "Create a new branch in a GitHub repository",
        "parameters_schema": CreateBranchParameters
    })
    async def create_branch(self, parameters: dict) -> dict:
        """Create a new branch in a repository."""
        try:
            params = CreateBranchParameters(**parameters)
            async with aiohttp.ClientSession() as session:
                # Get the SHA of the base branch
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/git/refs/heads/{params.base_branch}"
                async with session.get(url, headers=self.headers) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    base_sha = (await response.json())["object"]["sha"]

                # Create the new branch
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/git/refs"
                data = {
                    "ref": f"refs/heads/{params.branch_name}",
                    "sha": base_sha
                }
                async with session.post(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    return await response.json()
        except Exception as error:
            raise Exception(f"Failed to create branch: {error}")

    @Tool({
        "name": "delete_branch",
        "description": "Delete a branch from a GitHub repository",
        "parameters_schema": DeleteBranchParameters
    })
    async def delete_branch(self, parameters: dict) -> bool:
        """Delete a branch from a repository."""
        try:
            params = DeleteBranchParameters(**parameters)
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/git/refs/heads/{params.branch_name}"
                async with session.delete(url, headers=self.headers) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    return True
        except Exception as error:
            raise Exception(f"Failed to delete branch: {error}")

    @Tool({
        "name": "add_collaborator",
        "description": "Add a collaborator to a GitHub repository",
        "parameters_schema": AddCollaboratorParameters
    })
    async def add_collaborator(self, parameters: dict) -> dict:
        """Add a collaborator to a repository."""
        try:
            params = AddCollaboratorParameters(**parameters)
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/collaborators/{params.username}"
                data = {
                    "permission": params.permission
                }
                async with session.put(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    return await response.json()
        except Exception as error:
            raise Exception(f"Failed to add collaborator: {error}")

    @Tool({
        "name": "remove_collaborator",
        "description": "Remove a collaborator from a GitHub repository",
        "parameters_schema": RemoveCollaboratorParameters
    })
    async def remove_collaborator(self, parameters: dict) -> bool:
        """Remove a collaborator from a repository."""
        try:
            params = RemoveCollaboratorParameters(**parameters)
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/collaborators/{params.username}"
                async with session.delete(url, headers=self.headers) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    return True
        except Exception as error:
            raise Exception(f"Failed to remove collaborator: {error}")

    @Tool({
        "name": "update_repository_visibility",
        "description": "Change a repository's visibility between public and private",
        "parameters_schema": UpdateRepositoryVisibilityParameters
    })
    async def update_repository_visibility(self, parameters: dict) -> Repository:
        """Update a repository's visibility."""
        try:
            params = UpdateRepositoryVisibilityParameters(**parameters)
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}"
                data = {
                    "private": params.private
                }
                async with session.patch(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    repo_data = await response.json()
                    
                    return Repository(
                        name=repo_data["name"],
                        description=repo_data.get("description"),
                        private=repo_data["private"],
                        html_url=repo_data["html_url"]
                    )
        except Exception as error:
            raise Exception(f"Failed to update repository visibility: {error}")

    @Tool({
        "name": "create_issue",
        "description": "Create a new issue in a GitHub repository",
        "parameters_schema": CreateIssueParameters
    })
    async def create_issue(self, parameters: dict) -> dict:
        """Create a new issue in a repository."""
        try:
            params = CreateIssueParameters(**parameters)
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/issues"
                data = {
                    "title": params.title,
                    "body": params.body
                }
                if params.labels:
                    data["labels"] = params.labels

                async with session.post(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    return await response.json()
        except Exception as error:
            raise Exception(f"Failed to create issue: {error}")

    @Tool({
        "name": "create_pull_request",
        "description": "Create a new pull request in a GitHub repository",
        "parameters_schema": CreatePullRequestParameters
    })
    async def create_pull_request(self, parameters: dict) -> dict:
        """Create a new pull request in a repository."""
        try:
            params = CreatePullRequestParameters(**parameters)
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/pulls"
                data = {
                    "title": params.title,
                    "body": params.body,
                    "head": params.head,
                    "base": params.base
                }

                async with session.post(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    return await response.json()
        except Exception as error:
            raise Exception(f"Failed to create pull request: {error}")

    @Tool({
        "name": "merge_pull_request",
        "description": "Merge a pull request in a GitHub repository",
        "parameters_schema": MergePullRequestParameters
    })
    async def merge_pull_request(self, parameters: dict) -> dict:
        """Merge a pull request in a repository."""
        try:
            params = MergePullRequestParameters(**parameters)
            async with aiohttp.ClientSession() as session:
                url = f"{self.BASE_URL}/repos/{self.options.username}/{params.repo_name}/pulls/{params.pull_number}/merge"
                data = {
                    "merge_method": params.merge_method
                }
                if params.commit_title:
                    data["commit_title"] = params.commit_title
                if params.commit_message:
                    data["commit_message"] = params.commit_message

                async with session.put(url, headers=self.headers, json=data) as response:
                    if not response.ok:
                        raise Exception(f"HTTP error! status: {response.status} {await response.text()}")
                    return await response.json()
        except Exception as error:
            raise Exception(f"Failed to merge pull request: {error}")
