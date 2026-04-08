import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_1234567890",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "abcdef1234567890",
  });
};

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR" } = await req.json();

    if (!amount) {
      return NextResponse.json({ success: false, message: "Amount is required" }, { status: 400 });
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    const errorMessage = error?.error?.description || error?.message || "Failed to create order";
    return NextResponse.json({ 
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
