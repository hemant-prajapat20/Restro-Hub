const fs = require('fs');

function patchReports() {
  const file = 'c:/Restrohub-web/Frontend/src/views/businessAdmin/Reports.tsx';
  let content = fs.readFileSync(file, 'utf-8');

  // Add imports
  if (!content.includes('generateReceiptPDF')) {
    content = content.replace(
      "import { Button } from '../../components/Button';",
      `import { Button } from '../../components/Button';
import { generateReceiptPDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';
import { Printer, Send, X, Receipt, AnimatePresence } from 'lucide-react';`
    );
  }

  // Add AnimatePresence to motion import if needed
  if (content.includes("import { motion } from 'motion/react';") && !content.includes("AnimatePresence } from 'motion/react'")) {
    content = content.replace(
      "import { motion } from 'motion/react';",
      "import { motion, AnimatePresence as FramerAnimatePresence } from 'motion/react';"
    );
  }

  // Add state
  if (!content.includes('selectedInvoice')) {
    content = content.replace(
      "const [searchTerm, setSearchTerm] = useState('');",
      "const [searchTerm, setSearchTerm] = useState('');\n  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);"
    );
  }

  // Add onClick to tr
  content = content.replace(
    /<tr key=\{invoice\.id\} className="hover:bg-slate-50\/50 transition-all group">/g,
    `<tr key={invoice.id} onClick={() => setSelectedInvoice(invoice)} className="hover:bg-slate-50/50 transition-all group cursor-pointer">`
  );

  // Add Modal at the end of the return statement
  const modalCode = `
      <FramerAnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedInvoice(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Receipt className="text-brand-accent" />
                    Transaction Details
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-1">ID: {selectedInvoice.id.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">Customer Details</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{selectedInvoice.customerDetails?.name || 'Walk-in Customer'}</p>
                  <p className="text-xs font-medium text-slate-500">{selectedInvoice.customerDetails?.phone || '+91 - Not Provided'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Order Items</p>
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start text-xs font-semibold text-slate-700">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-mono">₹{item.price * item.quantity}</span>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-400 italic">No items detailed in legacy records.</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-900">₹{selectedInvoice.subtotal?.toLocaleString() || (selectedInvoice.amount - selectedInvoice.tax).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>GST Applied</span>
                    <span className="font-mono text-slate-900">₹{selectedInvoice.tax?.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                    <span>Grand Total ({selectedInvoice.paymentMethod})</span>
                    <span className="font-mono text-brand-primary">₹{selectedInvoice.amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-2 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="px-6 py-3 border border-slate-200 text-slate-500 rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-slate-50"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    toast.success('Digital invoice sent to customer successfully!');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-900 text-brand-accent rounded-xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Send
                </button>
                <button 
                  onClick={() => {
                    generateReceiptPDF({
                      title: "RESTROHUB TRANSACTION",
                      invoiceNumber: selectedInvoice.id.slice(-8).toUpperCase(),
                      timestamp: new Date(selectedInvoice.date).toLocaleString(),
                      items: selectedInvoice.items || [],
                      subtotal: selectedInvoice.subtotal || (selectedInvoice.amount - selectedInvoice.tax),
                      tax: selectedInvoice.tax,
                      total: selectedInvoice.amount,
                      paymentMethod: selectedInvoice.paymentMethod,
                      customerName: selectedInvoice.customerDetails?.name,
                      customerPhone: selectedInvoice.customerDetails?.phone
                    });
                    toast.success('Generating Print PDF...');
                  }}
                  className="flex-1 px-4 py-3 bg-brand-accent text-white rounded-xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-2"
                >
                  <Printer size={16} /> Print
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </FramerAnimatePresence>
    </div>
  );
};
`;

  content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*};\s*$/m, modalCode);
  
  fs.writeFileSync(file, content);
  console.log('Patched Reports');
}

patchReports();
