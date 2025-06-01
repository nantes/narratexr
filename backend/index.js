const express = require('express');
const path = require('path'); // Corrected typo
const game = require('./game/gameState');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json()); // Middleware to parse JSON bodies

// Initialize game data when server starts
if (!game.loadGameData()) {
  console.error("Failed to load game data. Server cannot start properly.");
  // Optionally, exit if game data is critical: process.exit(1);
}

// API Endpoint to get the current game state
app.get('/api/game', (req, res) => {
  const currentScene = game.getCurrentScene();
  if (!currentScene) {
    return res.status(500).json({ error: "Game not initialized or scene not found." });
  }
  res.json(currentScene);
});

// API Endpoint to update the game state based on player choice
app.post('/api/game/choice', (req, res) => {
  const { choiceIndex } = req.body;

  if (typeof choiceIndex !== 'number') {
    return res.status(400).json({ error: "Invalid choice index provided." });
  }

  if (!game.chooseNextScene(choiceIndex)) {
    // chooseNextScene logs errors internally, but we should let the client know.
    // Check what the current scene ID is to see if it's a bad choice for a valid scene, or if the scene itself is bad
    const currentSceneExists = game.getCurrentSceneId() && game.getRawScenesData().scenes[game.getCurrentSceneId()];
    if (!currentSceneExists) {
         return res.status(500).json({ error: "Current scene data is invalid or missing."});
    }
    // If scene exists, it implies the choice was bad for that scene
    return res.status(400).json({ error: "Invalid choice for the current scene." });
  }

  const nextScene = game.getCurrentScene();
  res.json(nextScene);
});

// API Endpoint to reset the game (loads initial scene)
app.post('/api/game/reset', (req, res) => {
  if (game.loadGameData()) { // This reloads scenes.json and resets currentSceneId & inventory
    res.json(game.getCurrentScene());
  } else {
    res.status(500).json({ error: "Failed to reset game data." });
  }
});

// --- More advanced save/load endpoints (conceptual for now) ---
// app.post('/api/game/save', (req, res) => {
//   game.saveGameState(); // Implement actual saving logic in gameState.js
//   res.json({ message: "Game state saved (conceptual)." });
// });

// app.post('/api/game/load', (req, res) => {
//   if (game.loadSavedGameState()) { // Implement actual loading logic in gameState.js
//     res.json(game.getCurrentScene());
//   } else {
//     res.status(500).json({ error: "Failed to load saved game state." });
//   }
// });


app.listen(PORT, () => {
  console.log(`Narrative engine server running on http://localhost:${PORT}`);
});
