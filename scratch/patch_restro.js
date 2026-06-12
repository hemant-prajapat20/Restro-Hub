const fs = require('fs');

function patchRestroSignature() {
  const file = 'c:/Restrohub-web/Frontend/src/views/businessAdmin/RestroSignature.tsx';
  let content = fs.readFileSync(file, 'utf-8');

  // Add imports
  if (!content.includes('initializeRazorpayPayment')) {
    content = content.replace(
      "import { Crown, Plus",
      "import { initializeRazorpayPayment } from '../../utils/razorpay';\nimport { generateReceiptPDF } from '../../utils/pdfGenerator';\nimport { Crown, Plus"
    );
  }

  // Replace payment methods
  content = content.replace(
    /useState<'UPI' \| 'Card' \| 'Maison Guild Tab'>\('UPI'\);/g,
    "useState<'Cash' | 'UPI' | 'Online'>('Cash');"
  );

  content = content.replace(
    /<option value="UPI">Instant UPI \(Tejas\/BHIM\)<\/option>\s*<option value="Card">Visa Signature Metallic<\/option>\s*<option value="Maison Guild Tab">Maison Membership Journal<\/option>/g,
    `<option value="Cash">Cash Settlement</option>
                        <option value="UPI">Instant UPI (Tejas/BHIM)</option>
                        <option value="Online">Online / Card (Razorpay)</option>`
  );

  // Replace handleCheckout
  const oldCheckout = `const handleRestroCheckout = () => {
    if (cart.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Guest Name and Contact are required for billing.');
      return;
    }

    // Checkout API
    checkoutPdrMutation.mutate({ id: targetRoomId, data: { totalBill: cartTotal } });

    // Generate Imperial fine-dining receipt
    const invoiceNum = 'ROYAL-POS-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();

    const newReceipt = {
      chef: 'Ranveer Brar (Executive Chef)'
    ,
      customerName: customerName || 'Walk-in VIP',
      customerPhone: customerPhone || 'N/A',
      hotelName,
      hotelLocation
    };
    setCheckoutReceipt(newReceipt);
    setInvoiceHistory(prev => [newReceipt, ...prev]);
  };`;

  const newCheckout = `const handleRestroCheckout = () => {
    if (cart.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      import('react-hot-toast').then(t => t.default.error('Guest Name and Contact are required for billing.'));
      return;
    }

    const invoiceNum = 'ROYAL-POS-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();

    const processOrder = () => {
      checkoutPdrMutation.mutate({ id: targetRoomId, data: { totalBill: cartTotal } });

      generateReceiptPDF({
        title: "RESTRO SIGNATURE SUITE",
        invoiceNumber: invoiceNum,
        timestamp: dateStr,
        tableName: pdrs.find(p => p.id === targetRoomId)?.name || targetRoomId,
        items: cart.map(c => ({ name: c.dish.name, price: c.dish.price, quantity: c.quantity })),
        subtotal: cartSubtotal,
        tax: cgst + sgst + serviceCharge,
        discount: discountAmount,
        discountCode: discountCode,
        total: cartTotal,
        paymentMethod: paymentMethod || 'Cash',
        customerName: customerName,
        customerPhone: customerPhone
      });

      const newReceipt = {
        chef: 'Ranveer Brar (Executive Chef)',
        customerName: customerName || 'Walk-in VIP',
        customerPhone: customerPhone || 'N/A',
        hotelName,
        hotelLocation,
        invoiceNumber: invoiceNum,
        timestamp: dateStr,
        total: cartTotal,
        items: [...cart],
        subtotal: cartSubtotal,
        discount: discountAmount,
        serviceCharge,
        cgst,
        sgst,
        payment: paymentMethod
      };
      
      setCheckoutReceipt(newReceipt as any);
      setInvoiceHistory(prev => [newReceipt as any, ...prev]);
    };

    if (paymentMethod === 'UPI' || paymentMethod === 'Online') {
      initializeRazorpayPayment({
        amount: cartTotal,
        receiptId: invoiceNum,
        customerName: customerName,
        customerContact: customerPhone,
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

  content = content.replace(oldCheckout, newCheckout);
  fs.writeFileSync(file, content);
  console.log('Patched RestroSignature');
}

patchRestroSignature();
