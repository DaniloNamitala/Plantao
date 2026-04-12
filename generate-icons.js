const sharp = require('sharp');
const path = require('path');

const BLUE = '#2f95dc';
const WHITE = '#ffffff';
const BG = '#1a1a2e';

function clockSvg(size, padding = 0) {
  const s = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = s * 0.35;
  const hourLen = r * 0.5;
  const minLen = r * 0.72;
  // Clock hands: hour at ~10:10 position
  const hourAngle = -60 * (Math.PI / 180);
  const minAngle = 60 * (Math.PI / 180);
  const hx = cx + hourLen * Math.sin(hourAngle);
  const hy = cy - hourLen * Math.cos(hourAngle);
  const mx = cx + minLen * Math.sin(minAngle);
  const my = cy - minLen * Math.cos(minAngle);
  const strokeW = Math.max(s * 0.04, 2);
  const dotR = strokeW * 1.2;

  // Tick marks
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) * (Math.PI / 180);
    const outerR = r * 0.92;
    const innerR = i % 3 === 0 ? r * 0.76 : r * 0.82;
    const x1 = cx + innerR * Math.sin(angle);
    const y1 = cy - innerR * Math.cos(angle);
    const x2 = cx + outerR * Math.sin(angle);
    const y2 = cy - outerR * Math.cos(angle);
    const tw = i % 3 === 0 ? strokeW * 1.2 : strokeW * 0.7;
    ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${WHITE}" stroke-width="${tw}" stroke-linecap="round"/>`;
  }

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${BG}"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${BLUE}" stroke-width="${strokeW * 1.8}"/>
      ${ticks}
      <line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="${WHITE}" stroke-width="${strokeW * 1.5}" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="${BLUE}" stroke-width="${strokeW}" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="${dotR}" fill="${WHITE}"/>
    </svg>`;
}

function splashSvg(width, height) {
  const iconSize = Math.min(width, height) * 0.55;
  const cx = width / 2;
  const cy = height / 2 - iconSize * 0.1;
  const r = iconSize * 0.35;
  const hourLen = r * 0.5;
  const minLen = r * 0.72;
  const hourAngle = -60 * (Math.PI / 180);
  const minAngle = 60 * (Math.PI / 180);
  const hx = cx + hourLen * Math.sin(hourAngle);
  const hy = cy - hourLen * Math.cos(hourAngle);
  const mx = cx + minLen * Math.sin(minAngle);
  const my = cy - minLen * Math.cos(minAngle);
  const strokeW = Math.max(iconSize * 0.04, 3);
  const dotR = strokeW * 1.2;

  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) * (Math.PI / 180);
    const outerR = r * 0.92;
    const innerR = i % 3 === 0 ? r * 0.76 : r * 0.82;
    const x1 = cx + innerR * Math.sin(angle);
    const y1 = cy - innerR * Math.cos(angle);
    const x2 = cx + outerR * Math.sin(angle);
    const y2 = cy - outerR * Math.cos(angle);
    const tw = i % 3 === 0 ? strokeW * 1.2 : strokeW * 0.7;
    ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${WHITE}" stroke-width="${tw}" stroke-linecap="round"/>`;
  }

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${BG}"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${BLUE}" stroke-width="${strokeW * 1.8}"/>
      ${ticks}
      <line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="${WHITE}" stroke-width="${strokeW * 1.5}" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="${BLUE}" stroke-width="${strokeW}" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="${dotR}" fill="${WHITE}"/>
      <text x="${cx}" y="${cy + r + iconSize * 0.18}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${iconSize * 0.12}" font-weight="700" fill="${WHITE}">PLANTÃO</text>
    </svg>`;
}

async function generate() {
  const outDir = path.join(__dirname, 'assets', 'images');

  // App icon (1024x1024)
  await sharp(Buffer.from(clockSvg(1024)))
    .png().toFile(path.join(outDir, 'icon.png'));
  console.log('Generated icon.png');

  // Adaptive icon (1024x1024 with more padding)
  await sharp(Buffer.from(clockSvg(1024, 150)))
    .png().toFile(path.join(outDir, 'adaptive-icon.png'));
  console.log('Generated adaptive-icon.png');

  // Favicon (48x48)
  await sharp(Buffer.from(clockSvg(512)))
    .resize(48, 48)
    .png().toFile(path.join(outDir, 'favicon.png'));
  console.log('Generated favicon.png');

  // Splash icon (200x200 centered clock)
  await sharp(Buffer.from(splashSvg(1284, 2778)))
    .resize(1284, 2778)
    .png().toFile(path.join(outDir, 'splash-icon.png'));
  console.log('Generated splash-icon.png');
}

generate().catch(console.error);
