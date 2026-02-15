# Klara Konkel Portfolio Website

A modern portfolio website built with React, TypeScript, and cutting-edge web technologies.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or later) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm (comes with Node.js)

### Local Development Setup

```sh
# Install dependencies
npm install

# Start development server (will open http://localhost:5173 automatically)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Development Features

- **Hot Reload**: Instant updates during development
- **Optimized**: Configured for optimal development experience
- **TypeScript**: Full type safety and IntelliSense
- **Modern Tooling**: Vite for blazing-fast builds

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 📦 Deployment

### GitHub Pages (recommended)

The repo is set up to deploy automatically on push to `main`:

1. In your GitHub repo go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`; the workflow builds the site and deploys it.
4. The site will be at `https://<username>.github.io/<repo-name>/`.

Local builds use base `/`. The workflow sets `VITE_BASE_URL` so assets and routes work on GitHub Pages.

### Other hosts

- **Vercel / Netlify**: Connect the repo or upload the `dist` folder after `npm run build`.
- **Any static host**: Upload the contents of `dist`.

## 🎯 Performance Features

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components load on demand
- **Optimized Assets**: Images and fonts are optimized for web
- **Modern Bundle**: Uses latest web technologies for optimal performance
