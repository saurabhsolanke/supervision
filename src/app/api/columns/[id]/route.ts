import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { wipLimit } = await req.json();

    const updated = await prisma.boardColumn.update({
      where: { id },
      data: {
        wipLimit: wipLimit === null || wipLimit === undefined ? null : Number(wipLimit),
      },
    });

    return NextResponse.json({ column: updated });
  } catch (error: any) {
    console.error('Error updating column in Supabase:', error);
    return NextResponse.json({ error: error.message || 'Failed to update column' }, { status: 500 });
  }
}
