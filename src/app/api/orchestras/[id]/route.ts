import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orchestra = await prisma.orchestra.findUnique({
      where: { id: params.id },
      include: {
        events: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        _count: {
          select: { events: true },
        },
      },
    })

    if (!orchestra) {
      return NextResponse.json({ error: 'Orchestra not found' }, { status: 404 })
    }

    return NextResponse.json(orchestra)
  } catch (error) {
    console.error('Error fetching orchestra:', error)
    return NextResponse.json({ error: 'Failed to fetch orchestra' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, logo, contactEmail, contactPhone, address } = body

    const orchestra = await prisma.orchestra.update({
      where: { id: params.id },
      data: {
        name,
        description,
        logo,
        contactEmail,
        contactPhone,
        address,
      },
    })

    return NextResponse.json(orchestra)
  } catch (error) {
    console.error('Error updating orchestra:', error)
    return NextResponse.json({ error: 'Failed to update orchestra' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.orchestra.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Orchestra deleted successfully' })
  } catch (error) {
    console.error('Error deleting orchestra:', error)
    return NextResponse.json({ error: 'Failed to delete orchestra' }, { status: 500 })
  }
}