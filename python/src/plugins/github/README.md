# GitHub Plugin for GOAT SDK

A plugin for the GOAT SDK that provides comprehensive GitHub repository management functionality, including repository creation, commit management, branch operations, and collaborator management through the GitHub API.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-github
```

## Usage

```python
from goat_plugins.github import github, GitHubPluginOptions

# Initialize the plugin
options = GitHubPluginOptions(
    access_token="${GITHUB_ACCESS_TOKEN}",  # Your GitHub personal access token
    username="your-github-username"         # Your GitHub username
)
plugin = github(options)

# Create a new repository
repo = await plugin.create_repository(
    name="my-project",
    description="A new project",
    private=True
)

# Create a commit
commit = await plugin.create_commit(
    repo_name="my-project",
    file_path="src/main.py",
    content="print('Hello, World!')",
    message="Initial commit"
)

# Create a new branch
branch = await plugin.create_branch(
    repo_name="my-project",
    branch_name="feature/new-feature",
    base_branch="main"
)

# Add a collaborator
collaborator = await plugin.add_collaborator(
    repo_name="my-project",
    username="collaborator-username",
    permission="push"
)

# Update repository visibility
updated_repo = await plugin.update_repository_visibility(
    repo_name="my-project",
    private=False
)
```

## Features

- Repository Management:
  - Create new repositories
  - List existing repositories
  - Update repository visibility (public/private)
  - Repository initialization
  
- Commit Operations:
  - Create new commits
  - File content management
  - Commit message handling
  - Tree and blob management
  
- Branch Operations:
  - Create new branches
  - Delete existing branches
  - Branch reference management
  - Base branch selection
  
- Collaborator Management:
  - Add collaborators
  - Remove collaborators
  - Permission level control
  - Access management
  
- Supported Features:
  - Async/await support
  - Error handling
  - Rate limit handling
  - Parameter validation
  
- Repository Settings:
  - Visibility control
  - Description management
  - Auto-initialization
  - Default branch configuration

## Authentication

The plugin requires a GitHub Personal Access Token with the following permissions:
- `repo` (Full control of private repositories)
- `workflow` (Optional, for GitHub Actions support)

## Error Handling

The plugin provides detailed error messages for common scenarios:
- Authentication failures
- Rate limit exceeded
- Invalid repository names
- Permission denied
- Network errors
- Invalid parameters

## Rate Limiting

The plugin automatically handles GitHub's API rate limits:
- 5000 requests per hour for authenticated users
- 60 requests per hour for unauthenticated users
- Proper error handling for rate limit exceeded

## License

This project is licensed under the terms of the MIT license.
