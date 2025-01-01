const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconPath = path.join(__dirname, '../public/icons');
const svgPath = path.join(iconPath, 'icon.svg');

async function generateIcons() {
  try {
    // Create icons directory if it doesn't exist
    await fs.mkdir(iconPath, { recursive: true });

    // Read the SVG file
    const svgBuffer = await fs.readFile(svgPath);

    // Generate icons for each size
    for (const size of sizes) {
      const outputPath = path.join(iconPath, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`Generated ${size}x${size} icon`);
    }

    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
