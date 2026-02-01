# Q-AI Frontend

React-based frontend for the Q-AI Quantum Computing Interface with Three.js 3D visualization.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production
```bash
npm build
```

## Prerequisites

- **Backend**: Make sure the FastAPI backend is running on port 8000
  ```bash
  cd ..
  python -m uvicorn app:app --reload --port 8000
  ```

## Features

### ✅ Health Check Component
- Test backend connectivity
- Real-time API response display
- Error handling with helpful messages

### ✅ 3D Quantum Gate Visualization
- Rotating cube representing a quantum gate
- Interactive camera controls (orbit, zoom)
- Grid floor for spatial reference
- Multi-light setup for depth perception

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **Drei** - Helper components for R3F

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── HealthCheck.jsx    # Backend health check UI
│   │   ├── Canvas3D.jsx        # 3D scene container
│   │   └── RotatingCube.jsx    # Animated cube mesh
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies
```

## Troubleshooting

### PowerShell Script Execution Error
If you see "running scripts is disabled", use Command Prompt instead or run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### CORS Errors
Make sure:
1. Backend is running on port 8000
2. Frontend is running on port 5173
3. Backend has CORS middleware configured (already done in `app.py`)

### Dependencies Won't Install
Try clearing npm cache:
```bash
npm cache clean --force
npm install
```

## Next Steps

- Connect to quantum circuit API endpoint (`/backend/api`)
- Display quantum measurement results
- Visualize quantum circuits in 3D
- Add real-time quantum simulations
