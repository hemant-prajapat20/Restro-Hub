const fs = require('fs');

function patchCafeBakery() {
  const file = 'c:/Restrohub-web/Frontend/src/views/businessAdmin/CafeBakery.tsx';
  let content = fs.readFileSync(file, 'utf-8');

  // Add imports
  if (!content.includes('initializeRazorpayPayment')) {
    content = content.replace(
      "import { Coffee } from 'lucide-react';",
      "import { Coffee } from 'lucide-react';\nimport { initializeRazorpayPayment } from '../../utils/razorpay';\nimport { generateReceiptPDF } from '../../utils/pdfGenerator';"
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

    checkoutCafeMutation.mutate(cart);

    // Create virtual physical receipt
    const receipt = {
      invoiceNumber: 'MAISON-CF-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      table: targetTable,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      serviceCharge,
      cgst,
      sgst,
      total: cartTotal,
      payment: paymentMethod,
      barista: 'Somesh Roy (Senior Barista)'
    };

    setCheckoutReceipt(receipt);
  };`;

  const newCheckout = `const handleCheckout = () => {
    if (cart.length === 0) return;

    const receipt = {
      invoiceNumber: 'MAISON-CF-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      table: targetTable,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      serviceCharge,
      cgst,
      sgst,
      total: cartTotal,
      payment: paymentMethod || 'Cash',
      barista: 'Somesh Roy (Senior Barista)'
    };

    const processOrder = () => {
      checkoutCafeMutation.mutate(cart);

      // Generate PDF Invoice like Car Wash App
      generateReceiptPDF({
        title: "CAFE & PATISSERIE",
        invoiceNumber: receipt.invoiceNumber,
        timestamp: receipt.timestamp,
        tableName: targetTable,
        items: cart.map(c => ({ name: c.item.name, price: c.item.price, quantity: c.quantity })),
        subtotal: cartSubtotal,
        tax: cgst + sgst + serviceCharge,
        discount: discountAmount,
        discountCode: discountCode,
        total: cartTotal,
        paymentMethod: paymentMethod || 'Cash'
      });

      setCheckoutReceipt(receipt);
    };

    if (paymentMethod === 'UPI' || paymentMethod === 'Online') {
      initializeRazorpayPayment({
        amount: cartTotal,
        receiptId: receipt.invoiceNumber,
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
  console.log('Patched CafeBakery');
}

patchCafeBakery();
