const fs = require('fs');
const files = [
  'c:/Restrohub-web/Frontend/src/views/businessAdmin/Transactions.tsx',
  'c:/Restrohub-web/Frontend/src/views/businessAdmin/MessageCenter.tsx'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
    fs.writeFileSync(f, content);
  }
}
console.log('Fixed syntax escaping errors');
