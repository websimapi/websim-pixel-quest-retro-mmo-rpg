import * as THREE from 'three';
import { Game } from './game.js';
import { NetworkManager } from './network.js';
import { UIManager } from './ui.js';
import { CONFIG } from '../config.js';

// Initialize the main application
document.addEventListener('DOMContentLoaded', () => {
  const gameCanvas = document.getElementById('game-canvas');
  
  // Initialize networking
  const networkManager = new NetworkManager();
  
  // Initialize UI Manager
  const uiManager = new UIManager(networkManager);
  
  // Initialize the game with the canvas and managers
  const game = new Game(gameCanvas, networkManager, uiManager);
  
  // Setup event listener for the start button
  document.getElementById('start-game-btn').addEventListener('click', () => {
    const username = document.getElementById('username-input').value.trim();
    if (username) {
      uiManager.startGame(username);
      game.start();
    } else {
      alert('Please enter a username');
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    game.handleResize();
  });
  
  // Start the initialization process
  game.init();
});

