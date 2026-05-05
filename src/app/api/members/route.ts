import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const instrument = searchParams.get('instrument')

    const where: Record<string, unknown> = {}
    if (instrument) where.instrument = instrument

    const members = await prisma.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        _count: {
          select: { bookings: true },
        },
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, instrument, position, hourlyRate, bio, emergencyContact, emergencyPhone } = body

    const member = await prisma.member.create({
      data: {
        userId,
        instrument,
        position,
        hourlyRate: hourlyRate || 0,
        bio,
        emergencyContact,
        emergencyPhone,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}