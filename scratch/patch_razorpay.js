const fs = require('fs');

function patchPOS() {
  const file = 'c:/Restrohub-web/Frontend/src/views/businessAdmin/POS.tsx';
  let content = fs.readFileSync(file, 'utf-8');

  // Add import
  if (!content.includes('initializeRazorpayPayment')) {
    content = content.replace(
      "import { FilterBar } from '../../components/FilterBar';",
      "import { FilterBar } from '../../components/FilterBar';\nimport { initializeRazorpayPayment } from '../../utils/razorpay';"
    );
  }

  // Replace payment methods array
  content = content.replace(
    /\[\s*\{\s*id:\s*'Cash'[\s\S]*?'Wallet'[\s\S]*?\}\s*\]\.map/g,
    `[
                    { id: 'Cash', icon: Banknote, label: 'Cash' },
                    { id: 'UPI', icon: Smartphone, label: 'UPI' },
                    { id: 'Online', icon: CreditCard, label: 'Online' }
                  ].map`
  );

  // Replace the COMPLETE button onClick logic
  const originalCompleteButton = `onClick={() => {
                      const invoiceNum = 'IND-POS-' + Math.floor(100000 + Math.random() * 900000);
                      const timestampStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();
                      
                      // Map OrderItems to PDFReceiptItems
                      const receiptItems = cart.map(item => ({
                        itemId: item.itemId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                      }));

                      // Generate PDF receipt directly
                      generateReceiptPDF({
                        title: "Indulge Express POS",
                        invoiceNumber: invoiceNum,
                        timestamp: timestampStr,
                        tableName: "Express Counter",
                        items: receiptItems,
                        subtotal: subTotal,
                        tax: sgst + cgst,
                        total: total,
                        paymentMethod: paymentMethod || 'Cash'
                      });

                      // Also hit backend to save order
                      orderMutation.mutate({
                        type: 'POS',
                        items: cart.map(c => ({
                          menuItem: c.itemId,
                          name: c.name,
                          quantity: c.quantity,
                          price: c.price,
                          status: 'Served'
                        })),
                        subtotal: subTotal,
                        tax: sgst + cgst,
                        total: total,
                        paymentMethod: paymentMethod || 'Cash',
                        status: 'Completed'
                      });

                      setCart([]);
                      setShowCheckout(false);
                      setPaymentMethod(null);
                    }}`;

  const newCompleteButton = `onClick={() => {
                      const invoiceNum = 'IND-POS-' + Math.floor(100000 + Math.random() * 900000);
                      const timestampStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString();
                      
                      const processOrder = () => {
                        const receiptItems = cart.map(item => ({
                          itemId: item.itemId,
                          name: item.name,
                          price: item.price,
                          quantity: item.quantity
                        }));

                        // Generate enhanced car-wash style invoice PDF
                        generateReceiptPDF({
                          title: "Indulge Express POS",
                          invoiceNumber: invoiceNum,
                          timestamp: timestampStr,
                          tableName: "Express Counter",
                          items: receiptItems,
                          subtotal: subTotal,
                          tax: sgst + cgst,
                          total: total,
                          paymentMethod: paymentMethod || 'Cash'
                        });

                        orderMutation.mutate({
                          type: 'POS',
                          items: cart.map(c => ({
                            menuItem: c.itemId,
                            name: c.name,
                            quantity: c.quantity,
                            price: c.price,
                            status: 'Served'
                          })),
                          subtotal: subTotal,
                          tax: sgst + cgst,
                          total: total,
                          paymentMethod: paymentMethod || 'Cash',
                          status: 'Completed'
                        });

                        setCart([]);
                        setShowCheckout(false);
                        setPaymentMethod(null);
                      };

                      if (paymentMethod === 'UPI' || paymentMethod === 'Online') {
                        initializeRazorpayPayment({
                          amount: total,
                          receiptId: invoiceNum,
                          onSuccess: (pid) => {
                            toast.success('Razorpay Payment Successful: ' + pid);
                            processOrder();
                          },
                          onFailure: (err) => {
                            console.error('Payment failed', err);
                          }
                        });
                      } else {
                        processOrder();
                      }
                    }}`;

  content = content.replace(originalCompleteButton, newCompleteButton);

  fs.writeFileSync(file, content);
  console.log('Patched POS');
}

patchPOS();
