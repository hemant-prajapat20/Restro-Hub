const fs = require('fs');

function fixState() {
  const files = [
    'c:/Restrohub-web/Frontend/src/views/businessAdmin/POS.tsx',
    'c:/Restrohub-web/Frontend/src/views/businessAdmin/BarLounge.tsx',
    'c:/Restrohub-web/Frontend/src/views/businessAdmin/CafeBakery.tsx',
    'c:/Restrohub-web/Frontend/src/views/businessAdmin/RestroSignature.tsx',
    'c:/Restrohub-web/Frontend/src/views/businessAdmin/Tables.tsx'
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf-8');

    // Check if customerName state exists
    if (!content.includes('const [customerName, setCustomerName]')) {
      // Find the first useState declaration inside the component and insert after it
      content = content.replace(
        /(const \[[a-zA-Z]+, set[a-zA-Z]+\] = useState.*?;\n)/,
        "$1  const [customerName, setCustomerName] = useState('');\n  const [customerPhone, setCustomerPhone] = useState('');\n"
      );
      fs.writeFileSync(file, content);
      console.log('Fixed state in', file);
    }
  }
}

fixState();
