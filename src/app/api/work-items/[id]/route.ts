import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WorkItemType, Priority, WorkItemState } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const dataToUpdate: any = {};

    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.acceptanceCriteria !== undefined) dataToUpdate.acceptanceCriteria = body.acceptanceCriteria;
    if (body.effort !== undefined) dataToUpdate.effort = Number(body.effort);
    if (body.order !== undefined) dataToUpdate.order = Number(body.order);
    if (body.tags !== undefined) dataToUpdate.tags = body.tags;
    if (body.type !== undefined) dataToUpdate.type = body.type as WorkItemType;
    if (body.priority !== undefined) dataToUpdate.priority = body.priority as Priority;
    if (body.state !== undefined) dataToUpdate.state = body.state as WorkItemState;
    if (body.columnId !== undefined) {
      dataToUpdate.columnId = body.columnId;
      // Also sync state with the column
      const targetColumn = await prisma.boardColumn.findUnique({
        where: { id: body.columnId },
      });
      if (targetColumn) {
        dataToUpdate.state = targetColumn.state;
      }
    }
    if (body.sprintId !== undefined) dataToUpdate.sprintId = body.sprintId || null;
    if (body.assigneeId !== undefined) dataToUpdate.assigneeId = body.assigneeId || null;

    const updated = await prisma.workItem.update({
      where: { id },
      data: dataToUpdate,
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({ workItem: updated });
  } catch (error: any) {
    console.error('Error updating work item in Supabase:', error);
    return NextResponse.json({ error: error.message || 'Failed to update work item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.workItemComment.deleteMany({ where: { workItemId: id } });
    await prisma.workItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting work item in Supabase:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete work item' }, { status: 500 });
  }
}
