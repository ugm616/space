// Color utilities for cosmic themes

const ColorUtils = {
  // Convert HSL to RGB
  hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
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
  },
  
  // Generate a cosmic color palette (returns array of HSL colors)
  generatePalette(baseHue = 240, count = 5) {
    const palette = [];
    const hueRange = 60; // How much hue variation
    
    for (let i = 0; i < count; i++) {
      const hue = (baseHue + (i * hueRange / count) - hueRange / 2) % 360;
      const saturation = 70 + Math.random() * 20;
      const lightness = 40 + Math.random() * 40;
      
      palette.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return palette;
  },
  
  // Predefined cosmic themes
  themes: {
    deepSpace: {
      background: '#0a0a14',
      stars: '#ffffff',
      accent: '#8a7fff',
      particles: ['#8a7fff', '#c967ff', '#67b4ff', '#ff67d7']
    },
    cosmicOcean: {
      background: '#0a1420',
      stars: '#e0f7ff',
      accent: '#00a0c0',
      particles: ['#00c0c0', '#00a0e0', '#40e0ff', '#80e0ff']
    },
    stellarNursery: {
      background: '#140a14',
      stars: '#ffe0ff',
      accent: '#ff4a94',
      particles: ['#ff4a94', '#c04aff', '#ff7a64', '#ff4a4a']
    }
  }
};