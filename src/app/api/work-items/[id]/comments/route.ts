import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { authorId, content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content cannot be empty' }, { status: 400 });
    }

    const comment = await prisma.workItemComment.create({
      data: {
        workItemId: id,
        authorId: authorId || 'u-sarah-connor',
        content: content.trim(),
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding comment in Supabase:', error);
    return NextResponse.json({ error: error.message || 'Failed to add comment' }, { status: 500 });
  }
}
