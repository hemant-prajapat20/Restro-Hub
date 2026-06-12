const fs = require('fs');

function patchPosFiles() {
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

    // 1. Add state variables for customer details
    if (!content.includes('const [customerName, setCustomerName]')) {
      content = content.replace(
        /const \[paymentMethod, setPaymentMethod\] = useState<any>\(null\);/g,
        "const [paymentMethod, setPaymentMethod] = useState<any>(null);\n  const [customerName, setCustomerName] = useState('');\n  const [customerPhone, setCustomerPhone] = useState('');"
      );
      // Fallback if the first didn't match
      content = content.replace(
        /const \[paymentMethod, setPaymentMethod\] = useState<'Cash' \| 'UPI' \| 'Online'>\('Cash'\);/g,
        "const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Online'>('Cash');\n  const [customerName, setCustomerName] = useState('');\n  const [customerPhone, setCustomerPhone] = useState('');"
      );
    }

    // 2. Add customer input fields in the UI before payment methods
    const customerInputs = `
                <div className="mb-6 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Customer Details (Optional)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Customer Name" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:border-brand-accent outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Mobile Number" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:border-brand-accent outline-none"
                    />
                  </div>
                </div>
`;

    // Insert just before "payment method" grid or label depending on file
    if (content.includes('<div className="grid grid-cols-2 gap-4 mb-8">') && !content.includes('Customer Details (Optional)')) {
      content = content.replace(
        /<div className="grid grid-cols-2 gap-4 mb-8">/,
        customerInputs + '\n                <div className="grid grid-cols-2 gap-4 mb-8">'
      );
    } else if (content.includes('<div className="grid grid-cols-3 gap-3 mb-6">') && !content.includes('Customer Details (Optional)')) {
      content = content.replace(
        /<div className="grid grid-cols-3 gap-3 mb-6">/,
        customerInputs + '\n                <div className="grid grid-cols-3 gap-3 mb-6">'
      );
    } else if (file.includes('Tables.tsx') && !content.includes('Customer Details (Optional)')) {
      content = content.replace(
        /<div className="space-y-4 mb-8">/g,
        customerInputs + '\n                <div className="space-y-4 mb-8">'
      );
    }

    // 3. Remove generateReceiptPDF from processOrder / handleSettleAndClear
    // We can use a regex to match the generateReceiptPDF block
    content = content.replace(/generateReceiptPDF\(\{\s*title[\s\S]*?\}\);/g, '');

    // 4. Add customerDetails to orderMutation
    if (content.includes('orderMutation.mutate({')) {
      content = content.replace(
        /paymentMethod: paymentMethod \|\| 'Cash',\s*status: 'Completed'/g,
        "paymentMethod: paymentMethod || 'Cash',\n                          status: 'Completed',\n                          customerDetails: { name: customerName, phone: customerPhone }"
      );
    }

    // 5. Change button text from "COMPLETE & DOWNLOAD PDF" to "COMPLETE PAYMENT"
    content = content.replace(/COMPLETE & DOWNLOAD PDF/g, 'COMPLETE PAYMENT');

    fs.writeFileSync(file, content);
    console.log('Patched', file);
  }
}

patchPosFiles();
