import fs from 'node:fs';
import sharp from 'sharp';

fs.mkdirSync('public/icons', { recursive: true });
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  const stroke = Math.max(4, Math.round(size * 0.055));
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="100%" height="100%" rx="${Math.round(size * 0.2)}" fill="#7b4b5f"/>
      <circle cx="50%" cy="52%" r="27%" fill="none" stroke="#f6eee8" stroke-width="${stroke}"/>
      <circle cx="50%" cy="52%" r="9%" fill="#c7a86a"/>
      <path d="M${size * 0.28} ${size * 0.3}h${size * 0.14}l${size * 0.05} ${size * 0.07}h${size * 0.25}"
        fill="none" stroke="#f6eee8" stroke-width="${stroke}" stroke-linecap="round"/>
    </svg>
  `);
  await sharp(svg).png().toFile(`public/icons/icon-${size}.png`);
  if (size === 192 || size === 512) {
    await sharp(svg).resize(Math.round(size * 0.82), Math.round(size * 0.82), { fit: 'contain', background: '#7b4b5f' })
      .extend({
        top: Math.ceil(size * 0.09),
        bottom: Math.floor(size * 0.09),
        left: Math.ceil(size * 0.09),
        right: Math.floor(size * 0.09),
        background: '#7b4b5f',
      })
      .resize(size, size)
      .png()
      .toFile(`public/icons/icon-${size}-maskable.png`);
  }
}

await sharp('public/icons/icon-96.png').grayscale().png().toFile('public/icons/badge-96.png');
fs.copyFileSync('public/icons/icon-192.png', 'public/apple-touch-icon.png');
