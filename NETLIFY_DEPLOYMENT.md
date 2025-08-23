# Netlify Deployment Guide with Bun 🔥

## 🚀 Quick Deployment Steps

### 1. Connect Your Repository

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your GitHub/GitLab/Bitbucket repository
4. Select this repository (`bau-cua`)

### 2. Build Settings

Netlify should automatically detect your settings from `netlify.toml`, but verify:

- **Build command**: `curl -fsSL https://bun.sh/install | bash && export PATH="$HOME/.bun/bin:$PATH" && bun install && bun run build`
- **Publish directory**: `.next`
- **Node.js version**: 18
- **Package manager**: Bun (auto-installed during build)

### 3. Environment Variables (if needed)

Add any required environment variables in Netlify dashboard:

- Go to Site settings → Environment variables
- Add your environment variables (e.g., API keys, database URLs)

### 4. Domain Settings

- Your site will get a random Netlify subdomain
- You can change it in Site settings → Domain management
- Add custom domain if needed

## 📋 Pre-deployment Checklist

- [x] `netlify.toml` configuration created
- [x] `public/_redirects` file for routing
- [x] ESLint configured to not block builds
- [ ] Environment variables configured (if needed)
- [ ] Test build locally: `bun run build`

## 🔧 Local Testing

Test your build locally before deploying:

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Build the project
bun run build

# Start production server locally
bun start
```

## 🌐 Features Configured

- ✅ Next.js optimization
- ✅ Internationalization support
- ✅ Static asset caching
- ✅ Security headers
- ✅ ESLint skip during build
- ✅ Proper redirects for SPA routing

## 🐛 Troubleshooting

### Build Fails

- Check build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Test `bun run build` locally first
- Ensure Bun installation succeeded in build logs

### Routing Issues

- Verify `_redirects` file is in `public/` directory
- Check locale routing configuration

### Performance

- Enable Netlify's asset optimization
- Consider enabling Netlify Functions for API routes

## 📚 Useful Commands

```bash
# Local development
bun dev

# Build for production
bun run build

# Start production server
bun start

# Lint code
bun run lint

# Install dependencies
bun install

# Add new package
bun add <package-name>
```

## ⚡ Why Bun?

- **Faster installs**: Up to 10x faster than npm/yarn
- **Built-in bundler**: Native TypeScript support
- **Drop-in replacement**: Compatible with npm packages
- **Smaller builds**: Optimized bundling and tree-shaking
