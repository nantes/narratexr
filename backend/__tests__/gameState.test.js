// Define mockScenesData at the very top.
const mockScenesData = {
  initialScene: "start",
  scenes: {
    "start": {
      text: "Start scene",
      choices: [
        { text: "Go to forest", target: "forest" },
        { text: "Take item", target: "item_room" }
      ],
      npc: {
        name: "Guide",
        defaultDialogue: "Hello adventurer!",
        states: [
          { id: "has_key", dialogue: "You have the key!", condition: { item: "key", present: true } },
          { id: "no_key", dialogue: "You need a key.", condition: { item: "key", present: false } }
        ]
      }
    },
    "forest": {
      text: "Forest scene",
      choices: [
        { text: "Go back", target: "start" }
      ]
    },
    "item_room": {
      text: "You found a key!",
      addItem: "key",
      choices: [
        { text: "Go back", target: "start" }
      ]
    }
  },
  npcs: {
    "Guide": { "mood": "neutral" }
  }
};

const fs = require('fs'); // require actual fs for jest.requireActual

// Mock fs.readFileSync using the mockScenesData defined above.
// This mock is hoisted.
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(() => JSON.stringify(mockScenesData)), // Use a function to ensure closure capture
}));

const gameState = require('../game/gameState'); // gameState will be loaded with fs mocked

describe('Game State Logic', () => {
  beforeEach(() => {
    // Ensure fs.readFileSync is correctly mocked for each test (if needing different data per test)
    // For this suite, it's consistently mockScenesData.
    // The initial loadGameData() call at module import time uses the mock defined in jest.mock()
    // This call ensures that state is reset using the same mock for subsequent tests.
    fs.readFileSync.mockReturnValue(JSON.stringify(mockScenesData)); // Reinforce or change mock for specific tests if needed
    gameState.loadGameData();
  });

  test('should load initial game state correctly', () => {
    const currentScene = gameState.getCurrentScene();
    expect(currentScene.id).toBe('start');
    expect(currentScene.text).toBe('Start scene');
    expect(currentScene.choices.length).toBe(2);
    expect(gameState.getPlayerInventory().length).toBe(0);
  });

  test('should transition to another scene based on choice', () => {
    gameState.chooseNextScene(0); // "Go to forest"
    const currentScene = gameState.getCurrentScene();
    expect(currentScene.id).toBe('forest');
    expect(currentScene.text).toBe('Forest scene');
  });

  test('should handle invalid choice index', () => {
    const initialSceneId = gameState.getCurrentScene().id;
    const result = gameState.chooseNextScene(99); // Invalid index
    expect(result).toBe(false);
    expect(gameState.getCurrentScene().id).toBe(initialSceneId); // Scene should not change
  });

  test('should add item to inventory', () => {
    expect(gameState.getPlayerInventory()).not.toContain('key');
    gameState.chooseNextScene(1); // "Take item" -> moves to item_room
    // In item_room, the key is automatically added. Then we choose to go back.
    // The chooseNextScene for "Take item" updates currentSceneId to "item_room".
    // The item "key" is added when currentSceneId becomes "item_room".
    expect(gameState.getPlayerInventory()).toContain('key');
  });

  test('should reflect inventory changes in subsequent scene loads/choices', () => {
    // Go to item room and pick up key
    gameState.chooseNextScene(1); // Choice to go to item_room (adds key)
    expect(gameState.getPlayerInventory()).toContain('key');

    // Go back to start scene
    gameState.chooseNextScene(0); // Choice in item_room to go back to start
    expect(gameState.getCurrentScene().id).toBe('start');

    // NPC dialogue should now reflect that player has the key
    const sceneWithNpc = gameState.getCurrentScene();
    expect(sceneWithNpc.npc.dialogue).toBe("You have the key!");
  });


  test('NPC dialogue should change based on inventory (item present)', () => {
    // Simulate picking up the key
    gameState.chooseNextScene(1); // Go to item_room, key is added
    gameState.chooseNextScene(0); // Go back to start

    const currentScene = gameState.getCurrentScene();
    expect(currentScene.id).toBe('start'); // Ensure we are back at the start
    expect(currentScene.npc).toBeDefined();
    expect(currentScene.npc.name).toBe("Guide");
    expect(currentScene.npc.dialogue).toBe("You have the key!");
  });

  test('NPC dialogue should be default when required item is not present', () => {
    const currentScene = gameState.getCurrentScene(); // Initial state, no key
    expect(currentScene.id).toBe('start');
    expect(currentScene.npc).toBeDefined();
    expect(currentScene.npc.name).toBe("Guide");
    expect(currentScene.npc.dialogue).toBe("You need a key.");
  });

  test('should reset game state correctly', () => {
    // Make some changes
    gameState.chooseNextScene(1); // Go to item_room, adds "key"
    expect(gameState.getPlayerInventory()).toContain('key');
    gameState.chooseNextScene(0); // Go back to start
    gameState.chooseNextScene(0); // Go to forest
    expect(gameState.getCurrentScene().id).toBe('forest');

    // Reset
    gameState.loadGameData();

    const currentScene = gameState.getCurrentScene();
    expect(currentScene.id).toBe('start');
    expect(gameState.getPlayerInventory().length).toBe(0);
    expect(currentScene.npc.dialogue).toBe("You need a key."); // NPC state also reset
  });

});
