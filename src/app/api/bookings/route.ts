import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, tierId, price } = await req.json();

    const ticket = await prisma.ticket.create({
      data: {
        userId: (session.user as any).id,
        eventId: eventId,
        tierId: tierId,
        status: "PAID",
        qrCode: `TICKET-${eventId}-${Math.random().toString(36).substring(7)}`,
      } as any,
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
