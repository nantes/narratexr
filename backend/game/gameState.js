const fs = require('fs');
const path = require('path');

const SCENES_FILE = path.join(__dirname, 'scenes.json');

let scenesData;
let currentSceneId;
let playerInventory = [];
let npcStates = {}; // Store current state of NPCs

// Load scene data from scenes.json
function loadGameData() {
  try {
    const rawData = fs.readFileSync(SCENES_FILE, 'utf8');
    scenesData = JSON.parse(rawData);
    currentSceneId = scenesData.initialScene;
    playerInventory = []; // Reset inventory
    npcStates = JSON.parse(JSON.stringify(scenesData.npcs || {})); // Load initial NPC states
    console.log("Game data loaded successfully. Initial scene:", currentSceneId);
    console.log("Initial NPC states:", npcStates);
    return true;
  } catch (error) {
    console.error("Error loading game data:", error);
    return false;
  }
}

// Get the current scene object
function getCurrentScene() {
  if (!scenesData || !scenesData.scenes[currentSceneId]) {
    console.error("Current scene not found:", currentSceneId);
    return null;
  }
  let scene = scenesData.scenes[currentSceneId];

  // Handle dynamic scenes that derive content from another scene (e.g., for NPC interactions)
  if (scene.isDynamicScene && scene.dynamicSource && scenesData.scenes[scene.dynamicSource]) {
    const sourceScene = scenesData.scenes[scene.dynamicSource];
    scene = { ...sourceScene, ...scene, text: scene.text || sourceScene.text }; // Overlay dynamic scene props
  }

  const npcInfo = getNPCInfoForScene(scene);

  return {
    id: currentSceneId,
    text: scene.text,
    choices: scene.choices,
    inventory: [...playerInventory],
    npc: npcInfo, // Add NPC info to the response
  };
}

// Helper function to get NPC information for the current scene
function getNPCInfoForScene(scene) {
  if (!scene.npc || !scene.npc.name) {
    return null;
  }

  const npcDefinition = scene.npc;
  const npcGlobalState = npcStates[npcDefinition.name] || {};
  let currentDialogue = npcDefinition.defaultDialogue;

  if (npcDefinition.states) {
    for (const state of npcDefinition.states) {
      let conditionMet = true;
      if (state.condition) {
        // Extend with more conditions as needed (e.g., npcMood, previousChoices)
        if (state.condition.item) {
          const hasItem = playerInventory.includes(state.condition.item);
          if (state.condition.present && !hasItem) conditionMet = false;
          if (!state.condition.present && hasItem) conditionMet = false;
        }
        // Example: Check NPC mood from npcStates
        // if (state.condition.mood && npcGlobalState.mood !== state.condition.mood) {
        //   conditionMet = false;
        // }
      }
      if (conditionMet) {
        currentDialogue = state.dialogue;
        // Potentially update NPC's global state if this state implies a change
        // For example, if talking to NPC changes their mood:
        // if (state.setsMood) npcStates[npcDefinition.name].mood = state.setsMood;
        break;
      }
    }
  }

  return {
    name: npcDefinition.name,
    dialogue: currentDialogue,
    // Potentially add other NPC attributes like sprite or mood from npcGlobalState
    mood: npcGlobalState.mood
  };
}

// Update the game state based on player choice
function chooseNextScene(choiceIndex) {
  if (!scenesData || !scenesData.scenes[currentSceneId]) {
    console.error("Cannot choose next scene, current scene data is missing.");
    return false;
  }

  const currentScene = scenesData.scenes[currentSceneId];
  if (!currentScene.choices || choiceIndex < 0 || choiceIndex >= currentScene.choices.length) {
    console.error("Invalid choice index:", choiceIndex);
    return false;
  }

  const choice = currentScene.choices[choiceIndex];
  if (!scenesData.scenes[choice.target]) {
    console.error("Target scene not found for choice:", choice.target);
    return false;
  }

  currentSceneId = choice.target;

  // Check if the new scene adds an item
  const newSceneData = scenesData.scenes[currentSceneId];
  if (newSceneData.addItem) {
    if (!playerInventory.includes(newSceneData.addItem)) {
      playerInventory.push(newSceneData.addItem);
      // console.log(`Item added to inventory: ${newSceneData.addItem}`); // Reduced verbosity
    }
  }

  // console.log("Scene updated to:", currentSceneId); // Reduced verbosity
  return true;
}

// For simplicity, save/load will just reset the game state for now
// A more persistent save/load can be implemented with file writes if needed.

function saveGameState() {
  // This could write currentSceneId and playerInventory to a file
  // console.log("Game state save requested (not implemented for persistence yet)."); // Reduced verbosity
  // For now, it's just in memory.
}

function loadSavedGameState() {
  // This could read from a file
  // console.log("Load saved game state requested (not implemented for persistence yet)."); // Reduced verbosity
  // For now, it just ensures game data is loaded (which happens at start).
  if (!scenesData) {
    return loadGameData();
  }
  return true;
}

// Initialize game data when the module is loaded
loadGameData();

module.exports = {
  loadGameData,
  getCurrentScene,
  chooseNextScene,
  saveGameState,
  loadSavedGameState,
  // Expose for potential API use or testing
  getRawScenesData: () => scenesData,
  getCurrentSceneId: () => currentSceneId,
  getPlayerInventory: () => playerInventory,
  getNpcStates: () => npcStates // For debugging or more complex interactions
};
