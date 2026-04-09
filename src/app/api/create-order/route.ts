import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_1234567890",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "abcdef1234567890",
  });
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { eventId, tierId, quantity = 1 } = await req.json();

    if (!eventId || !tierId || quantity < 1) {
      return NextResponse.json({ success: false, message: "Invalid order details" }, { status: 400 });
    }

    // Lazy release of expired orders for this tier
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const expiredOrders = await prisma.order.findMany({
      where: {
        tierId: tierId,
        status: "PENDING",
        createdAt: { lt: tenMinutesAgo }
      }
    });

    if (expiredOrders.length > 0) {
      // Begin cleanup
      await prisma.$transaction(async (tx) => {
        let totalToRelease = 0;
        for (const order of expiredOrders) {
          totalToRelease += order.quantity;
          await tx.order.update({
            where: { id: order.id },
            data: { status: "EXPIRED" }
          });
        }
        if (totalToRelease > 0) {
          await tx.ticketTier.update({
            where: { id: tierId },
            data: { capacity: { increment: totalToRelease } }
          });
        }
      });
    }

    // Now, run the actual reservation transaction
    const orderData = await prisma.$transaction(async (tx) => {
      // Check tier capacity
      const tier = await tx.ticketTier.findUnique({
        where: { id: tierId },
      });

      if (!tier || tier.capacity < quantity) {
        throw new Error("Tickets sold out or insufficient capacity");
      }

      // Deduct capacity temporarily
      await tx.ticketTier.update({
        where: { id: tierId },
        data: { capacity: { decrement: quantity } }
      });

      const amount = tier.price * quantity;
      
      return { amount, currency: "INR" };
    });

    // Create Razorpay Order
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(orderData.amount * 100), // amount in the smallest currency unit
      currency: orderData.currency,
      receipt: `receipt_${Date.now()}`,
    });

    // Save PENDING order to DB
    const newDbOrder = await prisma.order.create({
      data: {
        razorpayOrderId: razorpayOrder.id,
        status: "PENDING",
        amount: orderData.amount,
        currency: orderData.currency,
        quantity,
        userId,
        eventId,
        tierId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    });

    return NextResponse.json({
      success: true,
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderDbId: newDbOrder.id,
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
