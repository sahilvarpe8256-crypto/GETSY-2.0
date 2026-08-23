## Git Workflow

GETSY 2.0 uses a branch-based development workflow.

### Main Branch

`main` contains the stable integrated version of the project.

Team members should not directly develop on `main`.

### Development Branches

Each team member works on a dedicated branch:

- `feature/frontend` → Frontend development
- `feature/backend` → Backend and API development
- `feature/database` → Database development
- `feature/integration` → Integration, testing and documentation

### Basic Workflow

```text
Clone repository
      ↓
Switch to assigned branch
      ↓
Build your assigned feature
      ↓
Test your changes
      ↓
Commit changes
      ↓
Push branch to GitHub
      ↓
Create Pull Request
      ↓
Team leader reviews
      ↓
Merge into main
