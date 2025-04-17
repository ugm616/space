class StarSystem {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.stars = [];
    this.starCount = this.calculateStarCount();
    this.maxStarSize = 3;
    this.initializeStars();
    
    // Listen for canvas resize
    document.addEventListener('canvas-resize', this.handleResize.bind(this));
  }
  
  calculateStarCount() {
    // Adjust star density based on screen size
    const area = this.canvas.width * this.canvas.height;
    return Math.min(Math.floor(area / 10000), 1000);
  }
  
  handleResize(e) {
    // Recalculate star count and redistribute stars
    this.starCount = this.calculateStarCount();
    this.initializeStars();
  }
  
  initializeStars() {
    this.stars = [];
    for (let i = 0; i < this.starCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: 0.5 + Math.random() * this.maxStarSize,
        brightness: 0.5 + Math.random() * 0.5,
        // REDUCED PULSE SPEED: from 0.005-0.02 to 0.001-0.005 (approx. 4-5x slower)
        pulseSpeed: 0.001 + Math.random() * 0.004,
        pulsePhase: Math.random() * Math.PI * 2,
        tone: 200 + Math.floor(Math.random() * 500) // Frequency in Hz
      });
    }
  }
  
  update(deltaTime) {
    // Update star pulsing
    for (const star of this.stars) {
      star.pulsePhase += star.pulseSpeed * deltaTime;
      // Make the pulse effect more subtle by reducing the amplitude
      star.currentBrightness = star.brightness * (0.8 + 0.2 * Math.sin(star.pulsePhase));
    }
  }
  
  draw() {
    this.ctx.save();
    
    for (const star of this.stars) {
      const glow = star.size * 2;
      
      // Draw star glow
      const gradient = this.ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, glow
      );
      
      gradient.addColorStop(0, `rgba(180, 220, 255, ${star.currentBrightness * 0.8})`);
      gradient.addColorStop(1, 'rgba(180, 220, 255, 0)');
      
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, glow, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      
      // Draw star core
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.currentBrightness})`;
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }
  
  getStarAt(x, y, threshold = 20) {
    // Find a star near the given coordinates
    return this.stars.find(star => {
      const distance = Math.sqrt(
        Math.pow(star.x - x, 2) + Math.pow(star.y - y, 2)
      );
      return distance <= threshold;
    });
  }
}