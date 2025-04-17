class ParticleSystem {
  constructor(ctx) {
    this.ctx = ctx;
    this.particles = [];
    this.maxParticles = 8000; // Increased from 2000 to 8000
    this.particleGroups = new Map(); // For tracking groups of related particles
    
    // Current date timestamp for your records
    this.createdAt = "2025-04-17 14:20:15";
    this.userInfo = "ugm616";
  }
  
  createParticle(x, y, options = {}) {
    // Default values
    const defaults = {
      velocityX: (Math.random() - 0.5) * 2,
      velocityY: (Math.random() - 0.5) * 2,
      size: 1 + Math.random() * 3,
      color: 'rgba(180, 210, 255, 0.8)',
      life: 1 + Math.random() * 3,
      decay: 0.01 + Math.random() * 0.03,
      gravity: 0,
      type: 'default', // default, painter, flow, text
      group: null      // Optional group identifier for related particles
    };
    
    // Merge defaults with options
    const settings = { ...defaults, ...options };
    
    // Create the particle
    const particle = {
      x,
      y,
      velocityX: settings.velocityX,
      velocityY: settings.velocityY,
      size: settings.size,
      originalSize: settings.size,
      color: settings.color,
      life: settings.life,
      maxLife: settings.life,
      decay: settings.decay,
      gravity: settings.gravity,
      type: settings.type,
      group: settings.group
    };
    
    // Add to array, removing oldest particles if at capacity
    if (this.particles.length >= this.maxParticles) {
      // If we're at capacity, first try to remove particles that aren't part of active stroke
      const nonStrokeParticles = this.particles.findIndex(p => 
        p.type !== 'painter' || (p.life / p.maxLife) < 0.3
      );
      
      if (nonStrokeParticles !== -1) {
        // Remove a non-stroke particle or old faded stroke particle if possible
        this.particles.splice(nonStrokeParticles, 1);
      } else {
        // Otherwise remove the oldest
        this.particles.shift();
      }
    }
    
    this.particles.push(particle);
    
    // Track particle in its group if specified
    if (settings.group) {
      if (!this.particleGroups.has(settings.group)) {
        this.particleGroups.set(settings.group, []);
      }
      this.particleGroups.get(settings.group).push(particle);
    }
    
    return particle;
  }
  
  update(deltaTime) {
    const dt = deltaTime / 16; // Normalize to ~60fps
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.velocityX * dt;
      p.y += p.velocityY * dt;
      
      // Apply gravity
      p.velocityY += p.gravity * dt;
      
      // Reduce life
      p.life -= p.decay * dt;
      
      // Remove dead particles
      if (p.life <= 0) {
        // Remove from group tracking if applicable
        if (p.group && this.particleGroups.has(p.group)) {
          const groupParticles = this.particleGroups.get(p.group);
          const index = groupParticles.indexOf(p);
          if (index !== -1) {
            groupParticles.splice(index, 1);
          }
          
          // Clean up empty groups
          if (groupParticles.length === 0) {
            this.particleGroups.delete(p.group);
          }
        }
        
        this.particles.splice(i, 1);
        continue;
      }
      
      // Specific behavior based on particle type
      switch (p.type) {
        case 'painter':
          // Painter particles slow down over time
          p.velocityX *= 0.98;
          p.velocityY *= 0.98;
          break;
          
        case 'flow':
          // Flow particles can interact with each other
          // This could be expanded with more complex behaviors
          break;
          
        case 'text':
          // Text particles should have minimal movement
          p.velocityX *= 0.95;
          p.velocityY *= 0.95;
          
          // Occasionally add a slight "twinkle" effect
          if (Math.random() < 0.02) {
            p.size = p.originalSize * (0.8 + Math.random() * 0.4);
          }
          break;
      }
    }
  }
  
  draw() {
    this.ctx.save();
    
    for (const p of this.particles) {
      // Calculate opacity based on life
      const opacity = p.life / p.maxLife;
      
      // Get the base color
      let color;
      if (typeof p.color === 'function') {
        color = p.color(p);
      } else {
        color = p.color;
      }
      
      // Extract components to apply opacity
      let r, g, b, a;
      if (color.startsWith('rgba')) {
        const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (parts) {
          [, r, g, b, a] = parts;
          a = parseFloat(a) * opacity;
        }
      } else if (color.startsWith('rgb')) {
        const parts = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (parts) {
          [, r, g, b] = parts;
          a = opacity;
        }
      } else if (color.startsWith('hsl')) {
        // Convert HSL to RGB
        const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (hslMatch) {
          const [, h, s, l] = hslMatch.map(Number);
          const rgb = this.hslToRgb(h, s, l);
          r = rgb.r;
          g = rgb.g;
          b = rgb.b;
          a = opacity;
        } else {
          // Default fallback
          r = 255;
          g = 255;
          b = 255;
          a = opacity;
        }
      } else {
        // Default fallback
        r = 255;
        g = 255;
        b = 255;
        a = opacity;
      }
      
      // Calculate current size
      const size = p.size * (0.5 + 0.5 * opacity);
      
      // Draw based on type
      switch (p.type) {
        case 'text':
          // Sparkly effect for text particles
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          this.ctx.fill();
          
          // Add a subtle glow to some particles
          if (Math.random() < 0.2) {
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${a * 0.7})`;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size * 1.2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.3})`;
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
          }
          break;
          
        case 'painter':
          // Glow effect for painter particles
          const gradient = this.ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, size * 2
          );
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
          this.ctx.fillStyle = gradient;
          this.ctx.fill();
          break;
          
        case 'flow':
          // Flow particles with trail effect
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          this.ctx.fill();
          break;
          
        default:
          // Simple circle for default particles
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          this.ctx.fill();
      }
    }
    
    this.ctx.restore();
  }
  
  // Helper function to convert HSL to RGB
  hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
  
  createBurst(x, y, count, options = {}) {
    for (let i = 0; i < count; i++) {
      this.createParticle(x, y, options);
    }
  }
  
  clear() {
    this.particles = [];
    this.particleGroups.clear();
  }
  
  // Remove all particles in a specific group
  clearGroup(groupId) {
    if (this.particleGroups.has(groupId)) {
      // Get all particles in this group
      const groupParticles = this.particleGroups.get(groupId);
      
      // Remove each particle from the main particles array
      for (const particle of groupParticles) {
        const index = this.particles.indexOf(particle);
        if (index !== -1) {
          this.particles.splice(index, 1);
        }
      }
      
      // Remove the group
      this.particleGroups.delete(groupId);
    }
  }
  
  // Get count of particles by type
  getParticleCountByType(type) {
    return this.particles.filter(p => p.type === type).length;
  }
  
  // Get total particle count
  getParticleCount() {
    return this.particles.length;
  }
}