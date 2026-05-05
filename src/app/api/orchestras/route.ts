import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orchestras = await prisma.orchestra.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { events: true },
        },
      },
    })
    return NextResponse.json(orchestras)
  } catch (error) {
    console.error('Error fetching orchestras:', error)
    return NextResponse.json({ error: 'Failed to fetch orchestras' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, logo, contactEmail, contactPhone, address } = body

    const orchestra = await prisma.orchestra.create({
      data: {
        name,
        description,
        logo,
        contactEmail,
        contactPhone,
        address,
      },
    })

    return NextResponse.json(orchestra, { status: 201 })
  } catch (error) {
    console.error('Error creating orchestra:', error)
    return NextResponse.json({ error: 'Failed to create orchestra' }, { status: 500 })
  }
}