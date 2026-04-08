import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create a default organizer
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@eventsphere.com' },
    update: {},
    create: {
      email: 'organizer@eventsphere.com',
      name: 'EventSphere Pro',
      role: 'ORGANISER',
    },
  })

  const events = [
    {
      title: "Neon Nights: Electronic Pulse",
      category: "Music",
      description: "Dive into a night of immersive electronic beats and neon visuals. Featuring top indie artists.",
      date: new Date("2026-05-20"),
      time: "20:00",
      venue: "Cyber Hub, Gurugram",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000",
      organizerId: organizer.id,
      tiers: {
        create: [
          { name: "General", price: 499, capacity: 500 },
          { name: "VIP", price: 1499, capacity: 100 },
        ]
      }
    },
    {
      title: "Laughter Therapy: All-Star Special",
      category: "Standup Comedy",
      description: "Get ready for a night of non-stop laughter with the city's funniest comedians.",
      date: new Date("2026-05-22"),
      time: "19:30",
      venue: "The Comedy Club, Mumbai",
      image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1000",
      organizerId: organizer.id,
      tiers: {
        create: [
          { name: "Front Row", price: 799, capacity: 50 },
          { name: "Standard", price: 399, capacity: 150 },
        ]
      }
    },
    {
      title: "Web3 & AI Summit 2026",
      category: "Tech Meetups",
      description: "Exploring the intersection of decentralized web and artificial intelligence.",
      date: new Date("2026-06-10"),
      time: "10:00",
      venue: "T-Hub, Hyderabad",
      image: "https://images.unsplash.com/photo-1591115765373-520b708e726f?q=80&w=1000",
      organizerId: organizer.id,
      tiers: {
        create: [
          { name: "Early Bird", price: 0, capacity: 200 },
          { name: "Developer Pass", price: 999, capacity: 300 },
        ]
      }
    },
    {
      title: "Creative Pottery Workshop",
      category: "Workshops",
      description: "Learn the ancient art of pottery and take home your own handcrafted masterpiece.",
      date: new Date("2026-05-15"),
      time: "14:00",
      venue: "Art Studio, Bangalore",
      image: "https://images.unsplash.com/photo-1565191999001-551c187427bb?q=80&w=1000",
      organizerId: organizer.id,
      tiers: {
        create: [
          { name: "Full Session", price: 1200, capacity: 20 },
        ]
      }
    },
    {
      title: "Visions: Modern Art Gallery",
      category: "Art & Media",
      description: "A showcase of contemporary digital and physical art from around the globe.",
      date: new Date("2026-06-05"),
      time: "11:00",
      venue: "National Gallery, Delhi",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1000",
      organizerId: organizer.id,
      tiers: {
        create: [
          { name: "Regular Entry", price: 200, capacity: 1000 },
          { name: "Curator's Tour", price: 800, capacity: 50 },
        ]
      }
    }
  ]

  for (const eventData of events) {
    await prisma.event.create({
      data: eventData
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
