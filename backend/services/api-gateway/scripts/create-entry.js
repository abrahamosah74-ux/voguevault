const fs = require('fs');
const path = require('path');

// Create a top-level dist/index.js that requires the actual emitted file
const distRoot = path.resolve(__dirname, '..', 'dist');
const targetRel = './services/api-gateway/src/index.js';
const entryPath = path.join(distRoot, 'index.js');

try {
  if (!fs.existsSync(distRoot)) fs.mkdirSync(distRoot, { recursive: true });
  const content = `try { require('${targetRel}'); } catch (err) { console.error(err); process.exit(1); }\n`;
  fs.writeFileSync(entryPath, content, 'utf8');
  console.log('Created', entryPath);
} catch (err) {
  console.error('Failed to create entry file', err);
  process.exit(1);
}
