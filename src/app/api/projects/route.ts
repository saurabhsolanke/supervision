import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { PLAN_CONFIGS } from '@/lib/constants';
import { PlanTier } from '@/types';

// GET /api/projects - Returns projects for an organization
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('organizationId');

    if (!orgId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const projects = await prisma.project.findMany({
      where: { organizationId: orgId },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Creates a new Project / App for an organization
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const { organizationId, name, key, description, icon = '🚀' } = body;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Project name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    if (!key || typeof key !== 'string' || key.trim().length < 2) {
      return NextResponse.json(
        { error: 'Project key is required (e.g. AZP, CORE, WEB)' },
        { status: 400 }
      );
    }

    const cleanKey = key.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanKey.length < 2 || cleanKey.length > 8) {
      return NextResponse.json(
        { error: 'Project key must be 2 to 8 uppercase alphanumeric characters' },
        { status: 400 }
      );
    }

    // 1. Authorize: User must be SuperAdmin or have OWNER/ADMIN role in this organization
    if (user && !user.isSuperAdmin && !user.email.includes('superadmin')) {
      const membership = user.memberships.find((m) => m.organizationId === organizationId);
      if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
        return NextResponse.json(
          { error: 'Permission denied: Only Organization Admins and Owners can create new Projects.' },
          { status: 403 }
        );
      }
    }

    // 2. Fetch Organization and check Subscription Plan Limits
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscription: true,
        workspaces: true,
        projects: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const planTier: PlanTier = organization.subscription?.planTier || 'STARTER';
    const planConfig = PLAN_CONFIGS[planTier];

    if (planConfig.maxProjects !== 'Unlimited') {
      const currentProjectsCount = organization.projects.length;
      if (currentProjectsCount >= planConfig.maxProjects) {
        return NextResponse.json(
          {
            error: `Project limit reached! Your ${planConfig.name} plan allows up to ${planConfig.maxProjects} projects (${currentProjectsCount}/${planConfig.maxProjects} used). Please upgrade your subscription to add unlimited projects.`,
          },
          { status: 403 }
        );
      }
    }

    // 3. Check Key Uniqueness within Organization
    const existingProject = await prisma.project.findFirst({
      where: {
        organizationId,
        key: cleanKey,
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: `A project with key "${cleanKey}" already exists in this organization. Please pick another key.` },
        { status: 400 }
      );
    }

    // 4. Ensure Workspace exists
    let workspace = organization.workspaces[0];
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          organizationId,
          name: `${organization.name} Workspace`,
          description: `Primary workspace for ${organization.name}`,
        },
      });
    }

    // 5. Create Project with standard Kanban columns and initial sprint
    const now = new Date();
    const sprintEnd = new Date();
    sprintEnd.setDate(sprintEnd.getDate() + 14);

    const project = await prisma.project.create({
      data: {
        organizationId,
        workspaceId: workspace.id,
        name: name.trim(),
        key: cleanKey,
        description: description?.trim() || null,
        icon,
        columns: {
          create: [
            { organizationId, name: 'New', state: 'NEW', order: 0 },
            { organizationId, name: 'Active', state: 'ACTIVE', order: 1, wipLimit: 5 },
            { organizationId, name: 'Resolved', state: 'RESOLVED', order: 2 },
            { organizationId, name: 'Closed', state: 'CLOSED', order: 3 },
          ],
        },
        sprints: {
          create: [
            {
              name: 'Sprint 1',
              startDate: now,
              endDate: sprintEnd,
              isCurrent: true,
            },
          ],
        },
      },
      include: {
        columns: { orderBy: { order: 'asc' } },
        sprints: { orderBy: { startDate: 'desc' } },
        workItems: true,
      },
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}
