import { CONFIG } from '../config.js';

export class NetworkManager {
  constructor() {
    this.clientId = this.generateClientId();
    this.room = null;
    this.username = '';
    
    // Callbacks
    this.onPlayerJoin = null;
    this.onPlayerLeave = null;
    this.onPlayerUpdate = null;
    this.onChatMessage = null;
  }
  
  generateClientId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  getClientId() {
    return this.clientId;
  }
  
  connect(username) {
    this.username = username;
    
    // Initialize WebsimSocket
    this.room = new WebsimSocket();
    
    // Set up event handlers
    this.setupEventHandlers();
    
    console.log(`Connected as ${username} with client ID ${this.clientId}`);
  }
  
  setupEventHandlers() {
    // Handle incoming messages
    this.room.onmessage = (event) => {
      const data = event.data;
      
      switch (data.type) {
        case 'connected':
          console.log(`Player connected: ${data.username} (${data.clientId})`);
          if (this.onPlayerJoin && data.clientId !== this.clientId) {
            this.onPlayerJoin({
              username: data.username,
              clientId: data.clientId
            });
            
            // Send our current state to the new player
            this.sendPlayerUpdate({
              position: { x: 0, y: 0, z: 0 },
              direction: 'down'
            });
          }
          break;
          
        case 'disconnected':
          console.log(`Player disconnected: ${data.username} (${data.clientId})`);
          if (this.onPlayerLeave) {
            this.onPlayerLeave(data.clientId);
          }
          break;
          
        case 'playerUpdate':
          if (this.onPlayerUpdate && data.clientId !== this.clientId) {
            this.onPlayerUpdate({
              clientId: data.clientId,
              username: data.username,
              position: data.position,
              direction: data.direction
            });
          }
          break;
          
        case 'chatMessage':
          if (this.onChatMessage) {
            this.onChatMessage({
              sender: data.username,
              message: data.message,
              timestamp: data.timestamp
            });
          }
          break;
      }
    };
    
    // Subscribe to presence changes
    this.room.party.subscribePresence((presence) => {
      for (const clientId in presence) {
        const presenceData = presence[clientId];
        
        // Handle player movement from presence updates
        if (presenceData.position && clientId !== this.clientId) {
          if (this.onPlayerUpdate) {
            this.onPlayerUpdate({
              clientId: clientId,
              username: this.room.party.peers[clientId]?.username || 'Unknown',
              position: presenceData.position,
              direction: presenceData.direction
            });
          }
        }
      }
    });
  }
  
  sendPlayerUpdate(data) {
    // Update our presence
    this.room.party.updatePresence({
      position: data.position,
      direction: data.direction
    });
    
    // Also send as a direct event for immediate update
    this.room.send({
      type: 'playerUpdate',
      position: data.position,
      direction: data.direction
    });
  }
  
  sendChatMessage(message) {
    this.room.send({
      type: 'chatMessage',
      message: message,
      timestamp: new Date().toISOString()
    });
  }
  
  getConnectedPlayers() {
    if (!this.room || !this.room.party || !this.room.party.peers) {
      return [];
    }
    
    const players = [];
    for (const clientId in this.room.party.peers) {
      players.push({
        clientId: clientId,
        username: this.room.party.peers[clientId].username
      });
    }
    
    return players;
  }
}

