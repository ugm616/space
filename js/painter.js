class CosmicPainter {
  constructor(canvasManager, particleSystem) {
    this.canvas = canvasManager.canvas;
    this.ctx = canvasManager.ctx;
    this.particleSystem = particleSystem;
    this.enabled = false;
    this.painting = false;
    this.lastX = 0;
    this.lastY = 0;
    this.brushSize = 20;
    this.brushColor = this.generateColor();
    this.brushTypes = ['glow', 'stars', 'nebula'];
    this.currentBrush = 'glow';
    this.paintings = [];
    this.currentStrokeId = null;
    
    this.setupEventListeners();
  }
  
  generateColor() {
    // Generate cosmic-themed colors
    const hue = 180 + Math.random() * 180; // Blues to purples
    const saturation = 70 + Math.random() * 30;
    const lightness = 50 + Math.random() * 30;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  
  setupEventListeners() {
    document.addEventListener('pointer-down', this.handlePointerDown.bind(this));
    document.addEventListener('pointer-move', this.handlePointerMove.bind(this));
    document.addEventListener('pointer-up', this.handlePointerUp.bind(this));
  }
  
  handlePointerDown(e) {
    if (!this.enabled) return;
    
    this.painting = true;
    this.lastX = e.detail.x;
    this.lastY = e.detail.y;
    
    // Generate a unique ID for this stroke
    this.currentStrokeId = 'stroke-' + Date.now();
    
    // Create initial burst
    this.paint(this.lastX, this.lastY);
    
    // Save stroke start
    this.currentStroke = {
      id: this.currentStrokeId,
      brush: this.currentBrush,
      color: this.brushColor,
      size: this.brushSize,
      points: [{ x: this.lastX, y: this.lastY }]
    };
  }
  
  handlePointerMove(e) {
    if (!this.enabled || !this.painting) return;
    
    const { x, y } = e.detail;
    
    // Calculate distance between points for density control
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Draw points along the line for smoother result
    if (distance >= 2) {
      // Number of points to draw
      const steps = Math.ceil(distance / 2);
      
      for (let i = 1; i <= steps; i++) {
        const pointX = this.lastX + (dx * i) / steps;
        const pointY = this.lastY + (dy * i) / steps;
        
        this.paint(pointX, pointY);
        
        // Save point
        if (this.currentStroke) {
          this.currentStroke.points.push({ x: pointX, y: pointY });
        }
      }
      
      this.lastX = x;
      this.lastY = y;
    }
  }
  
  handlePointerUp() {
    if (!this.enabled) return;
    
    // End painting and save the stroke
    if (this.painting && this.currentStroke) {
      this.paintings.push(this.currentStroke);
      this.currentStroke = null;
      this.currentStrokeId = null;
    }
    
    this.painting = false;
  }
  
  paint(x, y) {
    // Create different particle effects based on brush type
    switch (this.currentBrush) {
      case 'glow':
        // Glowing effect
        const glowCount = Math.floor(this.brushSize / 2);
        for (let i = 0; i < glowCount; i++) {
          this.particleSystem.createParticle(
            x + (Math.random() - 0.5) * this.brushSize,
            y + (Math.random() - 0.5) * this.brushSize,
            {
              velocityX: (Math.random() - 0.5) * 0.5,
              velocityY: (Math.random() - 0.5) * 0.5,
              size: 1 + Math.random() * this.brushSize * 0.2,
              color: this.brushColor,
              life: 3 + Math.random() * 2,
              decay: 0.01 + Math.random() * 0.02,
              type: 'painter',
              group: this.currentStrokeId
            }
          );
        }
        break;
        
      case 'stars':
        // Star-like particles
        const starCount = Math.floor(this.brushSize / 5);
        for (let i = 0; i < starCount; i++) {
          this.particleSystem.createParticle(
            x + (Math.random() - 0.5) * this.brushSize,
            y + (Math.random() - 0.5) * this.brushSize,
            {
              velocityX: (Math.random() - 0.5) * 1,
              velocityY: (Math.random() - 0.5) * 1,
              size: 1 + Math.random() * 3,
              color: 'rgba(255, 255, 255, 0.9)',
              life: 5 + Math.random() * 5,
              decay: 0.005 + Math.random() * 0.01,
              type: 'painter',
              group: this.currentStrokeId
            }
          );
        }
        break;
        
      case 'nebula':
        // Nebula cloud effect
        const nebulaCount = Math.floor(this.brushSize / 3);
        for (let i = 0; i < nebulaCount; i++) {
          const hue = parseInt(this.brushColor.match(/hsl\((\d+)/)[1]);
          const nebColor = `hsl(${hue + (Math.random() - 0.5) * 30}, 70%, 60%)`;
          
          this.particleSystem.createParticle(
            x + (Math.random() - 0.5) * this.brushSize * 1.5,
            y + (Math.random() - 0.5) * this.brushSize * 1.5,
            {
              velocityX: (Math.random() - 0.5) * 0.3,
              velocityY: (Math.random() - 0.5) * 0.3,
              size: 3 + Math.random() * this.brushSize * 0.3,
              color: nebColor,
              life: 6 + Math.random() * 6,
              decay: 0.005 + Math.random() * 0.01,
              type: 'painter',
              group: this.currentStrokeId
            }
          );
        }
        break;
    }
  }
  
  changeBrush(brushType) {
    if (this.brushTypes.includes(brushType)) {
      this.currentBrush = brushType;
    }
  }
  
  changeBrushSize(size) {
    this.brushSize = Math.max(5, Math.min(50, size));
  }
  
  changeBrushColor() {
    this.brushColor = this.generateColor();
  }
  
  update(deltaTime) {
    // Any painter-specific updates
  }
  
  draw() {
    // The particles are drawn by the particle system
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.enabled = false;
    this.painting = false;
    this.currentStroke = null;
    this.currentStrokeId = null;
  }
  
  serialize() {
    return this.paintings;
  }
  
  deserialize(data) {
    this.paintings = data;
    
    // Recreate the saved paintings as particles
    this.paintings.forEach(stroke => {
      const { brush, color, size, points, id } = stroke;
      const strokeId = id || 'loaded-stroke-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      // Save current settings
      const currentBrush = this.currentBrush;
      const currentColor = this.brushColor;
      const currentSize = this.brushSize;
      const currentStrokeId = this.currentStrokeId;
      
      // Apply stroke settings
      this.currentBrush = brush;
      this.brushColor = color;
      this.brushSize = size;
      this.currentStrokeId = strokeId;
      
      // Recreate points at reduced density to avoid overwhelming the system
      for (let i = 0; i < points.length; i += 3) {
        const point = points[i];
        if (point) {
          this.paint(point.x, point.y);
        }
      }
      
      // Restore settings
      this.currentBrush = currentBrush;
      this.brushColor = currentColor;
      this.brushSize = currentSize;
      this.currentStrokeId = currentStrokeId;
    });
  }
}