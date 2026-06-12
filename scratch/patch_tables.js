const fs = require('fs');

function patchTables() {
  const file = 'c:/Restrohub-web/Frontend/src/views/businessAdmin/Tables.tsx';
  let content = fs.readFileSync(file, 'utf-8');

  // Add imports
  if (!content.includes('initializeRazorpayPayment')) {
    content = content.replace(
      "import { Map as MapIcon",
      "import { initializeRazorpayPayment } from '../../utils/razorpay';\nimport { generateReceiptPDF } from '../../utils/pdfGenerator';\nimport { Map as MapIcon"
    );
  }

  // Replace payment methods
  content = content.replace(
    /useState<'UPI' \| 'Card' \| 'Cash'>\('UPI'\);/g,
    "useState<'Cash' | 'UPI' | 'Online'>('Cash');"
  );

  content = content.replace(
    /\(\['UPI', 'Card', 'Cash'\] as const\)\.map/g,
    "(['Cash', 'UPI', 'Online'] as const).map"
  );

  // Replace handleSettleAndClear
  const oldSettle = `const handleSettleAndClear = (tableId: string) => {
    const total = computeTableTotal(tableId);
    const subtotal = computeTableSubtotal(tableId);

    // Generate physical settlement receipt
    const invoiceNum = 'IND-TBL-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();
    
    setSettledReceipt({
      invoiceNumber: invoiceNum,
      timestamp: dateStr,
      tableNumber: selectedTable?.number,
      items: tableOrders[tableId] || [],
      subtotal: subtotal,
      tax: computeTableTax(tableId),
      discount: Math.round(subtotal * (appliedDiscount / 100)),
      total: total,
      payment: paymentMethod
    });

    // Mark table as 'Cleaning' using backend
    clearTableMutation.mutate(tableId);

    setTableOrders(prev => {
      const copy = { ...prev };
      delete copy[tableId];
      return copy;
    });

    // Reset checkout forms
    setAppliedDiscount(0);
    setDiscountCode('');
  };`;

  const newSettle = `const handleSettleAndClear = (tableId: string) => {
    const total = computeTableTotal(tableId);
    const subtotal = computeTableSubtotal(tableId);

    const invoiceNum = 'IND-TBL-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();
    
    const processOrder = () => {
      // Generate PDF Invoice like Car Wash App
      generateReceiptPDF({
        title: "RESTROHUB TABLES",
        invoiceNumber: invoiceNum,
        timestamp: dateStr,
        tableName: selectedTable?.number,
        items: (tableOrders[tableId] || []).map(c => ({ name: c.name, price: c.price, quantity: c.quantity })),
        subtotal: subtotal,
        tax: computeTableTax(tableId),
        discount: Math.round(subtotal * (appliedDiscount / 100)),
        discountCode: discountCode,
        total: total,
        paymentMethod: paymentMethod || 'Cash'
      });

      setSettledReceipt({
        invoiceNumber: invoiceNum,
        timestamp: dateStr,
        tableNumber: selectedTable?.number,
        items: tableOrders[tableId] || [],
        subtotal: subtotal,
        tax: computeTableTax(tableId),
        discount: Math.round(subtotal * (appliedDiscount / 100)),
        total: total,
        payment: paymentMethod
      });

      clearTableMutation.mutate(tableId);

      setTableOrders(prev => {
        const copy = { ...prev };
        delete copy[tableId];
        return copy;
      });

      setAppliedDiscount(0);
      setDiscountCode('');
    };

    if (paymentMethod === 'UPI' || paymentMethod === 'Online') {
      initializeRazorpayPayment({
        amount: total,
        receiptId: invoiceNum,
        onSuccess: (pid) => {
          import('react-hot-toast').then(toast => toast.default.success('Payment Verified: ' + pid));
          processOrder();
        },
        onFailure: (err) => console.error(err)
      });
    } else {
      processOrder();
    }
  };`;

  content = content.replace(oldSettle, newSettle);
  fs.writeFileSync(file, content);
  console.log('Patched Tables');
}

patchTables();
