import toast from 'react-hot-toast';

interface RazorpayOptions {
  amount: number; // Amount in INR
  receiptId: string;
  customerName?: string;
  customerEmail?: string;
  customerContact?: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: any) => void;
}

export const initializeRazorpayPayment = async (options: RazorpayOptions) => {
  const token = localStorage.getItem('token');
  
  try {
    // 1. Create order on backend
    const orderRes = await fetch('http://localhost:5000/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: options.amount,
        receipt: options.receiptId
      })
    });
    
    const orderData = await orderRes.json();
    
    if (orderData.status !== 'success') {
      throw new Error(orderData.message || 'Failed to initialize payment');
    }

    const { id: order_id, amount, currency } = orderData.data;

    // 2. Open Razorpay Checkout
    const rzpOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere', // Fallback for dev
      amount: amount.toString(),
      currency,
      name: 'RestroHub POS',
      description: `Payment for Receipt: ${options.receiptId}`,
      image: 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png',
      order_id,
      handler: async function (response: any) {
        // 3. Verify Payment on Backend
        try {
          const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.status === 'success') {
            options.onSuccess(response.razorpay_payment_id);
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (err: any) {
          options.onFailure(err);
        }
      },
      prefill: {
        name: options.customerName || 'Walk-in Customer',
        email: options.customerEmail || 'customer@example.com',
        contact: options.customerContact || '9999999999'
      },
      notes: {
        address: 'RestroHub Corporate Office'
      },
      theme: {
        color: '#d97706' // Amber-600
      }
    };

    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.on('payment.failed', function (response: any) {
      options.onFailure(response.error);
    });
    rzp.open();

  } catch (error: any) {
    console.error('Razorpay Error:', error);
    toast.error(error.message || 'Payment integration failed');
    options.onFailure(error);
  }
};
