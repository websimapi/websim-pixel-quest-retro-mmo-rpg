// Game configuration
export const CONFIG = {
  // World settings
  WORLD: {
    SIZE: 50, // World size in tiles
    TILE_SIZE: 1, // Size of each tile
    BACKGROUND_COLOR: 0x6bb646, // Default grass color
  },
  
  // Camera settings
  CAMERA: {
    ZOOM: 20, // Camera zoom factor
    FOV: 60, // Field of view (degrees)
    NEAR: 0.1, // Near plane
    FAR: 1000, // Far plane
  },
  
  // Player settings
  PLAYER: {
    SPEED: 5, // Movement speed
    DEFAULT_HEALTH: 100,
    DEFAULT_LEVEL: 1,
    INTERACTION_DISTANCE: 2, // Distance at which player can interact with objects
  },
  
  // Game settings
  GAME: {
    MAX_PLAYERS_PER_ZONE: 20,
    TICK_RATE: 60, // Game loop ticks per second
  },
  
  // Debug settings
  DEBUG: {
    ENABLED: false,
    SHOW_GRID: false,
    SHOW_COLLISION: false,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
  }
};

