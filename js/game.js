import * as THREE from 'three';
import { WorldGenerator } from './world.js';
import { Player } from './player.js';
import { InputHandler } from './input.js';
import { CONFIG } from '../config.js';

export class Game {
  constructor(canvas, networkManager, uiManager) {
    this.canvas = canvas;
    this.networkManager = networkManager;
    this.uiManager = uiManager;
    this.running = false;
    this.players = new Map(); // All players including local player
    this.localPlayer = null;
    
    // Set up the renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Set up the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.WORLD.BACKGROUND_COLOR);
    
    // Set up the camera
    this.camera = new THREE.OrthographicCamera(
      window.innerWidth / -CONFIG.CAMERA.ZOOM,
      window.innerWidth / CONFIG.CAMERA.ZOOM,
      window.innerHeight / CONFIG.CAMERA.ZOOM,
      window.innerHeight / -CONFIG.CAMERA.ZOOM,
      0.1,
      1000
    );
    this.camera.position.z = 10;
    
    // Set up lighting
    this.setupLighting();
    
    // Create the world
    this.world = new WorldGenerator(this.scene);
    
    // Set up input handler
    this.inputHandler = new InputHandler(this.canvas);
    
    // Set up the animation loop
    this.lastTime = 0;
    this.accumulator = 0;
    this.timeStep = 1 / 60; // 60 fps physics
  }
  
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffeecc, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
  }
  
  init() {
    // Generate the world
    this.world.generate();
    
    // Set up network event handlers
    this.setupNetworkHandlers();
  }
  
  setupNetworkHandlers() {
    // Handle player join
    this.networkManager.onPlayerJoin = (playerData) => {
      this.addPlayer(playerData);
    };
    
    // Handle player leave
    this.networkManager.onPlayerLeave = (clientId) => {
      this.removePlayer(clientId);
    };
    
    // Handle player updates
    this.networkManager.onPlayerUpdate = (playerData) => {
      this.updatePlayer(playerData);
    };
    
    // Handle chat messages
    this.networkManager.onChatMessage = (message) => {
      this.uiManager.addChatMessage(message);
    };
  }
  
  start() {
    if (this.running) return;
    
    this.running = true;
    
    // Create the local player
    const username = this.uiManager.getUsername();
    this.localPlayer = new Player(username, this.networkManager.getClientId(), true);
    this.scene.add(this.localPlayer.getObject());
    this.players.set(this.networkManager.getClientId(), this.localPlayer);
    
    // Connect to the server
    this.networkManager.connect(username);
    
    // Start the game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  gameLoop(time) {
    if (!this.running) return;
    
    // Convert to seconds
    time *= 0.001;
    
    // Calculate delta time
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    
    // Update with fixed time step
    this.accumulator += deltaTime;
    while (this.accumulator >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulator -= this.timeStep;
    }
    
    // Render
    this.render();
    
    // Queue next frame
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  update(deltaTime) {
    // Process inputs for local player
    if (this.localPlayer) {
      const movement = this.inputHandler.getMovement();
      if (movement.x !== 0 || movement.y !== 0) {
        this.localPlayer.move(movement.x, movement.y, deltaTime);
        
        // Update camera position to follow player
        const playerPos = this.localPlayer.getPosition();
        this.camera.position.x = playerPos.x;
        this.camera.position.y = playerPos.y;
        
        // Send position update to other players
        this.networkManager.sendPlayerUpdate({
          position: playerPos,
          direction: this.localPlayer.getDirection()
        });
      }
    }
    
    // Update all players
    for (const player of this.players.values()) {
      player.update(deltaTime);
    }
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  
  addPlayer(playerData) {
    if (playerData.clientId === this.networkManager.getClientId()) return;
    
    const player = new Player(playerData.username, playerData.clientId, false);
    if (playerData.position) {
      player.setPosition(playerData.position.x, playerData.position.y);
    }
    if (playerData.direction) {
      player.setDirection(playerData.direction);
    }
    
    this.scene.add(player.getObject());
    this.players.set(playerData.clientId, player);
    
    console.log(`Player ${playerData.username} joined the game`);
  }
  
  removePlayer(clientId) {
    const player = this.players.get(clientId);
    if (player) {
      this.scene.remove(player.getObject());
      this.players.delete(clientId);
      console.log(`Player ${player.getUsername()} left the game`);
    }
  }
  
  updatePlayer(playerData) {
    const player = this.players.get(playerData.clientId);
    if (player && !player.isLocal()) {
      if (playerData.position) {
        player.setPosition(playerData.position.x, playerData.position.y);
      }
      if (playerData.direction) {
        player.setDirection(playerData.direction);
      }
    }
  }
  
  handleResize() {
    // Update renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update camera frustum
    this.camera.left = window.innerWidth / -CONFIG.CAMERA.ZOOM;
    this.camera.right = window.innerWidth / CONFIG.CAMERA.ZOOM;
    this.camera.top = window.innerHeight / CONFIG.CAMERA.ZOOM;
    this.camera.bottom = window.innerHeight / -CONFIG.CAMERA.ZOOM;
    this.camera.updateProjectionMatrix();
  }
}

