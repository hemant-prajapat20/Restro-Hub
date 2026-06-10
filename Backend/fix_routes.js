const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir);

files.forEach(file => {
  if (file.endsWith('.ts')) {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;

    // Fix imports
    if (content.includes("'../middleware/auth'")) {
      content = content.replace(/'\.\.\/middleware\/auth'/g, "'../middleware/auth.middleware'");
      modified = true;
    }

    // Fix requireRole
    if (content.includes('requireRole')) {
      content = content.replace(/requireRole/g, 'authorize');
      content = content.replace(/authorize\('BUSINESS_ADMIN'\)/g, 'authorize(Role.BUSINESS_ADMIN)');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', file);
    }
  }
});
