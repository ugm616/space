class UIControls {
  constructor(systems) {
    this.systems = systems;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Audio toggle
    const audioToggle = document.getElementById('audioToggle');
    if (audioToggle) {
      audioToggle.addEventListener('click', () => {
        const enabled = this.systems.audioEngine.toggleAudio();
        audioToggle.classList.toggle('active', enabled);
      });
    }
    
    // Info button
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    if (infoBtn && infoModal) {
      infoBtn.addEventListener('click', () => {
        infoModal.style.display = infoModal.style.display === 'block' ? 'none' : 'block';
      });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
        
        // Generate settings content if needed
        if (settingsModal.style.display === 'block' && !settingsModal.hasChildNodes()) {
          this.generateSettingsContent(settingsModal);
        }
      });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      if (infoModal && e.target === infoModal) {
        infoModal.style.display = 'none';
      }
      if (settingsModal && e.target === settingsModal) {
        settingsModal.style.display = 'none';
      }
    });
    
    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (infoModal) infoModal.style.display = 'none';
        if (settingsModal) settingsModal.style.display = 'none';
      }
    });
  }
  
  generateSettingsContent(modal) {
    // Container for settings
    const container = document.createElement('div');
    container.className = 'settings-container';
    
    // Create settings sections
    container.innerHTML = `
      <h2>Settings</h2>
      
      <div class="settings-section">
        <h3>Audio</h3>
        <div class="setting-item">
          <label for="volume">Volume</label>
          <input type="range" id="volume" min="0" max="1" step="0.1" value="0.3">
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Visuals</h3>
        <div class="setting-item">
          <label for="particleDensity">Particle Density</label>
          <input type="range" id="particleDensity" min="0.2" max="2" step="0.1" value="1">
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Painter</h3>
        <div class="setting-item">
          <label for="brushSize">Brush Size</label>
          <input type="range" id="brushSize" min="5" max="50" step="1" value="20">
        </div>
        <div class="setting-item">
          <label>Brush Type</label>
          <div class="button-group">
            <button class="brush-btn active" data-brush="glow">Glow</button>
            <button class="brush-btn" data-brush="stars">Stars</button>
            <button class="brush-btn" data-brush="nebula">Nebula</button>
          </div>
        </div>
        <button id="newColor">New Color</button>
      </div>
      
      <div class="settings-section">
        <h3>Save & Share</h3>
        <button id="resetBtn">Reset Canvas</button>
      </div>
    `;
    
    modal.appendChild(container);
    
    // Add event listeners to settings controls
    const volumeSlider = document.getElementById('volume');
    if (volumeSlider && this.systems.audioEngine) {
      volumeSlider.addEventListener('input', () => {
        this.systems.audioEngine.setVolume(parseFloat(volumeSlider.value));
      });
    }
    
    const particleDensitySlider = document.getElementById('particleDensity');
    if (particleDensitySlider) {
      particleDensitySlider.addEventListener('input', () => {
        const density = parseFloat(particleDensitySlider.value);
        // Adjust particle creation rates based on density
        if (this.systems.painter) {
          // Adjust painter particle count
        }
        if (this.systems.flowSystem) {
          this.systems.flowSystem.autoEmitRate = Math.round(2 * density);
        }
      });
    }
    
    const brushSizeSlider = document.getElementById('brushSize');
    if (brushSizeSlider && this.systems.painter) {
      brushSizeSlider.addEventListener('input', () => {
        this.systems.painter.changeBrushSize(parseInt(brushSizeSlider.value));
      });
    }
    
    const brushButtons = document.querySelectorAll('.brush-btn');
    if (brushButtons.length && this.systems.painter) {
      brushButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          brushButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.systems.painter.changeBrush(btn.dataset.brush);
        });
      });
    }
    
    const newColorBtn = document.getElementById('newColor');
    if (newColorBtn && this.systems.painter) {
      newColorBtn.addEventListener('click', () => {
        this.systems.painter.changeBrushColor();
      });
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the canvas? This will clear all your creations.')) {
          // Clear systems
          if (this.systems.constellationSystem) {
            this.systems.constellationSystem.constellations = [];
          }
          if (this.systems.particleSystem) {
            this.systems.particleSystem.clear();
          }
          if (this.systems.painter) {
            this.systems.painter.paintings = [];
          }
          if (this.systems.flowSystem) {
            this.systems.flowSystem.flowPoints = [];
            this.systems.flowSystem.updateFlowField();
          }
          
          // Clear storage
          deleteCreation('celestial-harmony');
        }
      });
    }
  }
}