import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.payment.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.repertoire.deleteMany()
  await prisma.event.deleteMany()
  await prisma.member.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()
  await prisma.orchestra.deleteMany()

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@symphonyhub.com',
      name: 'Sarah Johnson',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const memberUser1 = await prisma.user.create({
    data: {
      email: 'violinist@symphonyhub.com',
      name: 'Michael Chen',
      password: hashedPassword,
      role: 'MEMBER',
    },
  })

  const memberUser2 = await prisma.user.create({
    data: {
      email: 'cellist@symphonyhub.com',
      name: 'Emma Williams',
      password: hashedPassword,
      role: 'MEMBER',
    },
  })

  const memberUser3 = await prisma.user.create({
    data: {
      email: 'pianist@symphonyhub.com',
      name: 'James Rodriguez',
      password: hashedPassword,
      role: 'MEMBER',
    },
  })

  const memberUser4 = await prisma.user.create({
    data: {
      email: 'flutist@symphonyhub.com',
      name: 'Sophia Martinez',
      password: hashedPassword,
      role: 'MEMBER',
    },
  })

  const clientUser1 = await prisma.user.create({
    data: {
      email: 'client1@company.com',
      name: 'Robert Thompson',
      password: hashedPassword,
      role: 'CLIENT',
    },
  })

  const clientUser2 = await prisma.user.create({
    data: {
      email: 'client2@enterprise.com',
      name: 'Lisa Anderson',
      password: hashedPassword,
      role: 'CLIENT',
    },
  })

  console.log('Created users')

  // Create orchestra
  const orchestra = await prisma.orchestra.create({
    data: {
      name: 'Metropolitan Symphony Orchestra',
      description: 'A premier symphony orchestra bringing classical music to the community since 1985.',
      contactEmail: 'contact@metrosymphony.com',
      contactPhone: '+1 (555) 123-4567',
      address: '123 Music Avenue, Downtown Arts District',
    },
  })

  console.log('Created orchestra')

  // Create members
  const member1 = await prisma.member.create({
    data: {
      userId: memberUser1.id,
      instrument: 'Violin',
      position: 'First Violinist',
      hourlyRate: 75.00,
      bio: 'Award-winning violinist with 15 years of professional experience.',
      emergencyContact: 'John Chen',
      emergencyPhone: '+1 (555) 234-5678',
    },
  })

  const member2 = await prisma.member.create({
    data: {
      userId: memberUser2.id,
      instrument: 'Cello',
      position: 'Principal Cellist',
      hourlyRate: 80.00,
      bio: 'Conservatory-trained cellist, performed with major orchestras worldwide.',
      emergencyContact: 'David Williams',
      emergencyPhone: '+1 (555) 345-6789',
    },
  })

  const member3 = await prisma.member.create({
    data: {
      userId: memberUser3.id,
      instrument: 'Piano',
      position: 'Pianist',
      hourlyRate: 70.00,
      bio: 'Versatile pianist specializing in classical and contemporary repertoire.',
      emergencyContact: 'Maria Rodriguez',
      emergencyPhone: '+1 (555) 456-7890',
    },
  })

  const member4 = await prisma.member.create({
    data: {
      userId: memberUser4.id,
      instrument: 'Flute',
      position: 'Flutist',
      hourlyRate: 65.00,
      bio: 'Professional flutist with a passion for chamber music.',
      emergencyContact: 'Anna Martinez',
      emergencyPhone: '+1 (555) 567-8901',
    },
  })

  console.log('Created members')

  // Create events
  const event1 = await prisma.event.create({
    data: {
      orchestraId: orchestra.id,
      title: 'Spring Symphony Gala',
      description: 'Annual spring concert featuring works by Mozart and Beethoven.',
      eventType: 'CONCERT',
      location: 'Grand Concert Hall',
      startTime: new Date('2026-05-15T19:00:00'),
      endTime: new Date('2026-05-15T22:00:00'),
      status: 'CONFIRMED',
      notes: 'Black tie event. Reception to follow.',
    },
  })

  const event2 = await prisma.event.create({
    data: {
      orchestraId: orchestra.id,
      title: 'Beethoven\'s Fifth Symphony',
      description: 'Performance of Beethoven\'s iconic symphony.',
      eventType: 'PERFORMANCE',
      location: 'Metropolitan Theater',
      startTime: new Date('2026-05-20T20:00:00'),
      endTime: new Date('2026-05-20T23:00:00'),
      status: 'SCHEDULED',
    },
  })

  const event3 = await prisma.event.create({
    data: {
      orchestraId: orchestra.id,
      title: 'Weekly Rehearsal',
      description: 'Regular rehearsal for upcoming concerts.',
      eventType: 'REHEARSAL',
      location: 'Practice Hall A',
      startTime: new Date('2026-05-05T18:00:00'),
      endTime: new Date('2026-05-05T21:00:00'),
      status: 'SCHEDULED',
    },
  })

  const event4 = await prisma.event.create({
    data: {
      orchestraId: orchestra.id,
      title: 'Chamber Music Afternoon',
      description: 'Intimate chamber music performance in the garden.',
      eventType: 'CONCERT',
      location: 'Orchestra Garden',
      startTime: new Date('2026-05-25T15:00:00'),
      endTime: new Date('2026-05-25T18:00:00'),
      status: 'SCHEDULED',
    },
  })

  const event5 = await prisma.event.create({
    data: {
      orchestraId: orchestra.id,
      title: 'Wedding Ceremony Performance',
      description: 'Live music for wedding ceremony.',
      eventType: 'OTHER',
      location: 'Rosewood Estate',
      startTime: new Date('2026-06-10T14:00:00'),
      endTime: new Date('2026-06-10T16:00:00'),
      status: 'CONFIRMED',
      notes: 'Ceremony only. Client: Thompson Family.',
    },
  })

  console.log('Created events')

  // Create repertoire for events
  await prisma.repertoire.createMany({
    data: [
      { eventId: event1.id, title: 'Symphony No. 40 in G minor', composer: 'Wolfgang Amadeus Mozart', duration: 30, arrangement: 'Full Orchestra' },
      { eventId: event1.id, title: 'Symphony No. 5 in C minor', composer: 'Ludwig van Beethoven', duration: 35, arrangement: 'Full Orchestra' },
      { eventId: event1.id, title: 'Overture to William Tell', composer: 'Gioachino Rossini', duration: 12, arrangement: 'Full Orchestra' },
      { eventId: event2.id, title: 'Symphony No. 5 in C minor', composer: 'Ludwig van Beethoven', duration: 35, arrangement: 'Full Orchestra' },
      { eventId: event2.id, title: 'Piano Concerto No. 21', composer: 'Wolfgang Amadeus Mozart', duration: 28, arrangement: 'Piano and Orchestra' },
      { eventId: event3.id, title: 'Symphony No. 40 - Movement 1', composer: 'Wolfgang Amadeus Mozart', duration: 8, notes: 'Focus on exposition' },
      { eventId: event4.id, title: 'String Quartet Op. 76 No. 2', composer: 'Franz Joseph Haydn', duration: 20, arrangement: 'String Quartet' },
    ],
  })

  console.log('Created repertoire')

  // Create bookings
  const booking1 = await prisma.booking.create({
    data: {
      eventId: event1.id,
      memberId: member1.id,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentAmount: 225.00,
      notes: 'Confirmed via email',
    },
  })

  const booking2 = await prisma.booking.create({
    data: {
      eventId: event1.id,
      memberId: member2.id,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentAmount: 240.00,
    },
  })

  const booking3 = await prisma.booking.create({
    data: {
      eventId: event1.id,
      memberId: member3.id,
      status: 'CONFIRMED',
      paymentStatus: 'PARTIAL',
      paymentAmount: 140.00,
    },
  })

  const booking4 = await prisma.booking.create({
    data: {
      eventId: event2.id,
      memberId: member1.id,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentAmount: 225.00,
    },
  })

  const booking5 = await prisma.booking.create({
    data: {
      eventId: event2.id,
      memberId: member2.id,
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      paymentAmount: 240.00,
    },
  })

  const booking6 = await prisma.booking.create({
    data: {
      eventId: event3.id,
      memberId: member4.id,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentAmount: 195.00,
    },
  })

  const booking7 = await prisma.booking.create({
    data: {
      eventId: event5.id,
      memberId: member1.id,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentAmount: 225.00,
    },
  })

  const booking8 = await prisma.booking.create({
    data: {
      eventId: event5.id,
      memberId: member3.id,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentAmount: 140.00,
    },
  })

  console.log('Created bookings')

  // Create payments
  await prisma.payment.createMany({
    data: [
      { bookingId: booking1.id, amount: 225.00, paymentDate: new Date('2026-05-10'), paymentMethod: 'BANK_TRANSFER', reference: 'TRF-2026-001' },
      { bookingId: booking2.id, amount: 240.00, paymentDate: new Date('2026-05-10'), paymentMethod: 'BANK_TRANSFER', reference: 'TRF-2026-002' },
      { bookingId: booking3.id, amount: 70.00, paymentDate: new Date('2026-05-12'), paymentMethod: 'CARD', reference: 'CARD-2026-001' },
      { bookingId: booking6.id, amount: 195.00, paymentDate: new Date('2026-05-01'), paymentMethod: 'CASH', reference: 'CASH-2026-001' },
      { bookingId: booking7.id, amount: 225.00, paymentDate: new Date('2026-06-01'), paymentMethod: 'BANK_TRANSFER', reference: 'TRF-2026-010' },
      { bookingId: booking8.id, amount: 140.00, paymentDate: new Date('2026-06-01'), paymentMethod: 'BANK_TRANSFER', reference: 'TRF-2026-011' },
    ],
  })

  console.log('Created payments')

  // Create clients
  await prisma.client.create({
    data: {
      userId: clientUser1.id,
      company: 'Thompson Enterprises',
      contactPerson: 'Robert Thompson',
      phone: '+1 (555) 987-6543',
      address: '456 Corporate Blvd, Business District',
      notes: 'Annual corporate events client. Prefer afternoon performances.',
    },
  })

  await prisma.client.create({
    data: {
      userId: clientUser2.id,
      company: 'Anderson & Partners',
      contactPerson: 'Lisa Anderson',
      phone: '+1 (555) 876-5432',
      address: '789 Legal Center, Suite 1200',
      notes: 'Legal firm seeking music for corporate gatherings.',
    },
  })

  console.log('Created clients')

  // Create notifications
  await prisma.notification.createMany({
    data: [
      { userId: adminUser.id, type: 'BOOKING', title: 'New Booking Request', message: 'Michael Chen has a pending booking for Spring Symphony Gala.', read: false, relatedId: booking4.id },
      { userId: memberUser1.id, type: 'EVENT', title: 'Event Reminder', message: 'Spring Symphony Gala is in 11 days. Please confirm your availability.', read: false, relatedId: event1.id },
      { userId: memberUser2.id, type: 'PAYMENT', title: 'Payment Received', message: 'Your payment of $240.00 has been processed.', read: true, relatedId: booking2.id },
      { userId: memberUser3.id, type: 'BOOKING', title: 'Booking Confirmed', message: 'Your booking for Spring Symphony Gala has been confirmed.', read: false, relatedId: booking3.id },
      { userId: adminUser.id, type: 'SYSTEM', title: 'System Update', message: 'Orchestra profile has been updated successfully.', read: true },
    ],
  })

  console.log('Created notifications')

  // Create availability
  await prisma.availability.createMany({
    data: [
      // Member 1 availability
      { memberId: member1.id, date: new Date('2026-05-05'), status: 'AVAILABLE' },
      { memberId: member1.id, date: new Date('2026-05-06'), status: 'AVAILABLE' },
      { memberId: member1.id, date: new Date('2026-05-15'), status: 'AVAILABLE' },
      { memberId: member1.id, date: new Date('2026-05-16'), status: 'UNAVAILABLE', reason: 'Personal commitment' },
      { memberId: member1.id, date: new Date('2026-05-20'), status: 'AVAILABLE' },
      { memberId: member1.id, date: new Date('2026-05-21'), status: 'TENTATIVE', reason: 'May have other gig' },
      
      // Member 2 availability
      { memberId: member2.id, date: new Date('2026-05-05'), status: 'AVAILABLE' },
      { memberId: member2.id, date: new Date('2026-05-15'), status: 'AVAILABLE' },
      { memberId: member2.id, date: new Date('2026-05-20'), status: 'AVAILABLE' },
      { memberId: member2.id, date: new Date('2026-05-25'), status: 'UNAVAILABLE', reason: 'Vacation' },
      
      // Member 3 availability
      { memberId: member3.id, date: new Date('2026-05-05'), status: 'AVAILABLE' },
      { memberId: member3.id, date: new Date('2026-05-15'), status: 'AVAILABLE' },
      { memberId: member3.id, date: new Date('2026-05-20'), status: 'TENTATIVE' },
      { memberId: member3.id, date: new Date('2026-06-10'), status: 'AVAILABLE' },
      
      // Member 4 availability
      { memberId: member4.id, date: new Date('2026-05-05'), status: 'AVAILABLE' },
      { memberId: member4.id, date: new Date('2026-05-06'), status: 'AVAILABLE' },
      { memberId: member4.id, date: new Date('2026-05-15'), status: 'TENTATIVE' },
      { memberId: member4.id, date: new Date('2026-05-25'), status: 'AVAILABLE' },
    ],
  })

  console.log('Created availability')

  console.log('Database seeding completed!')
  console.log('\n--- Login Credentials ---')
  console.log('Admin: admin@symphonyhub.com / password123')
  console.log('Member 1: violinist@symphonyhub.com / password123')
  console.log('Member 2: cellist@symphonyhub.com / password123')
  console.log('Member 3: pianist@symphonyhub.com / password123')
  console.log('Member 4: flutist@symphonyhub.com / password123')
  console.log('Client 1: client1@company.com / password123')
  console.log('Client 2: client2@enterprise.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })