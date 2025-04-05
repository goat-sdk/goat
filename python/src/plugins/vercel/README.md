# Vercel Plugin for GOAT SDK

A plugin for the GOAT SDK that provides Vercel deployment and project management functionality.

## Installation

```bash
# Install the plugin
poetry add goat-sdk-plugin-vercel
```

## Usage

```python
from goat_plugins.vercel import vercel, VercelPluginOptions

# Initialize the plugin with your Vercel API key
options = VercelPluginOptions(
    api_key="your-vercel-api-key"
)
plugin = vercel(options)
```

## Features

### Project Management
- Create new Vercel projects
- Configure project settings
- Support for team-based projects

### Deployment
- Deploy projects to Vercel
- Configure deployment settings
- Set environment variables
- Custom build commands
- Branch-specific deployments

### Monitoring
- Check deployment status
- Track deployment progress
- View deployment history

## API Reference

### Create Project
```python
await plugin.create_project({
    "project_name": "my-app",
    "framework": "nextjs",
    "git_repository": "https://github.com/username/repo",
    "team_id": "optional-team-id"
})
```

### Deploy Project
```python
await plugin.deploy_project({
    "project_name": "my-app",
    "framework": "nextjs",
    "git_repository": "https://github.com/username/repo",
    "branch": "main",
    "environment_variables": {"API_KEY": "secret"},
    "build_command": "npm run build",
    "output_directory": "dist",
    "team_id": "optional-team-id"
})
```

### Get Deployment Status
```python
await plugin.get_deployment_status({
    "project_name": "my-app"
})
```

## Supported Frameworks
- Next.js
- React
- Vue
- Svelte
- And other Vercel-supported frameworks

## Requirements
- Vercel API key
- Python 3.7+
- aiohttp library

## License

This project is licensed under the terms of the MIT license.
