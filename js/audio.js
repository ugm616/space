class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.enabled = false;
    this.activeTones = new Map();
    
    // Try to initialize on user interaction
    document.addEventListener('pointer-down', this.initializeAudio.bind(this), { once: true });
  }
  
  initializeAudio() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Default volume
      this.masterGain.connect(this.audioContext.destination);
      this.enabled = true;
      console.log('Audio engine initialized');
    } catch (e) {
      console.error('Failed to initialize audio engine:', e);
    }
  }
  
  playTone(id, frequency, attack = 0.05, release = 1.0, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;
    
    // Stop the tone if it's already playing
    this.stopTone(id);
    
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    const envelope = this.audioContext.createGain();
    envelope.gain.value = 0;
    
    oscillator.connect(envelope);
    envelope.connect(this.masterGain);
    
    oscillator.start();
    
    // Attack
    envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
    envelope.gain.linearRampToValueAtTime(
      0.8, // Max value
      this.audioContext.currentTime + attack
    );
    
    this.activeTones.set(id, { oscillator, envelope });
    
    // Auto-release if requested
    if (release > 0) {
      setTimeout(() => this.releaseTone(id, release), attack * 1000);
    }
  }
  
  releaseTone(id, release = 1.0) {
    if (!this.activeTones.has(id)) return;
    
    const { envelope } = this.activeTones.get(id);
    
    envelope.gain.cancelScheduledValues(this.audioContext.currentTime);
    envelope.gain.setValueAtTime(envelope.gain.value, this.audioContext.currentTime);
    envelope.gain.exponentialRampToValueAtTime(
      0.001, // Near zero
      this.audioContext.currentTime + release
    );
    
    // Clean up after release
    setTimeout(() => this.stopTone(id), release * 1000);
  }
  
  stopTone(id) {
    if (!this.activeTones.has(id)) return;
    
    const { oscillator, envelope } = this.activeTones.get(id);
    
    oscillator.stop();
    oscillator.disconnect();
    envelope.disconnect();
    
    this.activeTones.delete(id);
  }
  
  playConstellationSound(connectionCount) {
    // Play a chord based on constellation complexity
    const baseFreq = 220; // A3
    
    // Major chord intervals: root, major third, perfect fifth
    const intervals = [1, 1.25, 1.5];
    
    intervals.forEach((interval, i) => {
      const freq = baseFreq * interval * (1 + connectionCount * 0.05);
      this.playTone(`constellation-${i}`, freq, 0.1, 2.0 + i * 0.5);
    });
  }
  
  setVolume(volume) {
    if (!this.masterGain) return;
    this.masterGain.gain.value = volume;
  }
  
  toggleAudio() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      // Stop all sounds
      this.activeTones.forEach((_, id) => this.stopTone(id));
    }
    return this.enabled;
  }
}