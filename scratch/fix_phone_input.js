const fs = require('fs');

function fixPhoneInput() {
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

    const oldInput = `<input 
                      type="text" 
                      placeholder="Mobile Number" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:border-brand-accent outline-none"
                    />`;

    const newInput = `<div>
                      <input 
                        type="text" 
                        placeholder="Mobile Number (10 digits)" 
                        maxLength={10}
                        value={customerPhone}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\\d+$/.test(val)) {
                            setCustomerPhone(val);
                          }
                        }}
                        className={\`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all \${
                          customerPhone && customerPhone.length !== 10 
                            ? 'border-red-400 focus:border-red-500 text-red-600 focus:ring-2 focus:ring-red-100' 
                            : 'border-slate-200 focus:border-brand-accent'
                        }\`}
                      />
                      {customerPhone && customerPhone.length !== 10 && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1 ml-1">Must be exactly 10 digits</p>
                      )}
                    </div>`;

    if (content.includes('onChange={(e) => setCustomerPhone(e.target.value)}')) {
        content = content.replace(oldInput, newInput);
        // Fallback replacement if whitespace differs
        content = content.replace(
            /<input\s+type="text"\s+placeholder="Mobile Number"\s+value=\{customerPhone\}\s+onChange=\{\(e\) => setCustomerPhone\(e\.target\.value\)\}\s+className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:border-brand-accent outline-none"\s*\/>/g,
            newInput
        );
        fs.writeFileSync(file, content);
        console.log('Fixed phone input in', file);
    }
  }
}

fixPhoneInput();
