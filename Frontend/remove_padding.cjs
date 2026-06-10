const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'views', 'businessAdmin');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = content.replace(/className="p-8 space-y-8 /g, 'className="px-8 pt-8 pb-0 space-y-8 ');
  updated = updated.replace(/className="p-8 max-w-/g, 'className="px-8 pt-8 pb-0 max-w-');
  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    console.log(`Updated ${file}`);
  }
}
