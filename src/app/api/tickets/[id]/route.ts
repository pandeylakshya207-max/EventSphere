import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        event: true,
        user: true,
        // @ts-ignore
        tier: true,
      },
    } as any);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Security: Only the owner or the organizer can view the ticket details
    // For Demo: Allow owner
    if (ticket.userId !== (session.user as any).id) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}
