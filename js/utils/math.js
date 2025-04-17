// Math utilities

const MathUtils = {
  // Linear interpolation
  lerp(a, b, t) {
    return a + (b - a) * t;
  },
  
  // Clamp a value between min and max
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },
  
  // Map a value from one range to another
  map(value, fromMin, fromMax, toMin, toMax) {
    return toMin + (toMax - toMin) * ((value - fromMin) / (fromMax - fromMin));
  },
  
  // Distance between two points
  distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  },
  
  // Random value in range
  random(min, max) {
    return min + Math.random() * (max - min);
  },
  
  // Random integer in range (inclusive)
  randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  },
  
  // Perlin noise (simplified approximation for 2D)
  // For actual projects, consider using a proper noise library
  noise(x, y) {
    // Simple approximation - not true Perlin noise
    return (Math.sin(x * 0.1) * Math.cos(y * 0.1) + 1) * 0.5;
  }
};