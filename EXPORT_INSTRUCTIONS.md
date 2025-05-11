# Exporting Code to GitHub Repository

Follow these instructions to export the code from your current environment and import it to the specified GitHub repository.

## Prerequisites

- Git installed on your local machine
- GitHub account with access to the repository: https://github.com/wainfoundation/Trend-Forge-Global-Insights.git
- SSH key or GitHub credentials configured

## Steps to Export and Import Code

### 1. Clone the Target Repository

First, clone the target repository to your local machine:

```bash
git clone https://github.com/wainfoundation/Trend-Forge-Global-Insights.git
cd Trend-Forge-Global-Insights
```

### 2. Copy Your Code Files

Copy all your code files from your current environment to the cloned repository directory. Make sure to include all necessary files, especially the ones related to Pi SDK integration:

- utils/pi-sdk.ts
- app/_layout.tsx
- index.html
- app.config.js
- .env.example
- public/manifest.json
- components/AuthModal.tsx
- components/RewardedAdButton.tsx
- app/donations.tsx
- app/subscription-plans.tsx
- And all other project files

### 3. Add Files to Git

Add all the files to git:

```bash
git add .
```

### 4. Commit Your Changes

Commit your changes with a descriptive message:

```bash
git commit -m "Initial import of Trend Forge application with Pi SDK integration"
```

### 5. Push to GitHub

Push your changes to the GitHub repository:

```bash
git push origin main
```

Note: If the repository uses a different default branch (like `master`), replace `main` with the appropriate branch name.

### 6. Verify the Import

Visit https://github.com/wainfoundation/Trend-Forge-Global-Insights to verify that your code has been successfully imported.

## Troubleshooting

### Permission Issues

If you encounter permission issues when pushing to the repository, make sure:

1. You have the correct access rights to the repository
2. Your SSH key is properly set up with GitHub
3. You're using the correct GitHub credentials

### Large Files

If you have large files that exceed GitHub's file size limits:

1. Consider using Git LFS (Large File Storage)
2. Or exclude large binary files from the repository

### Conflicts

If there are conflicts with existing files in the repository:

1. Pull the latest changes: `git pull origin main`
2. Resolve any conflicts
3. Commit and push again

## Important Notes

- Make sure not to include sensitive information like API keys in your commits
- Use environment variables for sensitive information
- Include a comprehensive README.md file to help others understand your project
