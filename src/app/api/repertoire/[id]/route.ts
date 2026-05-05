import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repertoire = await prisma.repertoire.findUnique({
      where: { id: params.id },
      include: {
        event: true,
      },
    })

    if (!repertoire) {
      return NextResponse.json({ error: 'Repertoire not found' }, { status: 404 })
    }

    return NextResponse.json(repertoire)
  } catch (error) {
    console.error('Error fetching repertoire:', error)
    return NextResponse.json({ error: 'Failed to fetch repertoire' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, composer, duration, arrangement, notes, eventId } = body

    const repertoire = await prisma.repertoire.update({
      where: { id: params.id },
      data: {
        title,
        composer,
        duration,
        arrangement,
        notes,
        eventId,
      },
    })

    return NextResponse.json(repertoire)
  } catch (error) {
    console.error('Error updating repertoire:', error)
    return NextResponse.json({ error: 'Failed to update repertoire' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.repertoire.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Repertoire deleted successfully' })
  } catch (error) {
    console.error('Error deleting repertoire:', error)
    return NextResponse.json({ error: 'Failed to delete repertoire' }, { status: 500 })
  }
}