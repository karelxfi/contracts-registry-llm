# Addybook Web UI

Smart contract address registry for 4,400+ DeFi protocols across 100+ blockchain networks.

## Project Info

**URL**: https://addybook.xyz
**API**: https://addybook.apidocumentation.com/addybook-api

## Local Development

Requirements: Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Clone the repository
git clone https://github.com/karelxfi/contracts-registry-llm.git
cd contracts-registry-llm/web

# Install dependencies
npm install

# Start development server
npm run dev
```

## Technologies

- Vite
- TypeScript
- React
- React Router
- shadcn-ui
- Tailwind CSS
- Framer Motion

## Deployment

The web UI is deployed to Cloudflare Workers at addybook.xyz.

To deploy:
```sh
npm run build
# Copy dist/ contents to docs/
# Deploy via Cloudflare Workers
```

## Features

- Search 4,400+ DeFi protocols
- Advanced filtering by category and blockchain
- Favorites system
- Protocol contract address lookup
- Terminal-themed UI
- Keyboard shortcuts (Cmd/Ctrl+K for search)
