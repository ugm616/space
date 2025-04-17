document.addEventListener('DOMContentLoaded', () => {
  // Initialize core systems
  const canvasManager = new CanvasManager();
  const audioEngine = new AudioEngine();
  const starSystem = new StarSystem(canvasManager.canvas, canvasManager.ctx);
  const constellationSystem = new ConstellationSystem(canvasManager, starSystem, audioEngine);
  const particleSystem = new ParticleSystem(canvasManager.ctx);
  const painter = new CosmicPainter(canvasManager, particleSystem);
  const flowSystem = new CosmicFlowSystem(canvasManager, particleSystem);
  
  // UI controls
  const uiControls = new UIControls({
    audioEngine,
    constellationSystem,
    painter,
    flowSystem
  });
  
  // Set initial active tool
  let activeTool = 'constellation';
  constellationSystem.enable();
  
  // Tool switching
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Skip special handling for clear button
      if (btn.dataset.tool === 'clear') {
        handleClearAll();
        return;
      }
      
      // Deactivate all tools
      document.querySelectorAll('.tool-btn').forEach(b => {
        if (b.dataset.tool !== 'clear') { // Don't remove active from clear button
          b.classList.remove('active');
        }
      });
      
      constellationSystem.disable();
      painter.disable();
      flowSystem.disable();
      
      // Activate selected tool
      btn.classList.add('active');
      activeTool = btn.dataset.tool;
      
      switch (activeTool) {
        case 'constellation':
          constellationSystem.enable();
          break;
        case 'painter':
          painter.enable();
          break;
        case 'flow':
          flowSystem.enable();
          break;
      }
    });
  });
  
  // Function to handle clearing all content
  function handleClearAll() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to clear all your creations?')) {
      // Clear all systems
      constellationSystem.constellations = [];
      constellationSystem.currentConstellation = null;
      particleSystem.clear();
      painter.paintings = [];
      flowSystem.flowPoints = [];
      flowSystem.updateFlowField();
      
      // Clear storage
      deleteCreation('celestial-harmony');
      
      // Visual feedback - briefly highlight the clear button
      const clearBtn = document.querySelector('[data-tool="clear"]');
      clearBtn.classList.add('active');
      setTimeout(() => {
        clearBtn.classList.remove('active');
      }, 500);
      
      // Play a sound effect for clearing (optional)
      if (audioEngine.enabled) {
        // Play a "clear" sound
        audioEngine.playTone('clear-effect', 800, 0.02, 0.5, 'sine');
        setTimeout(() => {
          audioEngine.playTone('clear-effect-2', 600, 0.02, 0.5, 'sine');
        }, 100);
      }
    }
  }
  
  // Animation loop
  let lastTime = 0;
  
  function animate(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Clear canvas
    canvasManager.clear();
    
    // Update systems
    starSystem.update(deltaTime);
    particleSystem.update(deltaTime);
    
    // Tool-specific updates
    if (activeTool === 'constellation') {
      constellationSystem.update(deltaTime);
    } else if (activeTool === 'painter') {
      painter.update(deltaTime);
    } else if (activeTool === 'flow') {
      flowSystem.update(deltaTime);
    }
    
    // Draw everything
    starSystem.draw();
    particleSystem.draw();
    constellationSystem.draw();
    painter.draw();
    flowSystem.draw();
    
    requestAnimationFrame(animate);
  }
  
  // Start animation loop
  animate(0);
  
  // Save creation periodically
  setInterval(() => {
    saveCreation('celestial-harmony', {
      constellations: constellationSystem.serialize(),
      paintings: painter.serialize(),
      flows: flowSystem.serialize()
    });
  }, 30000); // Every 30 seconds
  
  // Load previous creation if exists
  const savedCreation = loadCreation('celestial-harmony');
  if (savedCreation) {
    if (savedCreation.constellations) {
      constellationSystem.deserialize(savedCreation.constellations);
    }
    if (savedCreation.paintings) {
      painter.deserialize(savedCreation.paintings);
    }
    if (savedCreation.flows) {
      flowSystem.deserialize(savedCreation.flows);
    }
  }
});