import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, date, time, venue, category, tiers, performer, image } = body;

    // Create event and update user role in a transaction
    const event = await prisma.$transaction(async (tx) => {
      // Create the event
      const newEvent = await tx.event.create({
        data: {
          title,
          performer,
          description,
          date: new Date(date),
          // @ts-ignore
          time,
          venue,
          category,
          image: image || "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1000&auto=format&fit=crop",
          organizer: {
            connect: { id: (session.user as any).id }
          },
          tiers: {
            create: tiers.map((t: any) => ({
              name: t.name,
              price: parseFloat(t.price),
              capacity: parseInt(t.capacity),
            }))
          }
        } as any,
        include: {
          // @ts-ignore
          tiers: true
        }
      });

      // Update user role to ORGANISER if they are currently an ATTENDEE
      await tx.user.update({
        where: { id: (session.user as any).id },
        data: { role: "ORGANISER" }
      });

      return newEvent;
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine");
    const session = await auth();

    const where: any = {};
    if (mine === "true" && session?.user) {
      where.organizerId = (session.user as any).id;
    }

    console.log("Fetching events with where:", JSON.stringify(where));
    const events = await prisma.event.findMany({
      where,
      include: {
        // @ts-ignore
        tiers: true,
        // @ts-ignore
        tickets: {
          include: {
            // @ts-ignore
            tier: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    console.log("Found events count:", events.length);
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
