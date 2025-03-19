import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class WorldGenerator {
  constructor(scene) {
    this.scene = scene;
    this.tileSize = CONFIG.WORLD.TILE_SIZE;
    this.worldSize = CONFIG.WORLD.SIZE;
    this.tileTypes = [
      { name: 'grass', color: 0x4a934a },
      { name: 'water', color: 0x3d85c6 },
      { name: 'sand', color: 0xe6c88f },
      { name: 'stone', color: 0x808080 },
      { name: 'forest', color: 0x2d602d }
    ];
    
    // Create tile map for collision detection
    this.tileMap = [];
    
    // Create a noise function for procedural generation
    this.seed = Math.random() * 1000;
  }

  generate() {
    // Clear existing world if any
    this.clearWorld();
    
    // Create an empty tile map
    this.tileMap = new Array(this.worldSize);
    for (let x = 0; x < this.worldSize; x++) {
      this.tileMap[x] = new Array(this.worldSize);
    }
    
    // Generate ground plane
    this.generateGround();
    
    // Generate water bodies
    this.generateWater();
    
    // Generate terrain features
    this.generateTrees();
    this.generateRocks();
    
    // Add a grid for visual reference
    this.addGrid();
    
    console.log('World generated successfully');
    return this.tileMap;
  }
  
  clearWorld() {
    // Remove all existing world objects
    this.scene.children = this.scene.children.filter(child => {
      const isWorldObject = child.userData.isWorldObject;
      if (isWorldObject) {
        this.scene.remove(child);
      }
      return !isWorldObject;
    });
  }
  
  generateGround() {
    const groundGeometry = new THREE.PlaneGeometry(
      this.worldSize * this.tileSize, 
      this.worldSize * this.tileSize
    );
    
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: this.tileTypes[0].color 
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.userData.isWorldObject = true;
    
    this.scene.add(ground);
    
    // Fill the tile map with grass by default
    for (let x = 0; x < this.worldSize; x++) {
      for (let z = 0; z < this.worldSize; z++) {
        this.tileMap[x][z] = {
          type: 'grass',
          walkable: true
        };
      }
    }
  }
  
  generateWater() {
    // Simple water generation - just creating a few water bodies
    const waterPools = Math.floor(this.worldSize / 15) + 1;
    
    for (let i = 0; i < waterPools; i++) {
      const centerX = Math.floor(Math.random() * this.worldSize);
      const centerZ = Math.floor(Math.random() * this.worldSize);
      const size = Math.floor(Math.random() * 6) + 4;
      
      for (let x = centerX - size / 2; x < centerX + size / 2; x++) {
        for (let z = centerZ - size / 2; z < centerZ + size / 2; z++) {
          // Check if within bounds
          if (x >= 0 && x < this.worldSize && z >= 0 && z < this.worldSize) {
            // Calculate distance from center for a more natural shape
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(z - centerZ, 2));
            if (distance < size / 2) {
              // Create water tile
              this.createWaterTile(x, z);
              this.tileMap[x][z] = {
                type: 'water',
                walkable: false
              };
              
              // Create some sand around the water
              for (let sx = x - 1; sx <= x + 1; sx++) {
                for (let sz = z - 1; sz <= z + 1; sz++) {
                  if (
                    sx >= 0 && sx < this.worldSize && 
                    sz >= 0 && sz < this.worldSize &&
                    this.tileMap[sx][sz].type === 'grass'
                  ) {
                    const sandChance = Math.random();
                    if (sandChance > 0.5) {
                      this.createSandTile(sx, sz);
                      this.tileMap[sx][sz] = {
                        type: 'sand',
                        walkable: true
                      };
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  createWaterTile(x, z) {
    const waterGeometry = new THREE.PlaneGeometry(this.tileSize, this.tileSize);
    const waterMaterial = new THREE.MeshLambertMaterial({ 
      color: this.tileTypes[1].color,
      transparent: true,
      opacity: 0.8
    });
    
    const waterTile = new THREE.Mesh(waterGeometry, waterMaterial);
    waterTile.rotation.x = -Math.PI / 2;
    waterTile.position.set(
      (x - this.worldSize / 2) * this.tileSize + this.tileSize / 2,
      0,
      (z - this.worldSize / 2) * this.tileSize + this.tileSize / 2
    );
    waterTile.userData.isWorldObject = true;
    
    this.scene.add(waterTile);
  }
  
  createSandTile(x, z) {
    const sandGeometry = new THREE.PlaneGeometry(this.tileSize, this.tileSize);
    const sandMaterial = new THREE.MeshLambertMaterial({ 
      color: this.tileTypes[2].color
    });
    
    const sandTile = new THREE.Mesh(sandGeometry, sandMaterial);
    sandTile.rotation.x = -Math.PI / 2;
    sandTile.position.set(
      (x - this.worldSize / 2) * this.tileSize + this.tileSize / 2,
      0.01, // Slightly above ground
      (z - this.worldSize / 2) * this.tileSize + this.tileSize / 2
    );
    sandTile.userData.isWorldObject = true;
    
    this.scene.add(sandTile);
  }
  
  generateTrees() {
    const numTrees = Math.floor(this.worldSize * this.worldSize * 0.02); // 2% of tiles
    
    for (let i = 0; i < numTrees; i++) {
      const x = Math.floor(Math.random() * this.worldSize);
      const z = Math.floor(Math.random() * this.worldSize);
      
      // Only place trees on grass
      if (this.tileMap[x][z].type === 'grass') {
        this.createTree(x, z);
        this.tileMap[x][z] = {
          type: 'forest',
          walkable: false
        };
      }
    }
  }
  
  createTree(x, z) {
    // Create tree trunk
    const trunkGeometry = new THREE.BoxGeometry(this.tileSize * 0.3, this.tileSize * 0.8, this.tileSize * 0.3);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    
    // Create tree top
    const topGeometry = new THREE.ConeGeometry(this.tileSize * 0.6, this.tileSize * 1.2, 4);
    const topMaterial = new THREE.MeshLambertMaterial({ color: this.tileTypes[4].color });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    
    // Position the tree parts
    trunk.position.set(
      (x - this.worldSize / 2) * this.tileSize + this.tileSize / 2,
      this.tileSize * 0.4,
      (z - this.worldSize / 2) * this.tileSize + this.tileSize / 2
    );
    
    top.position.set(
      (x - this.worldSize / 2) * this.tileSize + this.tileSize / 2,
      this.tileSize * 1.4,
      (z - this.worldSize / 2) * this.tileSize + this.tileSize / 2
    );
    
    // Mark as world objects
    trunk.userData.isWorldObject = true;
    top.userData.isWorldObject = true;
    
    // Add to scene
    this.scene.add(trunk);
    this.scene.add(top);
  }
  
  generateRocks() {
    const numRocks = Math.floor(this.worldSize * this.worldSize * 0.01); // 1% of tiles
    
    for (let i = 0; i < numRocks; i++) {
      const x = Math.floor(Math.random() * this.worldSize);
      const z = Math.floor(Math.random() * this.worldSize);
      
      // Only place rocks on grass or sand
      if (this.tileMap[x][z].type === 'grass' || this.tileMap[x][z].type === 'sand') {
        this.createRock(x, z);
        this.tileMap[x][z] = {
          type: 'stone',
          walkable: false
        };
      }
    }
  }
  
  createRock(x, z) {
    // Randomize rock size
    const sizeX = (Math.random() * 0.4 + 0.6) * this.tileSize;
    const sizeY = (Math.random() * 0.3 + 0.3) * this.tileSize;
    const sizeZ = (Math.random() * 0.4 + 0.6) * this.tileSize;
    
    const rockGeometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: this.tileTypes[3].color });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    
    rock.position.set(
      (x - this.worldSize / 2) * this.tileSize + this.tileSize / 2,
      sizeY / 2,
      (z - this.worldSize / 2) * this.tileSize + this.tileSize / 2
    );
    
    // Add some rotation for more natural look
    rock.rotation.y = Math.random() * Math.PI;
    
    rock.userData.isWorldObject = true;
    this.scene.add(rock);
  }
  
  addGrid() {
    if (!CONFIG.DEBUG.SHOW_GRID) return;
    
    const gridSize = this.worldSize * this.tileSize;
    const divisions = this.worldSize;
    
    const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x444444, 0x444444);
    gridHelper.userData.isWorldObject = true;
    this.scene.add(gridHelper);
  }
  
  // Check if a position is walkable
  isWalkable(x, z) {
    // Convert world coordinates to tile coordinates
    const tileX = Math.floor((x + this.worldSize * this.tileSize / 2) / this.tileSize);
    const tileZ = Math.floor((z + this.worldSize * this.tileSize / 2) / this.tileSize);
    
    // Check if within bounds
    if (tileX < 0 || tileX >= this.worldSize || tileZ < 0 || tileZ >= this.worldSize) {
      return false;
    }
    
    return this.tileMap[tileX][tileZ].walkable;
  }
}

