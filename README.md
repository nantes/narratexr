# Interactive Narrative Engine

This project is an Interactive Narrative Engine with Dynamic AI, Visual Elements, and XR Exploration. It allows users to play through interactive stories where their choices affect the outcome.

## Project Structure

- `frontend/`: Contains the React frontend application.
  - `src/`: Source files for the React application.
  - `public/`: Public assets for the frontend.
- `backend/`: Contains the Node.js/Express backend application.
  - `game/`: Core game logic and data.
    - `scenes.json`: Defines the narrative scenes, choices, and NPC interactions.
    - `gameState.js`: Manages the game state.
  - `__tests__/`: Jest test files.
  - `index.js`: Express server setup and API endpoints.

## Setup and Running the Project

### Prerequisites

- Node.js and npm installed.

### Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   The backend server will run on `http://localhost:3001`.

### Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```
   The frontend application will open in your browser at `http://localhost:3000`.

## Features

- Interactive narrative with branching choices.
- Basic 2D visual elements.
- NPC with conditional dialogue.
- "Take Photo" feature to capture screenshots.
- Experimental WebXR (AR) integration.

## Known Issues

- **API Integration Tests:** The integration tests for the API endpoints (`backend/__tests__/api.test.js`) are written but could not be executed during development due to an environment-specific issue with resolving the `supertest` module. Unit tests for the core game logic in `gameState.js` are passing.
