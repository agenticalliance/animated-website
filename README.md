# Agentic Alliance Website

Agentic Alliance website landing page - A React + Vite application with ThreeJS integration.

## 🚀 Live Site

Visit the live site at: [https://agenticalliance.com](https://agenticalliance.com)

## 🛠️ Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- ThreeJS (@react-three/fiber & @react-three/drei)
- shadcn/ui components
- React Router

## 📋 Development

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Setup and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 GitHub Pages Deployment

This project is configured to deploy automatically to GitHub Pages using GitHub Actions:

1. Any push to the `main` branch triggers the deployment workflow
2. The GitHub Action will build the site and deploy it to the `gh-pages` branch
3. The site will be available at the custom domain: https://agenticalliance.com

The custom domain is configured using a CNAME file in the repository. GitHub Pages will automatically use this for your domain configuration.

You can also manually trigger the deployment from the Actions tab in the GitHub repository.