import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Assuming role "ORGANISER" or similar. For now, just ensure logged in.
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { qrCode } = await req.json();

    if (!qrCode) {
      return NextResponse.json({ success: false, message: "QR Code is required" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { qrCode: qrCode.trim() },
      include: {
        event: true,
        tier: true,
        user: true,
      }
    });

    if (!ticket) {
      return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
    }

    // Optional: Check if the current user is the organizer of the event
    // if ((session.user as any).id !== ticket.event.organizerId && (session.user as any).role !== "ADMIN") {
    //   return NextResponse.json({ success: false, message: "Not authorized to scan for this event" }, { status: 403 });
    // }

    if (ticket.status !== "PAID") {
      return NextResponse.json({ success: false, message: `Ticket status is ${ticket.status}` }, { status: 400 });
    }

    if (ticket.checkedIn) {
      return NextResponse.json({ 
        success: false, 
        message: "Ticket already used", 
        ticket: {
          guestName: ticket.user.name,
          tierName: ticket.tier.name,
          eventName: ticket.event.title
        }
      }, { status: 400 });
    }

    // Mark as checked in
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { checkedIn: true }
    });

    return NextResponse.json({
      success: true,
      message: "Ticket validated successfully",
      ticket: {
        guestName: ticket.user.name,
        tierName: ticket.tier.name,
        eventName: ticket.event.title,
        status: "VALID"
      }
    });
  } catch (error: any) {
    console.error("Ticket validation error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
