/**
 * Generates a static JSON manifest of texture files.
 * Run at build time so the API route doesn't need fs access on Netlify serverless.
 */
const fs = require('fs');
const path = require('path');

const texturesDir = path.join(__dirname, '..', 'public', 'textures');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'texture-manifest.json');

const files = fs.readdirSync(texturesDir);
const imageFiles = files.filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

fs.writeFileSync(outputPath, JSON.stringify(imageFiles, null, 2));
console.log(`Texture manifest generated: ${imageFiles.length} files → src/data/texture-manifest.json`);
