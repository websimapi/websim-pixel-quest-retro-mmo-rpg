export class UIManager {
  constructor(networkManager) {
    this.networkManager = networkManager;
    this.username = '';
    
    // UI Elements
    this.loginScreen = document.getElementById('login-screen');
    this.gameUI = document.getElementById('game-ui');
    this.chatContainer = document.getElementById('chat-container');
    this.chatMessages = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input');
    this.healthBar = document.getElementById('health-fill');
    this.playerLevel = document.getElementById('player-level');
    
    // Set up chat input handler
    this.setupChatInput();
  }
  
  setupChatInput() {
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const message = this.chatInput.value.trim();
        if (message) {
          this.networkManager.sendChatMessage(message);
          this.chatInput.value = '';
        }
      }
    });
  }
  
  startGame(username) {
    this.username = username;
    
    // Hide login screen, show game UI
    this.loginScreen.classList.add('hidden');
    this.gameUI.classList.remove('hidden');
    
    console.log(`Started game as ${username}`);
  }
  
  getUsername() {
    return this.username;
  }
  
  updateHealth(health) {
    const percentage = Math.max(0, Math.min(100, health));
    this.healthBar.style.width = `${percentage}%`;
  }
  
  updateLevel(level) {
    this.playerLevel.textContent = `LVL ${level}`;
  }
  
  addChatMessage(messageData) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    
    const timestamp = new Date(messageData.timestamp).toLocaleTimeString();
    messageElement.innerHTML = `<span class="chat-time">[${timestamp}]</span> <span class="chat-sender">${messageData.sender}:</span> ${messageData.message}`;
    
    this.chatMessages.appendChild(messageElement);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  showNotification(message, type = 'info') {
    console.log(`Notification (${type}): ${message}`);
    // In a full implementation, this would create a temporary notification UI element
  }
}

