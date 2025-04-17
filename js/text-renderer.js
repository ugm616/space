class CosmicTextRenderer {
  constructor(canvasManager, particleSystem) {
    this.canvas = canvasManager.canvas;
    this.ctx = canvasManager.ctx;
    this.particleSystem = particleSystem;
    this.enabled = false;
    this.textInput = document.getElementById('cosmicText');
    this.textOverlay = document.getElementById('textInputOverlay');
    this.textColor = this.generateTextColor();
    this.texts = []; // Store all rendered texts
    this.dispersionFactor = 0.25; // Controls dispersion strength
    
    // Current date timestamp and user info
    this.createdAt = "2025-04-17 14:33:25";
    this.userInfo = "ugm616";
    
    this.setupEventListeners();
  }
  
  generateTextColor() {
    // Generate vibrant cosmic-themed colors
    const hue = Math.random() * 360;
    const saturation = 70 + Math.random() * 30;
    const lightness = 60 + Math.random() * 20;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  
  setupEventListeners() {
    // Listen for Enter key to render text
    this.textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.renderText();
      } else if (e.key === 'Escape') {
        this.hideTextInput();
      }
    });
    
    // Close overlay when clicking outside
    this.textOverlay.addEventListener('click', (e) => {
      if (e.target === this.textOverlay) {
        this.hideTextInput();
      }
    });
  }
  
  showTextInput() {
    this.textOverlay.style.display = 'block';
    this.textInput.value = '';
    this.textInput.focus();
  }
  
  hideTextInput() {
    this.textOverlay.style.display = 'none';
  }
  
  renderText() {
    const text = this.textInput.value.trim();
    if (!text) return;
    
    // Hide input after getting text
    this.hideTextInput();
    
    // Calculate the appropriate font size based on canvas width
    // and text length to ensure it takes 95% of screen width
    const canvasWidth = this.canvas.width / this.ctx.getTransform().a; // Account for any scaling
    const targetWidth = canvasWidth * 0.95; // 95% of screen width
    
    // Start with a base size and adjust
    let fontSize = 120; // Start larger than needed
    this.ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    let textMetrics = this.ctx.measureText(text);
    
    // Adjust fontSize until the text width is close to target width
    while (textMetrics.width > targetWidth && fontSize > 10) {
      fontSize -= 5;
      this.ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      textMetrics = this.ctx.measureText(text);
    }
    
    // Calculate text position (centered)
    const centerX = canvasWidth / 2;
    const centerY = this.canvas.height / (2 * this.ctx.getTransform().d); // Account for any scaling
    const textX = centerX - textMetrics.width / 2;
    const textY = centerY;
    
    // Store the text properties
    const textId = 'text-' + Date.now();
    this.texts.push({
      id: textId,
      text,
      x: textX,
      y: textY,
      fontSize,
      color: this.textColor,
      createdAt: new Date().toISOString()
    });
    
    // Create a temporary canvas to draw the text and extract pixel data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Size the temp canvas to fit the text
    tempCanvas.width = textMetrics.width * 1.2;
    tempCanvas.height = fontSize * 2;
    
    // Draw the text on the temp canvas
    tempCtx.font = `bold ${fontSize}px Arial, sans-serif`;
    tempCtx.fillStyle = 'white';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(text, tempCanvas.width / 2 - textMetrics.width / 2, tempCanvas.height / 2);
    
    // Get the pixel data
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    // Create particles for non-transparent pixels
    const stepSize = 1 + Math.floor(fontSize / 40); // Adjust density based on font size
    for (let y = 0; y < tempCanvas.height; y += stepSize) {
      for (let x = 0; x < tempCanvas.width; x += stepSize) {
        const i = (y * tempCanvas.width + x) * 4;
        
        // If pixel is not transparent
        if (pixels[i + 3] > 50) {
          // Calculate actual position on main canvas
          const posX = textX + x - tempCanvas.width / 2 + textMetrics.width / 2;
          const posY = textY + y - tempCanvas.height / 2;
          
          // Create particle with dispersion effect
          this.createDispersiveTextParticle(posX, posY, textId, x, y, tempCanvas.width, tempCanvas.height);
        }
      }
    }
    
    // Generate a new color for the next text
    this.textColor = this.generateTextColor();
    
    // Play a sound effect if audio engine is available
    if (window.audioEngine && window.audioEngine.enabled) {
      // Play a gentle chime-like sound
      window.audioEngine.playTone('text-created', 800 + Math.random() * 400, 0.2, 0.7, 'sine');
      setTimeout(() => {
        window.audioEngine.playTone('text-created-2', 1200 + Math.random() * 400, 0.1, 0.5, 'sine');
      }, 150);
    }
  }
  
  createDispersiveTextParticle(x, y, textId, textX, textY, textWidth, textHeight) {
    // Calculate position relative to text center (from -0.5 to 0.5)
    const relX = (textX / textWidth) - 0.5;
    const relY = (textY / textHeight) - 0.5;
    
    // Create dispersion velocity based on position from center
    // Particles further from center disperse more
    const distance = Math.sqrt(relX * relX + relY * relY);
    const angle = Math.atan2(relY, relX) + (Math.random() - 0.5) * 0.5; // Add some angle randomness
    
    // Base velocity plus dispersion
    const dispersionStrength = this.dispersionFactor * distance * (0.5 + Math.random() * 0.5);
    const velX = Math.cos(angle) * dispersionStrength;
    const velY = Math.sin(angle) * dispersionStrength;
    
    // Add small random offset for more organic look
    const offsetX = (Math.random() - 0.5) * 2;
    const offsetY = (Math.random() - 0.5) * 2;
    
    // Create particle with dispersion motion
    this.particleSystem.createParticle(
      x + offsetX,
      y + offsetY,
      {
        velocityX: velX,
        velocityY: velY,
        size: 1 + Math.random() * 2,
        color: this.textColor,
        life: 10 + Math.random() * 7, // Longer life for text
        decay: 0.001 + Math.random() * 0.01, // Slower decay
        type: 'text',
        group: textId
      }
    );
  }
  
  enable() {
    this.enabled = true;
    this.showTextInput();
  }
  
  disable() {
    this.enabled = false;
    this.hideTextInput();
  }
  
  update(deltaTime) {
    // Any text particle-specific updates could go here
  }
  
  draw() {
    // The actual particles are drawn by the particle system
  }
  
  serialize() {
    return this.texts;
  }
  
  deserialize(data) {
    if (!data || !Array.isArray(data)) return;
    
    this.texts = data;
    
    // Recreate all saved texts
    data.forEach(textData => {
      // Store original color
      const originalColor = this.textColor;
      
      // Use the saved color
      this.textColor = textData.color || originalColor;
      
      // Set up context for rendering
      this.ctx.font = `bold ${textData.fontSize}px Arial, sans-serif`;
      const textMetrics = this.ctx.measureText(textData.text);
      
      // Create a temporary canvas
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      // Size the temp canvas
      tempCanvas.width = textMetrics.width * 1.2;
      tempCanvas.height = textData.fontSize * 2;
      
      // Draw text on temp canvas
      tempCtx.font = `bold ${textData.fontSize}px Arial, sans-serif`;
      tempCtx.fillStyle = 'white';
      tempCtx.textBaseline = 'middle';
      tempCtx.fillText(
        textData.text, 
        tempCanvas.width / 2 - textMetrics.width / 2, 
        tempCanvas.height / 2
      );
      
      // Get pixel data
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const pixels = imageData.data;
      
      // Create particles at a lower density for loaded texts
      const stepSize = 2 + Math.floor(textData.fontSize / 20);
      for (let y = 0; y < tempCanvas.height; y += stepSize) {
        for (let x = 0; x < tempCanvas.width; x += stepSize) {
          const i = (y * tempCanvas.width + x) * 4;
          
          // If pixel is not transparent
          if (pixels[i + 3] > 50) {
            // Calculate position
            const posX = textData.x + x - tempCanvas.width / 2 + textMetrics.width / 2;
            const posY = textData.y + y - tempCanvas.height / 2;
            
            // Add some randomness to have fewer particles when loading
            if (Math.random() < 0.5) {
              this.createDispersiveTextParticle(
                posX, posY, textData.id, 
                x, y, tempCanvas.width, tempCanvas.height
              );
            }
          }
        }
      }
      
      // Restore original color
      this.textColor = originalColor;
    });
  }
}
