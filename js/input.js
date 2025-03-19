export class InputHandler {
  constructor(canvas) {
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      arrowUp: false,
      arrowDown: false,
      arrowLeft: false,
      arrowRight: false
    };
    
    this.mousePosition = { x: 0, y: 0 };
    this.mouseDown = false;
    
    // Set up event listeners
    this.setupKeyboardEvents();
    this.setupMouseEvents(canvas);
  }
  
  setupKeyboardEvents() {
    // Key down event
    window.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          this.keys.w = true;
          this.keys.arrowUp = true;
          break;
        case 'a':
        case 'arrowleft':
          this.keys.a = true;
          this.keys.arrowLeft = true;
          break;
        case 's':
        case 'arrowdown':
          this.keys.s = true;
          this.keys.arrowDown = true;
          break;
        case 'd':
        case 'arrowright':
          this.keys.d = true;
          this.keys.arrowRight = true;
          break;
      }
    });
    
    // Key up event
    window.addEventListener('keyup', (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          this.keys.w = false;
          this.keys.arrowUp = false;
          break;
        case 'a':
        case 'arrowleft':
          this.keys.a = false;
          this.keys.arrowLeft = false;
          break;
        case 's':
        case 'arrowdown':
          this.keys.s = false;
          this.keys.arrowDown = false;
          break;
        case 'd':
        case 'arrowright':
          this.keys.d = false;
          this.keys.arrowRight = false;
          break;
      }
    });
  }
  
  setupMouseEvents(canvas) {
    // Mouse move
    canvas.addEventListener('mousemove', (e) => {
      this.mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Mouse down
    canvas.addEventListener('mousedown', (e) => {
      this.mouseDown = true;
    });
    
    // Mouse up
    canvas.addEventListener('mouseup', (e) => {
      this.mouseDown = false;
    });
    
    // Mouse leave
    canvas.addEventListener('mouseleave', (e) => {
      this.mouseDown = false;
    });
  }
  
  getMovement() {
    let dx = 0;
    let dy = 0;
    
    // Calculate horizontal movement
    if (this.keys.a || this.keys.arrowLeft) {
      dx -= 1;
    }
    if (this.keys.d || this.keys.arrowRight) {
      dx += 1;
    }
    
    // Calculate vertical movement
    if (this.keys.w || this.keys.arrowUp) {
      dy -= 1;
    }
    if (this.keys.s || this.keys.arrowDown) {
      dy += 1;
    }
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      dx /= magnitude;
      dy /= magnitude;
    }
    
    return { x: dx, y: dy };
  }
  
  getMousePosition() {
    return this.mousePosition;
  }
  
  isMouseDown() {
    return this.mouseDown;
  }
  
  reset() {
    // Reset all keys
    for (const key in this.keys) {
      this.keys[key] = false;
    }
    
    this.mouseDown = false;
  }
}

