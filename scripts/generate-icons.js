#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function generateIcons() {
  try {
    // Try to use sharp with resvg
    const sharp = require('sharp');

    const svgPath = path.join(__dirname, '../apps/mobile/assets/AuraLogo.svg');
    const svgBuffer = fs.readFileSync(svgPath);

    const icons = [
      { name: 'icon.png', size: 1024 },           // App icon
      { name: 'adaptive-icon.png', size: 1024 },  // Android adaptive icon
      { name: 'splash-icon.png', size: 512 },     // Splash screen icon
      { name: 'favicon.png', size: 48 }           // Web favicon
    ];

    console.log('Generating icons from AuraLogo.svg...\n');

    for (const icon of icons) {
      const outputPath = path.join(__dirname, '../apps/mobile/assets', icon.name);

      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }

    console.log('\n✅ All icons generated successfully!');

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('\nPlease install required dependencies:');
    console.log('  npm install sharp --save-dev');
    process.exit(1);
  }
}

generateIcons();
