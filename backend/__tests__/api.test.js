const request = require('supertest');
const app = require('../index'); // Import the configured Express app
const gameState = require('../game/gameState'); // Used for direct state checks & mocking fs for it
const fs = require('fs'); // For mocking

jest.mock('fs'); // Mock fs for the entire test file to control scenes.json reading

const mockScenesDataForApi = {
  initialScene: "api_start",
  scenes: {
    "api_start": {
      text: "API Start",
      choices: [{ text: "Choice 1", target: "api_scene2" }],
      npc: { name: "API NPC", defaultDialogue: "Hello from API", states: [] }
    },
    "api_scene2": {
      text: "API Scene 2",
      addItem: "api_item",
      choices: [{ text: "Go back", target: "api_start" }]
    }
  },
  npcs: { "API NPC": { mood: "neutral" } }
};

// No need to recreate routes, they are in the imported app.

describe('Game API Endpoints', () => {
  beforeEach(() => {
    // Provide the mock implementation for fs.readFileSync for gameState
    fs.readFileSync.mockReturnValue(JSON.stringify(mockScenesDataForApi));
    // Reload game data within gameState to use the mocked scenes.json
    // This is important because the app itself will use the gameState module.
    gameState.loadGameData();
  });

  describe('GET /api/game', () => {
    it('should return the initial game state', async () => {
      const response = await request(app).get('/api/game');
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe('api_start');
      expect(response.body.text).toBe('API Start');
      expect(response.body.npc.name).toBe('API NPC');
    });
  });

  describe('POST /api/game/choice', () => {
    it('should update game state and return the new scene on valid choice', async () => {
      const response = await request(app)
        .post('/api/game/choice')
        .send({ choiceIndex: 0 });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe('api_scene2');
      expect(response.body.text).toBe('API Scene 2');
      // Check if item was added (as per mockScenesDataForApi behavior for api_scene2)
      // This requires peeking into the actual gameState module.
      expect(gameState.getPlayerInventory()).toContain('api_item');
    });

    it('should return 400 for an invalid choice index', async () => {
      const response = await request(app)
        .post('/api/game/choice')
        .send({ choiceIndex: 99 }); // Invalid index

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Invalid choice for the current scene.');
    });

    it('should return 400 if choiceIndex is not a number', async () => {
      const response = await request(app)
        .post('/api/game/choice')
        .send({ choiceIndex: "not-a-number" });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Invalid choice index provided.');
    });
  });

  describe('POST /api/game/reset', () => {
    it('should reset the game state and return the initial scene', async () => {
      // Make a choice first to change state
      await request(app).post('/api/game/choice').send({ choiceIndex: 0 });
      // Verify state changed by checking the actual gameState module
      expect(gameState.getCurrentScene().id).toBe('api_scene2');

      // Now reset
      const response = await request(app).post('/api/game/reset');

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe('api_start');
      expect(response.body.text).toBe('API Start');
      expect(gameState.getPlayerInventory().length).toBe(0); // Inventory should be cleared
    });
  });
});
