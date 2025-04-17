class CosmicFlowSystem {
  constructor(canvasManager, particleSystem) {
    this.canvas = canvasManager.canvas;
    this.ctx = canvasManager.ctx;
    this.particleSystem = particleSystem;
    this.enabled = false;
    this.interacting = false;
    this.flowPoints = [];
    this.flowGrid = [];
    this.gridSize = 20;
    this.flowStrength = 1;
    this.flowColor = this.generateFlowColor();
    this.autoEmit = true;
    this.autoEmitRate = 2; // particles per frame
    this.frameCount = 0;
    
    this.setupEventListeners();
    this.initializeFlowGrid();
  }
  
  generateFlowColor() {
    const themes = [
      { hue: 220, name: 'blue' },    // Blue nebula
      { hue: 280, name: 'purple' },  // Purple galaxy
      { hue: 180, name: 'teal' },    // Teal cosmic cloud
      { hue: 340, name: 'pink' }     // Pink stellar nursery
    ];
    
    const theme = themes[Math.floor(Math.random() * themes.length)];
    return {
      hue: theme.hue,
      name: theme.name
    };
  }
  
  initializeFlowGrid() {
    // Create a grid of flow vectors
    this.flowGrid = [];
    
    const cols = Math.ceil(this.canvas.width / this.gridSize);
    const rows = Math.ceil(this.canvas.height / this.gridSize);
    
    for (let y = 0; y < rows; y++) {
      this.flowGrid[y] = [];
      for (let x = 0; x < cols; x++) {
        // Initialize with subtle default flow pattern
        const angle = Math.sin(x * 0.1) * Math.cos(y * 0.1) * Math.PI;
        this.flowGrid[y][x] = {
          x: Math.cos(angle) * 0.2,
          y: Math.sin(angle) * 0.2
        };
      }
    }
  }
  
  setupEventListeners() {
    document.addEventListener('pointer-down', this.handlePointerDown.bind(this));
    document.addEventListener('pointer-move', this.handlePointerMove.bind(this));
    document.addEventListener('pointer-up', this.handlePointerUp.bind(this));
    document.addEventListener('canvas-resize', this.handleResize.bind(this));
  }
  
  handleResize() {
    this.initializeFlowGrid();
  }
  
  handlePointerDown(e) {
    if (!this.enabled) return;
    
    const { x, y } = e.detail;
    this.interacting = true;
    
    // Create a flow point
    this.createFlowPoint(x, y);
    
    // Emit particles
    this.emitParticles(x, y, 20);
  }
  
  handlePointerMove(e) {
    if (!this.enabled || !this.interacting) return;
    
    const { x, y, prevX, prevY } = e.detail;
    
    // Calculate distance for density control
    const dx = x - prevX;
    const dy = y - prevY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance >= 10) {
      // Create flow points along the path
      const steps = Math.ceil(distance / 10);
      
      for (let i = 1; i <= steps; i++) {
        const pointX = prevX + (dx * i) / steps;
        const pointY = prevY + (dy * i) / steps;
        
        this.createFlowPoint(pointX, pointY);
        this.emitParticles(pointX, pointY, 5);
      }
    } else {
      // Create flow at current position
      this.updateFlowAt(x, y);
      
      // Emit particles occasionally
      if (Math.random() < 0.3) {
        this.emitParticles(x, y, 3);
      }
    }
  }
  
  handlePointerUp() {
    if (!this.enabled) return;
    this.interacting = false;
  }
  
  createFlowPoint(x, y) {
    // Create a flow influence point
    const flowPoint = {
      x,
      y,
      strength: this.flowStrength * (0.8 + Math.random() * 0.4),
      radius: 50 + Math.random() * 100,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      life: 15 + Math.random() * 10
    };
    
    this.flowPoints.push(flowPoint);
    this.updateFlowField();
  }
  
  updateFlowAt(x, y) {
    // Get grid cell
    const gridX = Math.floor(x / this.gridSize);
    const gridY = Math.floor(y / this.gridSize);
    
    // Ensure within bounds
    if (gridY >= 0 && gridY < this.flowGrid.length && 
        gridX >= 0 && gridX < this.flowGrid[gridY].length) {
      
      // Calculate flow direction based on cursor movement
      const angle = Math.random() * Math.PI * 2;
      const strength = 0.5 + Math.random() * 0.5;
      
      this.flowGrid[gridY][gridX] = {
        x: Math.cos(angle) * strength,
        y: Math.sin(angle) * strength
      };
      
      // Update neighboring cells with decreasing strength
      for (let y = -2; y <= 2; y++) {
        for (let x = -2; x <= 2; x++) {
          if (x === 0 && y === 0) continue;
          
          const nx = gridX + x;
          const ny = gridY + y;
          
          if (ny >= 0 && ny < this.flowGrid.length && 
              nx >= 0 && nx < this.flowGrid[ny].length) {
            
            const distance = Math.sqrt(x * x + y * y);
            const influence = 1 - distance / 3;
            
            if (influence > 0) {
              const cell = this.flowGrid[ny][nx];
              cell.x = cell.x * (1 - influence) + Math.cos(angle) * strength * influence;
              cell.y = cell.y * (1 - influence) + Math.sin(angle) * strength * influence;
            }
          }
        }
      }
    }
  }
  
  updateFlowField() {
    // Reset flow grid to base values
    this.initializeFlowGrid();
    
    // Apply all flow points
    for (const point of this.flowPoints) {
      const gridCenterX = Math.floor(point.x / this.gridSize);
      const gridCenterY = Math.floor(point.y / this.gridSize);
      const radius = Math.ceil(point.radius / this.gridSize);
      
      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          const gridX = gridCenterX + x;
          const gridY = gridCenterY + y;
          
          if (gridY >= 0 && gridY < this.flowGrid.length && 
              gridX >= 0 && gridX < this.flowGrid[gridY].length) {
            
            // Calculate distance from flow point center
            const dx = (gridX * this.gridSize) - point.x;
            const dy = (gridY * this.gridSize) - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < point.radius) {
              // Calculate influence based on distance
              const influence = (1 - distance / point.radius) * point.strength;
              
              // Calculate flow direction
              const flowAngle = Math.atan2(dy, dx) + point.angle;
              const flowX = Math.cos(flowAngle) * influence;
              const flowY = Math.sin(flowAngle) * influence;
              
              // Apply to grid
              const cell = this.flowGrid[gridY][gridX];
              cell.x += flowX;
              cell.y += flowY;
            }
          }
        }
      }
    }
  }
  
  emitParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      // Get base color from flow theme
      const hue = this.flowColor.hue + (Math.random() - 0.5) * 30;
      const saturation = 70 + Math.random() * 20;
      const lightness = 60 + Math.random() * 20;
      const color = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`;
      
      this.particleSystem.createParticle(
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
        {
          velocityX: (Math.random() - 0.5) * 0.5,
          velocityY: (Math.random() - 0.5) * 0.5,
          size: 2 + Math.random() * 4,
          color,
          life: 5 + Math.random() * 10,
          decay: 0.01 + Math.random() * 0.03,
          type: 'flow'
        }
      );
    }
  }
  
  update(deltaTime) {
    this.frameCount++;
    
    // Update flow points
    for (let i = this.flowPoints.length - 1; i >= 0; i--) {
      const point = this.flowPoints[i];
      
      // Update angle
      point.angle += point.rotationSpeed * deltaTime;
      
      // Reduce life
      point.life -= 0.05 * deltaTime;
      
      // Remove dead points
      if (point.life <= 0) {
        this.flowPoints.splice(i, 1);
        this.updateFlowField();
      }
    }
    
    // Auto-emit particles
    if (this.autoEmit && this.frameCount % 5 === 0) {
      for (let i = 0; i < this.autoEmitRate; i++) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        this.emitParticles(x, y, 1);
      }
    }
    
    // Apply flow field to particles
    for (const particle of this.particleSystem.particles) {
      if (particle.type === 'flow') {
        // Find grid cell
        const gridX = Math.floor(particle.x / this.gridSize);
        const gridY = Math.floor(particle.y / this.gridSize);
        
        // Ensure within bounds
        if (gridY >= 0 && gridY < this.flowGrid.length && 
            gridX >= 0 && gridX < this.flowGrid[gridY].length) {
          
          const flow = this.flowGrid[gridY][gridX];
          
          // Apply flow force
          particle.velocityX += flow.x * 0.05 * deltaTime;
          particle.velocityY += flow.y * 0.05 * deltaTime;
          
          // Limit velocity
          const speed = Math.sqrt(
            particle.velocityX * particle.velocityX + 
            particle.velocityY * particle.velocityY
          );
          
          if (speed > 2) {
            particle.velocityX = (particle.velocityX / speed) * 2;
            particle.velocityY = (particle.velocityY / speed) * 2;
          }
        }
      }
    }
  }
  
  draw() {
    // Optionally visualize the flow field (for debugging)
    if (false) { // Set to true to see debug visualization
      this.ctx.save();
      
      for (let y = 0; y < this.flowGrid.length; y++) {
        for (let x = 0; x < this.flowGrid[y].length; x++) {
          const flow = this.flowGrid[y][x];
          const centerX = x * this.gridSize;
          const centerY = y * this.gridSize;
          
          this.ctx.beginPath();
          this.ctx.moveTo(centerX, centerY);
          this.ctx.lineTo(
            centerX + flow.x * this.gridSize,
            centerY + flow.y * this.gridSize
          );
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          this.ctx.stroke();
        }
      }
      
      this.ctx.restore();
    }
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.enabled = false;
    this.interacting = false;
  }
  
  serialize() {
    return {
      flowPoints: this.flowPoints,
      flowColor: this.flowColor
    };
  }
  
  deserialize(data) {
    if (data.flowPoints) {
      this.flowPoints = data.flowPoints;
    }
    
    if (data.flowColor) {
      this.flowColor = data.flowColor;
    }
    
    this.updateFlowField();
  }
}