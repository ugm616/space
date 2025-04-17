class CanvasManager {
  constructor() {
    this.canvas = document.getElementById('celestialCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.pixelRatio = window.devicePixelRatio || 1;
    this.width = 0;
    this.height = 0;
    this.resizeObserver = new ResizeObserver(this.resize.bind(this));
    this.resizeObserver.observe(this.canvas);
    this.resize();
    
    // Handle touch and mouse events
    this.pointerDown = false;
    this.pointerX = 0;
    this.pointerY = 0;
    this.prevPointerX = 0;
    this.prevPointerY = 0;
    
    this.setupEventListeners();
  }
  
  resize() {
    const { width, height } = this.canvas.parentElement.getBoundingClientRect();
    
    // Set display size
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    // Set actual size in memory (scaled for high DPI)
    this.canvas.width = width * this.pixelRatio;
    this.canvas.height = height * this.pixelRatio;
    
    // Scale context for high DPI display
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
    
    this.width = width;
    this.height = height;
    
    // Notify systems of resize
    document.dispatchEvent(new CustomEvent('canvas-resize', { 
      detail: { width, height } 
    }));
  }
  
  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handlePointerDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handlePointerMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handlePointerUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handlePointerUp.bind(this));
    
    // Touch events - using the same handlers as mouse events with conversion
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }
  
  handlePointerDown(e) {
    this.pointerDown = true;
    this.pointerX = e.clientX;
    this.pointerY = e.clientY;
    this.prevPointerX = this.pointerX;
    this.prevPointerY = this.pointerY;
    
    document.dispatchEvent(new CustomEvent('pointer-down', {
      detail: { x: this.pointerX, y: this.pointerY }
    }));
  }
  
  handlePointerMove(e) {
    this.prevPointerX = this.pointerX;
    this.prevPointerY = this.pointerY;
    this.pointerX = e.clientX;
    this.pointerY = e.clientY;
    
    document.dispatchEvent(new CustomEvent('pointer-move', {
      detail: { 
        x: this.pointerX, 
        y: this.pointerY,
        prevX: this.prevPointerX,
        prevY: this.prevPointerY,
        isDown: this.pointerDown
      }
    }));
  }
  
  handlePointerUp(e) {
    this.pointerDown = false;
    document.dispatchEvent(new CustomEvent('pointer-up', {
      detail: { x: this.pointerX, y: this.pointerY }
    }));
  }
  
  // Touch event handlers - convert touch events to pointer events
  handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const touchEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      this.handlePointerDown(touchEvent);
    }
  }
  
  handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const touchEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      this.handlePointerMove(touchEvent);
    }
  }
  
  handleTouchEnd(e) {
    e.preventDefault();
    // Use the last known position for the touch end event
    const touchEvent = {
      clientX: this.pointerX,
      clientY: this.pointerY
    };
    this.handlePointerUp(touchEvent);
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}