const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/views/businessAdmin');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to find search placeholders and replace them
  content = content.replace(/placeholder="Search rare labels, origins or vintages..."/g, 'placeholder="Search inventory..."');
  content = content.replace(/placeholder="Search beans, roast types, sourdough bakes..."/g, 'placeholder="Search catalog..."');
  content = content.replace(/placeholder="Search by name or phone..."/g, 'placeholder="Search customers..."');
  content = content.replace(/placeholder="Search raw spices, saffron, imported cuts, cellared liquids..."/g, 'placeholder="Search inventory..."');
  content = content.replace(/placeholder="Search by Dish Name or Description..."/g, 'placeholder="Search menu..."');
  content = content.replace(/placeholder="Search menu items \(Biryani, Naan...\)"/g, 'placeholder="Search POS..."');
  content = content.replace(/placeholder="Search staff names, assignments, shift schedules..."/g, 'placeholder="Search staff..."');
  content = content.replace(/placeholder="Search recipe catalog..."/g, 'placeholder="Search recipes..."');

  // Also make sure search inputs have `truncate` to avoid any overflow
  // We can just find input tags that have placeholder="Search and ensure they have truncate class
  content = content.replace(/(<input[^>]*placeholder="Search[^>]*className=")([^"]*)(")/g, (match, p1, p2, p3) => {
    if (!p2.includes('truncate')) {
      return `${p1}${p2} truncate${p3}`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated placeholders in ${file}`);
});
