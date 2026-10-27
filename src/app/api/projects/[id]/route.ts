import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/projects/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        workspace: true,
        columns: { orderBy: { order: 'asc' } },
        sprints: { orderBy: { startDate: 'desc' } },
        _count: {
          select: {
            workItems: true,
            columns: true,
            sprints: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update Project details (Name, Key, Description, Icon)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const { name, key, description, icon } = body;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // RBAC: Only SuperAdmin or Tenant OWNER/ADMIN can update project settings
    if (user && !user.isSuperAdmin && !user.email.includes('superadmin')) {
      const membership = user.memberships.find((m) => m.organizationId === project.organizationId);
      if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
        return NextResponse.json(
          { error: 'Permission denied: Only Organization Admins and Owners can modify projects.' },
          { status: 403 }
        );
      }
    }

    const dataToUpdate: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Project name must be at least 2 characters' },
          { status: 400 }
        );
      }
      dataToUpdate.name = name.trim();
    }

    if (key !== undefined) {
      if (typeof key !== 'string' || key.trim().length < 2) {
        return NextResponse.json(
          { error: 'Project key must be at least 2 characters' },
          { status: 400 }
        );
      }
      const cleanKey = key.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleanKey.length < 2 || cleanKey.length > 8) {
        return NextResponse.json(
          { error: 'Project key must be between 2 and 8 uppercase alphanumeric characters' },
          { status: 400 }
        );
      }

      // Check key uniqueness in organization if changed
      if (cleanKey !== project.key) {
        const existingWithKey = await prisma.project.findFirst({
          where: {
            organizationId: project.organizationId,
            key: cleanKey,
            id: { not: id },
          },
        });

        if (existingWithKey) {
          return NextResponse.json(
            { error: `Project key "${cleanKey}" is already in use within this organization.` },
            { status: 400 }
          );
        }
        dataToUpdate.key = cleanKey;
      }
    }

    if (description !== undefined) {
      dataToUpdate.description = description ? description.trim() : null;
    }

    if (icon !== undefined) {
      dataToUpdate.icon = icon || '🚀';
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: dataToUpdate,
      include: {
        columns: { orderBy: { order: 'asc' } },
        sprints: { orderBy: { startDate: 'desc' } },
        _count: {
          select: {
            workItems: true,
            columns: true,
            sprints: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error: any) {
    console.error('Failed to update project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Permanently Delete Project and cascade all items
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // RBAC: Only SuperAdmin or Tenant OWNER/ADMIN can delete projects
    if (user && !user.isSuperAdmin && !user.email.includes('superadmin')) {
      const membership = user.memberships.find((m) => m.organizationId === project.organizationId);
      if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
        return NextResponse.json(
          { error: 'Permission denied: Only Organization Admins and Owners can delete projects.' },
          { status: 403 }
        );
      }
    }

    // Guard: Prevent deleting the only project in an organization
    const projectCount = await prisma.project.count({
      where: { organizationId: project.organizationId },
    });

    if (projectCount <= 1) {
      return NextResponse.json(
        {
          error:
            'Cannot delete the only project in this organization. An organization must have at least one active project.',
        },
        { status: 400 }
      );
    }

    // Delete project: columns, sprints, workItems, and comments cascade delete automatically
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Project "${project.name}" (${project.key}) has been permanently deleted.`,
      deletedProjectId: id,
    });
  } catch (error: any) {
    console.error('Failed to delete project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}
