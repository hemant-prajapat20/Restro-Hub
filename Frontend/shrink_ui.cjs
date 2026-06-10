const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/views/businessAdmin');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex replacements for container sizing
  content = content.replace(/rounded-\[40px\]/g, 'rounded-2xl');
  content = content.replace(/rounded-3xl/g, 'rounded-2xl');
  
  // Padding reductions
  content = content.replace(/\bp-8\b/g, 'p-5');
  content = content.replace(/\bp-10\b/g, 'p-6');
  content = content.replace(/\bp-6\b/g, 'p-4');
  
  // Specific large image box shrinks in BarLounge / CafeBakery / etc.
  content = content.replace(/w-20 h-20/g, 'w-14 h-14');
  content = content.replace(/h-20 w-20/g, 'h-14 w-14');
  
  // Make large headings a bit smaller
  content = content.replace(/text-3xl/g, 'text-2xl');
  content = content.replace(/text-4xl/g, 'text-3xl');

  // Shrink gap sizes on big flex grids
  content = content.replace(/gap-8/g, 'gap-5');
  content = content.replace(/gap-6/g, 'gap-4');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
