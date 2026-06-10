const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir);

files.forEach(file => {
  if (file.endsWith('.ts')) {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;

    // Fix duplicate authorize
    if (content.includes('authorize, authorize')) {
      content = content.replace('authorize, authorize', 'authorize');
      modified = true;
    }

    // Add Role import if it has authorize(Role.BUSINESS_ADMIN) but no Role import
    if (content.includes('Role.BUSINESS_ADMIN') && !content.includes('Role } from')) {
      // Find the import line for middleware and insert Role import after it
      const importLine = "import { Role } from '../models/User';\n";
      // just put it at the top
      content = importLine + content;
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', file);
    }
  }
});
