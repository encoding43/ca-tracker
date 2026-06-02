# CA Final Tracker

A comprehensive study tracker for CA Final candidates with integrated gym, food, and AI coaching features.

## Features

- **Study Tracking**: Log hours per subject, track topic progress
- **Mock Scores**: Record and analyze mock test performance
- **Gym Logging**: 6-day workout split tracking with streaks
- **Food/Nutrition**: Daily meal logging with discipline tracking
- **AI Coach**: Claude-powered advisor aware of your schedule and progress
- **Subject Overview**: Per-subject progress with confidence ratings
- **Phase Timeline**: Roadmap from articleship to May 2027 exam

## Local Setup

```bash
# Navigate to project
cd ca-tracker

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.

## Deploying to GitHub Pages

### 1. Create a GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/ca-tracker.git
git push -u origin main
```

**Replace `yourusername` with your GitHub username.**

### 2. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages** section
3. Select **Deploy from a branch** under Source
4. Choose `gh-pages` branch (it will be created automatically by the workflow)
5. Save

### 3. Automatic Deployment

The workflow is already configured. Every push to `main` will:
- Build the project
- Deploy to `gh-pages` branch
- Update your live site

### 4. Access Your App

Your app will be live at: `https://yourusername.github.io/ca-tracker`

If deploying to a custom domain, update `base` in `vite.config.js`.

## Build & Deploy Manually

```bash
# Build
npm run build

# The dist folder is ready to deploy
```

## Tech Stack

- React 18
- Vite
- Vanilla CSS
- Claude AI API (for AI Coach feature)

## Notes

- All data is stored in browser localStorage (persists across sessions)
- AI Coach feature requires Anthropic API key (if you enable it)
- Mobile-responsive design

## License

MIT
