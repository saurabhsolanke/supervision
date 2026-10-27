import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WorkItemType, Priority, WorkItemState } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationId,
      projectId,
      columnId,
      sprintId,
      type = 'USER_STORY',
      state = 'NEW',
      priority = 'P3_MEDIUM',
      title,
      description = '',
      acceptanceCriteria = '',
      effort = 3,
      tags = [],
      assigneeId,
      reporterId,
    } = body;

    if (!organizationId || !projectId || !columnId || !title) {
      return NextResponse.json(
        { error: 'organizationId, projectId, columnId, and title are required' },
        { status: 400 }
      );
    }

    // Determine sequential itemNumber for tenant
    const highestItem = await prisma.workItem.findFirst({
      where: { organizationId },
      orderBy: { itemNumber: 'desc' },
      select: { itemNumber: true },
    });
    const nextItemNumber = (highestItem?.itemNumber || 1000) + 1;

    // Get count in destination column for ordering
    const columnCount = await prisma.workItem.count({
      where: { columnId },
    });

    const newWorkItem = await prisma.workItem.create({
      data: {
        organizationId,
        projectId,
        columnId,
        sprintId: sprintId || null,
        itemNumber: nextItemNumber,
        type: type as WorkItemType,
        state: state as WorkItemState,
        priority: priority as Priority,
        title,
        description,
        acceptanceCriteria,
        effort: Number(effort) || 0,
        order: columnCount,
        tags,
        assigneeId: assigneeId || null,
        reporterId: reporterId || assigneeId || 'u-sarah-connor',
      },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: { author: true },
        },
      },
    });

    return NextResponse.json({ workItem: newWorkItem }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating work item in Supabase:', error);
    return NextResponse.json({ error: error.message || 'Failed to create work item' }, { status: 500 });
  }
}
