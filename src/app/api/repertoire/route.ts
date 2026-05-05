import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')

    const where: Record<string, unknown> = {}
    if (eventId) where.eventId = eventId

    const repertoires = await prisma.repertoire.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        event: true,
      },
    })

    return NextResponse.json(repertoires)
  } catch (error) {
    console.error('Error fetching repertoire:', error)
    return NextResponse.json({ error: 'Failed to fetch repertoire' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, title, composer, duration, arrangement, notes } = body

    const repertoire = await prisma.repertoire.create({
      data: {
        eventId,
        title,
        composer,
        duration,
        arrangement,
        notes,
      },
    })

    return NextResponse.json(repertoire, { status: 201 })
  } catch (error) {
    console.error('Error creating repertoire:', error)
    return NextResponse.json({ error: 'Failed to create repertoire' }, { status: 500 })
  }
}