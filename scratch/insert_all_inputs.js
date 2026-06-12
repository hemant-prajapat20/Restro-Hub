const fs = require('fs');

function patchInputs() {
  const files = [
    {
      path: 'c:/Restrohub-web/Frontend/src/views/businessAdmin/BarLounge.tsx',
      target: '<div className="space-y-4 pt-4 border-t border-stone-100">'
    },
    {
      path: 'c:/Restrohub-web/Frontend/src/views/businessAdmin/CafeBakery.tsx',
      target: '<div className="space-y-4 pt-4 border-t border-stone-100">'
    },
    {
      path: 'c:/Restrohub-web/Frontend/src/views/businessAdmin/Tables.tsx',
      target: '<div className="space-y-4 mb-8">'
    }
  ];

  for (const f of files) {
    if (fs.existsSync(f.path)) {
      let content = fs.readFileSync(f.path, 'utf-8');
      
      if (content.includes(f.target) && !content.includes('Guest Name (Required)')) {
        const inputs = `
                    <div className="flex gap-4 w-full mb-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest px-1">Guest Name (Required)</label>
                        <input 
                          type="text" 
                          placeholder="Name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-accent/30"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest px-1">Guest Contact</label>
                        <input 
                          type="text" 
                          placeholder="Mobile Number (10 digits)"
                          maxLength={10}
                          value={customerPhone}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^\\d+$/.test(val)) setCustomerPhone(val);
                          }}
                          className={\`w-full py-2.5 px-3 bg-stone-50 border rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-accent/30 \${customerPhone && customerPhone.length !== 10 ? 'border-red-400 focus:ring-red-100' : 'border-stone-200'}\`}
                        />
                      </div>
                    </div>`;
        content = content.replace(f.target, f.target + inputs);
        fs.writeFileSync(f.path, content);
        console.log('Patched', f.path);
      }
    }
  }
}

patchInputs();
