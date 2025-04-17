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
    // and text length to ensure responsive design
    const baseFontSize = Math.min(this.canvas.width / 20, 80);
    const fontSize = Math.max(baseFontSize * (1 - text.length * 0.02), baseFontSize * 0.4);
    
    // Set font for measurement
    this.ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    const textMetrics = this.ctx.measureText(text);
    const textWidth = textMetrics.width;
    
    // Calculate text position (centered)
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const textX = centerX - textWidth / 2;
    const textY = centerY;
    
    // Store the text properties
    const textId = 'text-' + Date.now();
    this.texts.push({
      id: textId,
      text,
      x: textX,
      y: textY,
      fontSize,
      color: this.textColor
    });
    
    // Create a temporary canvas to draw the text and extract pixel data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Size the temp canvas to fit the text
    tempCanvas.width = textWidth * 1.2;
    tempCanvas.height = fontSize * 2;
    
    // Draw the text on the temp canvas
    tempCtx.font = `bold ${fontSize}px Arial, sans-serif`;
    tempCtx.fillStyle = 'white';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(text, tempCanvas.width / 2 - textWidth / 2, tempCanvas.height / 2);
    
    // Get the pixel data
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    // Create particles for non-transparent pixels
    const stepSize = 1 + Math.floor(fontSize / 20); // Adjust density
    for (let y = 0; y < tempCanvas.height; y += stepSize) {
      for (let x = 0; x < tempCanvas.width; x += stepSize) {
        const i = (y * tempCanvas.width + x) * 4;
        
        // If pixel is not transparent
        if (pixels[i + 3] > 50) {
          // Calculate actual position on main canvas
          const posX = textX + x - tempCanvas.width / 2 + textWidth / 2;
          const posY = textY + y - tempCanvas.height / 2;
          
          // Create particle
          this.createTextParticle(posX, posY, textId);
        }
      }
    }
    
    // Generate a new color for the next text
    this.textColor = this.generateTextColor();
  }
  
  createTextParticle(x, y, textId) {
    // Add a small random offset for more organic look
    const offsetX = (Math.random() - 0.5) * 2;
    const offsetY = (Math.random() - 0.5) * 2;
    
    // Create particle with minimal motion
    this.particleSystem.createParticle(
      x + offsetX,
      y + offsetY,
      {
        velocityX: (Math.random() - 0.5) * 0.2,
        velocityY: (Math.random() - 0.5) * 0.2,
        size: 1 + Math.random() * 2,
        color: this.textColor,
        life: 10 + Math.random() * 10, // Longer life for text
        decay: 0.002 + Math.random() * 0.001, // Slower decay
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
    // If needed, add any text particle-specific updates here
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
      
      // Create particles at a lower density
      const stepSize = 2 + Math.floor(textData.fontSize / 15);
      for (let y = 0; y < tempCanvas.height; y += stepSize) {
        for (let x = 0; x < tempCanvas.width; x += stepSize) {
          const i = (y * tempCanvas.width + x) * 4;
          
          // If pixel is not transparent
          if (pixels[i + 3] > 50) {
            // Calculate position
            const posX = textData.x + x - tempCanvas.width / 2 + textMetrics.width / 2;
            const posY = textData.y + y - tempCanvas.height / 2;
            
            // Add some randomness to have fewer particles when loading
            if (Math.random() < 0.7) {
              this.createTextParticle(posX, posY, textData.id);
            }
          }
        }
      }
      
      // Restore original color
      this.textColor = originalColor;
    });
  }
}