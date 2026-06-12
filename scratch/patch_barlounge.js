const fs = require('fs');

function patchBarLounge() {
  const file = 'c:/Restrohub-web/Frontend/src/views/businessAdmin/BarLounge.tsx';
  let content = fs.readFileSync(file, 'utf-8');

  // Add imports
  if (!content.includes('initializeRazorpayPayment')) {
    content = content.replace(
      "import { FileText } from 'lucide-react';",
      "import { FileText } from 'lucide-react';\nimport { initializeRazorpayPayment } from '../../utils/razorpay';\nimport { generateReceiptPDF } from '../../utils/pdfGenerator';"
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
  const oldCheckout = `const handleCheckout = () => {
    if (cart.length === 0) return;

    checkoutBarMutation.mutate(cart);

    // Generate Invoice receipt
    const invoiceNum = 'MSN-BAR-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();

    setCheckoutReceipt({
      invoiceNumber: invoiceNum,
      timestamp: dateStr,
      items: [...cart],
      suiteFee: suiteFeeAmount,
      suiteName: '',
      subtotal: cartSubtotal,
      discount: discountAmount,
      serviceCharge,
      cgst,
      sgst,
      total: cartTotal,
      table: targetTable,
      payment: paymentMethod,
      mixologist: 'Alba Thorne (Head Sommelier)'
    });
  };`;

  const newCheckout = `const handleCheckout = () => {
    if (cart.length === 0) return;

    const invoiceNum = 'MSN-BAR-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();

    const processOrder = () => {
      checkoutBarMutation.mutate(cart);

      // Generate PDF Invoice like Car Wash App
      generateReceiptPDF({
        title: "RESTRO BAR LOUNGE",
        invoiceNumber: invoiceNum,
        timestamp: dateStr,
        tableName: targetTable,
        items: cart.map(c => ({ name: c.item.name, price: c.item.pricePerGlass, quantity: c.quantity })),
        subtotal: cartSubtotal,
        tax: cgst + sgst + serviceCharge,
        discount: discountAmount,
        discountCode: discountCode,
        total: cartTotal,
        paymentMethod: paymentMethod || 'Cash'
      });

      setCheckoutReceipt({
        invoiceNumber: invoiceNum,
        timestamp: dateStr,
        items: [...cart],
        suiteFee: suiteFeeAmount,
        suiteName: '',
        subtotal: cartSubtotal,
        discount: discountAmount,
        serviceCharge,
        cgst,
        sgst,
        total: cartTotal,
        table: targetTable,
        payment: paymentMethod,
        mixologist: 'Alba Thorne (Head Sommelier)'
      });
    };

    if (paymentMethod === 'UPI' || paymentMethod === 'Online') {
      initializeRazorpayPayment({
        amount: cartTotal,
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

  content = content.replace(oldCheckout, newCheckout);
  fs.writeFileSync(file, content);
  console.log('Patched BarLounge');
}

patchBarLounge();
