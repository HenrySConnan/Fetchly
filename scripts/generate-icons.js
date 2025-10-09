import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple SVG icon generator for PetConnect
const generateIcon = (size) => {
  const scale = size / 512; // Base size is 512
  const strokeWidth = 4 * scale;
  const radius = 200 * scale;
  const center = size / 2;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="paw" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#bg)" />
  
  <!-- Paw print -->
  <g transform="translate(${center - 60 * scale}, ${center - 40 * scale})" fill="url(#paw)">
    <!-- Main pad -->
    <ellipse cx="${60 * scale}" cy="${40 * scale}" rx="${25 * scale}" ry="${35 * scale}" />
    
    <!-- Toe pads -->
    <ellipse cx="${30 * scale}" cy="${20 * scale}" rx="${12 * scale}" ry="${18 * scale}" />
    <ellipse cx="${60 * scale}" cy="${15 * scale}" rx="${12 * scale}" ry="${18 * scale}" />
    <ellipse cx="${90 * scale}" cy="${20 * scale}" rx="${12 * scale}" ry="${18 * scale}" />
    <ellipse cx="${45 * scale}" cy="${5 * scale}" rx="${10 * scale}" ry="${15 * scale}" />
    <ellipse cx="${75 * scale}" cy="${5 * scale}" rx="${10 * scale}" ry="${15 * scale}" />
  </g>
  
  <!-- Heart accent -->
  <g transform="translate(${center + 40 * scale}, ${center - 60 * scale})" fill="#ff6b6b" opacity="0.8">
    <path d="M${-8 * scale},${0} C${-8 * scale},${-15 * scale} ${8 * scale},${-15 * scale} ${8 * scale},${0} C${8 * scale},${15 * scale} ${-8 * scale},${15 * scale} ${-8 * scale},${0} Z" />
  </g>
</svg>`;
};

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
const sizes = [192, 512];
sizes.forEach(size => {
  const iconSvg = generateIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, iconSvg);
  console.log(`✅ Generated ${filename}`);
});

console.log('🎉 All icons generated successfully!');
console.log('📱 Your app now has PWA-ready icons!');
