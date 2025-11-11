# Smart Parking System - Frontend

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:5000/api
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Deployment

#### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
- `VITE_API_URL`: Your backend API URL

#### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist` folder to Netlify

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Deploy to GitHub Pages

Add to `package.json`:
```json
"homepage": "https://yourusername.github.io/parking-frontend"
```

Install gh-pages:
```bash
npm install --save-dev gh-pages
```

Add scripts to `package.json`:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

Deploy:
```bash
npm run deploy
```

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api)

## Features

- **Driver Features:**
  - Register and login
  - Add vehicles
  - Reserve parking spots
  - Make payments
  - View reservations

- **Admin Features:**
  - Manage parking slots
  - Generate reports
  - Validate tickets
  - View analytics

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Axios
- React Router
- Zod (validation)
