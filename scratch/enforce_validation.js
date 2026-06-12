const fs = require('fs');

function enforceValidation() {
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

    // Change label from Optional to Required
    content = content.replace(/Customer Details \(Optional\)/g, 'Customer Details (Required)');

    // Add validation logic to the "COMPLETE PAYMENT" button disabled attribute
    if (file.includes('Tables.tsx')) {
        content = content.replace(
            /disabled=\{(!paymentMethod .*?)\}/g,
            "disabled={$1 || !customerName.trim() || !customerPhone.match(/^\\d{10}$/)}"
        );
    } else {
        content = content.replace(
            /disabled=\{!paymentMethod \|\| [a-zA-Z]+\.isPending\}/g,
            "disabled={!paymentMethod || !customerName.trim() || !customerPhone.match(/^\\d{10}$/) || orderMutation.isPending}"
        );
    }

    fs.writeFileSync(file, content);
    console.log('Enforced validation in', file);
  }
}

enforceValidation();
