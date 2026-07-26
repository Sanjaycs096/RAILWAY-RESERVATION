import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      fixImports(fullPath);
    }
  }
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const importRegex = /from\s+['"](\.[^'"]+)['"]/g;
  content = content.replace(importRegex, (match, p1) => {
    if (p1.endsWith('.js') || p1.endsWith('.ts')) return match;
    
    // If it imports from src/types, map to src/types/index.js
    if (p1.endsWith('src/types')) {
      return `from '${p1}/index.js'`;
    }
    
    // Otherwise add .js
    return `from '${p1}.js'`;
  });

  if (content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed imports in', filePath);
  }
}

fixImports(path.join(__dirname, 'server.ts'));
processDirectory(path.join(__dirname, 'server'));
