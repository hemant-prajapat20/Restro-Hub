import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourKeySecretHere',
    });

    const { amount, currency = 'INR', receipt = 'receipt_1' } = req.body;

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error: any) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'YourKeySecretHere')
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.status(200).json({ status: 'success', message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ status: 'error', message: 'Invalid signature' });
    }
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
