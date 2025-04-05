from pydantic import BaseModel, Field
from typing import Optional, List


class VercelDeploymentParameters(BaseModel):
    project_name: str = Field(
        description="Name of the project to deploy"
    )
    framework: str = Field(
        description="Framework to use for deployment (e.g., 'nextjs', 'react', 'vue', 'svelte')"
    )
    git_repository: str = Field(
        description="Git repository URL for the project"
    )
    branch: Optional[str] = Field(
        default="main",
        description="Git branch to deploy from"
    )
    environment_variables: Optional[dict] = Field(
        default={},
        description="Environment variables to set for the deployment"
    )
    build_command: Optional[str] = Field(
        default=None,
        description="Custom build command to use"
    )
    output_directory: Optional[str] = Field(
        default=None,
        description="Directory containing the build output"
    )
    team_id: Optional[str] = Field(
        default=None,
        description="Vercel team ID if deploying to a team"
    )


class VercelProjectParameters(BaseModel):
    project_name: str = Field(..., description="Name of the Vercel project")
    framework: Optional[str] = Field(None, description="Framework preset to use (e.g., 'nextjs', 'react', 'vue', etc.)")
    git_repository: Optional[str] = Field(None, description="GitHub repository to link with the project")


class VercelDeployParameters(BaseModel):
    repo_name: str = Field(..., description="Name of the repository to deploy")
    branch_name: str = Field(..., description="Name of the branch to deploy")
    project_name: Optional[str] = Field(None, description="Name of the Vercel project. If not provided, will use repo name")
    framework: Optional[str] = Field(None, description="Framework preset to use (e.g., 'nextjs', 'react', 'vue', etc.)")
    environment_variables: Optional[dict] = Field(None, description="Environment variables to set for the deployment")
