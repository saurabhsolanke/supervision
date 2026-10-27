import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    const workspaces = await prisma.workspace.findMany({
      where: { organizationId: orgId },
      include: {
        projects: {
          include: {
            columns: {
              orderBy: { order: 'asc' },
            },
            sprints: {
              orderBy: { startDate: 'desc' },
            },
            workItems: {
              include: {
                assignee: true,
                reporter: true,
                comments: {
                  include: {
                    author: true,
                  },
                  orderBy: { createdAt: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return NextResponse.json({ workspaces });
  } catch (error: any) {
    console.error('Error fetching tenant workspaces from Supabase:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch workspaces' }, { status: 500 });
  }
}
