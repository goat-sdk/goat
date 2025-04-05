from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class CreateRepositoryParameters(BaseModel):
    name: str = Field(..., description="Name of the repository to create")
    description: Optional[str] = Field(None, description="Description of the repository. Optional.")
    private: bool = Field(False, description="Whether the repository should be private. Defaults to public.")


class CreateCommitParameters(BaseModel):
    repo_name: str = Field(..., description="Name of the repository to commit to")
    file_path: str = Field(..., description="Path to the file in the repository (e.g., 'src/main.py')")
    content: str = Field(..., description="Content of the file to commit")
    message: str = Field(..., description="Commit message describing the changes")


class ListRepositoriesParameters(BaseModel):
    """Parameters for listing repositories. No parameters needed."""
    model_config = ConfigDict(
        json_schema_extra={
            "type": "object",
            "properties": {},
            "required": []
        }
    )


class CreateBranchParameters(BaseModel):
    repo_name: str = Field(..., description="Name of the repository")
    branch_name: str = Field(..., description="Name of the new branch to create")
    base_branch: str = Field("main", description="The branch to base the new branch on. Defaults to 'main'.")


class DeleteBranchParameters(BaseModel):
    repo_name: str = Field(..., description="Name of the repository")
    branch_name: str = Field(..., description="Name of the branch to delete")


class AddCollaboratorParameters(BaseModel):
    repo_name: str = Field(..., description="Name of the repository")
    username: str = Field(..., description="GitHub username of the collaborator to add")
    permission: str = Field("push", description="Permission level for the collaborator. Can be 'pull', 'push', 'admin', 'maintain', 'triage'. Defaults to 'push'.")


class RemoveCollaboratorParameters(BaseModel):
    repo_name: str = Field(..., description="Name of the repository")
    username: str = Field(..., description="GitHub username of the collaborator to remove")


class UpdateRepositoryVisibilityParameters(BaseModel):
    repo_name: str = Field(..., description="Name of the repository")
    private: bool = Field(..., description="Whether the repository should be private (True) or public (False)")


class CreateIssueParameters(BaseModel):
    repo_name: str = Field(..., description="Name of the repository")
    title: str = Field(..., description="Title of the issue")
    body: str = Field(..., description="Description of the issue")
    labels: Optional[List[str]] = Field(None, description="List of labels to add to the issue")


class CreatePullRequestParameters(BaseModel):
    repo_name: str = Field(..., description="Name of the repository")
    title: str = Field(..., description="Title of the pull request")
    body: str = Field(..., description="Description of the pull request")
    head: str = Field(..., description="The name of the branch where your changes are implemented")
    base: str = Field("main", description="The name of the branch you want the changes pulled into")


class MergePullRequestParameters(BaseModel):
    repo_name: str = Field(..., description="Name of the repository")
    pull_number: int = Field(..., description="The number of the pull request to merge")
    merge_method: str = Field("merge", description="The merge method to use. Can be 'merge', 'squash', or 'rebase'")
    commit_title: Optional[str] = Field(None, description="Title for the automatic commit message")
    commit_message: Optional[str] = Field(None, description="Extra detail to append to automatic commit message")


# Parameter schemas for the tools
CreateRepositorySchema = {
    "name": {
        "type": "string",
        "description": "Name of the repository to create"
    },
    "description": {
        "type": "string",
        "description": "Description of the repository. Optional.",
        "optional": True
    },
    "private": {
        "type": "boolean",
        "description": "Whether the repository should be private. Defaults to public.",
        "default": False
    }
}

CreateCommitSchema = {
    "repo_name": {
        "type": "string",
        "description": "Name of the repository to commit to"
    },
    "file_path": {
        "type": "string",
        "description": "Path to the file in the repository (e.g., 'src/main.py')"
    },
    "content": {
        "type": "string",
        "description": "Content of the file to commit"
    },
    "message": {
        "type": "string",
        "description": "Commit message describing the changes"
    }
}

ListRepositoriesSchema = {}

CreateBranchSchema = {
    "repo_name": {
        "type": "string",
        "description": "Name of the repository"
    },
    "branch_name": {
        "type": "string",
        "description": "Name of the new branch to create"
    },
    "base_branch": {
        "type": "string",
        "description": "The branch to base the new branch on. Defaults to 'main'.",
        "default": "main"
    }
}

DeleteBranchSchema = {
    "repo_name": {
        "type": "string",
        "description": "Name of the repository"
    },
    "branch_name": {
        "type": "string",
        "description": "Name of the branch to delete"
    }
}

AddCollaboratorSchema = {
    "repo_name": {
        "type": "string",
        "description": "Name of the repository"
    },
    "username": {
        "type": "string",
        "description": "GitHub username of the collaborator to add"
    },
    "permission": {
        "type": "string",
        "description": "Permission level for the collaborator. Can be 'pull', 'push', 'admin', 'maintain', 'triage'. Defaults to 'push'.",
        "default": "push"
    }
}

RemoveCollaboratorSchema = {
    "repo_name": {
        "type": "string",
        "description": "Name of the repository"
    },
    "username": {
        "type": "string",
        "description": "GitHub username of the collaborator to remove"
    }
}

UpdateRepositoryVisibilitySchema = {
    "repo_name": {
        "type": "string",
        "description": "Name of the repository"
    },
    "private": {
        "type": "boolean",
        "description": "Whether the repository should be private (True) or public (False)"
    }
}
