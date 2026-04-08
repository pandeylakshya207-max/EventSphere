import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      tierId,
      quantity = 1,
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Create the ticket in DB
      const u = session.user as any;
      let firstTicketId = "";
      
      for(let i = 0; i < quantity; i++) {
        const ticket = await prisma.ticket.create({
          data: {
            eventId,
            tierId,
            userId: u.id,
            qrCode: `ES-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            status: "PAID",
          } as any,
        });
        if (i === 0) firstTicketId = ticket.id;
      }

      return NextResponse.json({ 
        success: true, 
        message: "Payment verified", 
        ticketId: firstTicketId // Pass first ticket ID back for redirection 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid signature" 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Verification failed" 
    }, { status: 500 });
  }
}
