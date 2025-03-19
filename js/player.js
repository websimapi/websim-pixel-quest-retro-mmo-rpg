import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Player {
  constructor(username, clientId, isLocal) {
    this.username = username;
    this.clientId = clientId;
    this.isLocalPlayer = isLocal;
    this.speed = CONFIG.PLAYER.SPEED;
    this.direction = 'down'; // down, up, left, right
    this.movementState = 'idle'; // idle, walking
    this.health = 100;
    
    // Create a group to hold all player objects
    this.playerGroup = new THREE.Group();
    
    // Create player sprite
    this.createPlayerSprite();
    
    // Create username label
    this.createUsernameLabel();
    
    // Set initial position
    this.position = { x: 0, y: 0, z: 0 };
    this.playerGroup.position.set(0, 0, 0);
  }
  
  createPlayerSprite() {
    // For simplicity, just use a box for now
    // In a real implementation, you would use sprite sheets for different directions
    const playerGeometry = new THREE.BoxGeometry(0.8, 1.6, 0.5);
    
    // Different color for local player
    const playerMaterial = new THREE.MeshLambertMaterial({
      color: this.isLocalPlayer ? 0x3366ff : 0xff6633
    });
    
    this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
    this.playerMesh.position.y = 0.8; // Half height
    
    this.playerGroup.add(this.playerMesh);
  }
  
  createUsernameLabel() {
    // Create canvas for the username
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    // Fill with transparent background
    context.fillStyle = 'rgba(0, 0, 0, 0.0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    context.font = 'bold 24px Arial';
    context.fillStyle = this.isLocalPlayer ? '#4488ff' : '#ffffff';
    context.textAlign = 'center';
    context.fillText(this.username, canvas.width / 2, canvas.height / 2);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Create sprite material
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    
    // Create sprite
    this.usernameSprite = new THREE.Sprite(material);
    this.usernameSprite.scale.set(2, 0.5, 1);
    this.usernameSprite.position.y = 2.2; // Above player
    
    this.playerGroup.add(this.usernameSprite);
  }
  
  getObject() {
    return this.playerGroup;
  }
  
  getPosition() {
    return {
      x: this.playerGroup.position.x,
      y: this.playerGroup.position.y,
      z: this.playerGroup.position.z
    };
  }
  
  setPosition(x, y, z = 0) {
    this.playerGroup.position.set(x, y, z);
  }
  
  getDirection() {
    return this.direction;
  }
  
  setDirection(direction) {
    this.direction = direction;
    // Update player sprite based on direction
    // For a complete implementation, you would change the texture based on direction
  }
  
  getUsername() {
    return this.username;
  }
  
  isLocal() {
    return this.isLocalPlayer;
  }
  
  setHealth(health) {
    this.health = health;
  }
  
  getHealth() {
    return this.health;
  }
  
  move(dx, dy, deltaTime) {
    // Calculate new position
    const moveSpeed = this.speed * deltaTime;
    const newX = this.playerGroup.position.x + dx * moveSpeed;
    const newZ = this.playerGroup.position.z + dy * moveSpeed;
    
    // Update position
    this.playerGroup.position.x = newX;
    this.playerGroup.position.z = newZ;
    
    // Update direction based on movement
    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else {
      this.direction = dy > 0 ? 'down' : 'up';
    }
    
    // Update movement state
    this.movementState = 'walking';
  }
  
  update(deltaTime) {
    // Handle animations, movement interpolation, etc.
    
    // Reset movement state if this is not being actively moved
    if (this.movementState === 'walking') {
      this.movementState = 'idle';
    }
  }
}

