import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ success: false, message: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "default_webhook_secret";

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      await processPaymentSuccess(razorpayOrderId);
    } else if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      await processPaymentFailure(razorpayOrderId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

async function processPaymentSuccess(razorpayOrderId: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { razorpayOrderId },
    });

    if (!order || order.status === "PAID") return; // Idempotency Check

    for (let i = 0; i < order.quantity; i++) {
        await tx.ticket.create({
          data: {
            eventId: order.eventId,
            tierId: order.tierId,
            userId: order.userId,
            orderId: order.id,
            qrCode: `ES-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            status: "PAID",
          } as any,
        });
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID" }
    });
  });
}

async function processPaymentFailure(razorpayOrderId: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { razorpayOrderId },
    });

    if (!order || order.status !== "PENDING") return; // Idempotency Check

    await tx.order.update({
        where: { id: order.id },
        data: { status: "FAILED" }
    });
    
    // Restore capacity on failure
    await tx.ticketTier.update({
        where: { id: order.tierId },
        data: { capacity: { increment: order.quantity } }
    });
  });
}
