class ConstellationSystem {
  constructor(canvasManager, starSystem, audioEngine) {
    this.canvas = canvasManager.canvas;
    this.ctx = canvasManager.ctx;
    this.starSystem = starSystem;
    this.audioEngine = audioEngine;
    this.constellations = [];
    this.currentConstellation = null;
    this.selectedStar = null;
    this.enabled = false;
    
    this.lineColor = 'rgba(140, 180, 255, 0.6)';
    this.lineWidth = 1.5;
    this.lineGlow = 10;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    document.addEventListener('pointer-down', this.handlePointerDown.bind(this));
    document.addEventListener('pointer-move', this.handlePointerMove.bind(this));
    document.addEventListener('pointer-up', this.handlePointerUp.bind(this));
  }
  
  handlePointerDown(e) {
    if (!this.enabled) return;
    
    const { x, y } = e.detail;
    const star = this.starSystem.getStarAt(x, y);
    
    if (star) {
      this.selectedStar = star;
      
      // Start a new constellation if needed
      if (!this.currentConstellation) {
        this.currentConstellation = {
          stars: [star],
          connections: []
        };
        this.constellations.push(this.currentConstellation);
      } else {
        // Check if this star is already in the constellation
        if (!this.currentConstellation.stars.includes(star)) {
          const lastStar = this.currentConstellation.stars[this.currentConstellation.stars.length - 1];
          
          // Add the star and connection
          this.currentConstellation.stars.push(star);
          this.currentConstellation.connections.push({
            from: lastStar,
            to: star
          });
          
          // Play sound
          const connectionCount = this.currentConstellation.connections.length;
          this.audioEngine.playConstellationSound(connectionCount);
        }
      }
    } else {
      // Clicked empty space, end current constellation
      this.currentConstellation = null;
      this.selectedStar = null;
    }
  }
  
  handlePointerMove(e) {
    if (!this.enabled) return;
    
    // Highlight stars on hover
    const { x, y } = e.detail;
    const hoveredStar = this.starSystem.getStarAt(x, y);
    
    // Reset all star sizes
    this.starSystem.stars.forEach(star => {
      star.isHovered = false;
    });
    
    if (hoveredStar) {
      hoveredStar.isHovered = true;
    }
  }
  
  handlePointerUp() {
    // Currently not used, but might be useful for future interactions
  }
  
  update(deltaTime) {
    // Glow effects on constellation lines
    this.constellations.forEach(constellation => {
      constellation.connections.forEach(connection => {
        // Update glow animation if needed
      });
    });
  }
  
  draw() {
    if (!this.enabled && this.constellations.length === 0) return;
    
    this.ctx.save();
    
    // Draw connections
    this.constellations.forEach(constellation => {
      if (!constellation || !constellation.connections) return;
      
      constellation.connections.forEach(connection => {
        if (connection && connection.from && connection.to) {
          this.drawConnection(connection.from, connection.to);
        }
      });
    });
    
    // Draw temporary connection if creating a new one
    if (this.selectedStar && this.currentConstellation) {
      const lastStar = this.currentConstellation.stars[this.currentConstellation.stars.length - 1];
      
      if (lastStar && this.selectedStar !== lastStar) {
        this.drawConnection(lastStar, this.selectedStar);
      }
    }
    
    this.ctx.restore();
  }
  
  drawConnection(star1, star2) {
    // Check if both stars exist before drawing
    if (!star1 || !star2 || typeof star1.x !== 'number' || typeof star2.x !== 'number') {
      return; // Skip drawing if stars are invalid
    }
    
    // Draw glowing line between stars
    this.ctx.strokeStyle = this.lineColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.shadowBlur = this.lineGlow;
    this.ctx.shadowColor = 'rgba(100, 150, 255, 0.8)';
    
    this.ctx.beginPath();
    this.ctx.moveTo(star1.x, star1.y);
    this.ctx.lineTo(star2.x, star2.y);
    this.ctx.stroke();
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.enabled = false;
    this.currentConstellation = null;
    this.selectedStar = null;
  }
  
  serialize() {
    return this.constellations.map(constellation => {
      if (!constellation || !constellation.stars || !constellation.connections) {
        return null;
      }
      
      return {
        stars: constellation.stars
          .filter(star => star !== undefined)
          .map(star => this.starSystem.stars.indexOf(star)),
        connections: constellation.connections
          .filter(conn => conn && conn.from && conn.to)
          .map(conn => ({
            from: this.starSystem.stars.indexOf(conn.from),
            to: this.starSystem.stars.indexOf(conn.to)
          }))
          .filter(conn => conn.from !== -1 && conn.to !== -1)
      };
    }).filter(data => data !== null);
  }
  
  deserialize(data) {
    if (!data || !Array.isArray(data)) return;
    
    this.constellations = data
      .filter(constellationData => constellationData && Array.isArray(constellationData.stars))
      .map(constellationData => {
        try {
          const stars = constellationData.stars
            .map(index => {
              // Ensure the index is valid
              if (index >= 0 && index < this.starSystem.stars.length) {
                return this.starSystem.stars[index];
              }
              return null;
            })
            .filter(star => star !== null);
          
          const connections = constellationData.connections
            .filter(conn => conn && typeof conn.from === 'number' && typeof conn.to === 'number')
            .map(conn => {
              const fromStar = this.starSystem.stars[conn.from];
              const toStar = this.starSystem.stars[conn.to];
              
              if (fromStar && toStar) {
                return {
                  from: fromStar,
                  to: toStar
                };
              }
              return null;
            })
            .filter(conn => conn !== null);
          
          return {
            stars,
            connections
          };
        } catch (error) {
          console.error("Error deserializing constellation:", error);
          return null;
        }
      })
      .filter(constellation => constellation !== null);
  }
}