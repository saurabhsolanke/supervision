import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PlanTier, Role, WorkItemState } from '@prisma/client';
import { hashPassword } from '@/lib/auth';

// GET /api/admin/tenants - Returns all tenants with operational telemetry
export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        subscription: true,
        memberships: {
          include: {
            user: true,
          },
        },
        workspaces: {
          include: {
            projects: {
              include: {
                _count: {
                  select: { workItems: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            workItems: true,
            projects: true,
            workspaces: true,
            memberships: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUsers = await prisma.user.count();
    const totalWorkItems = await prisma.workItem.count();

    return NextResponse.json({
      organizations,
      metrics: {
        totalTenants: organizations.length,
        totalUsers,
        totalWorkItems,
        enterpriseTenants: organizations.filter((o) => o.subscription?.planTier === 'ENTERPRISE').length,
        proTenants: organizations.filter((o) => o.subscription?.planTier === 'PRO').length,
        starterTenants: organizations.filter((o) => o.subscription?.planTier === 'STARTER').length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin tenants:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch tenants' }, { status: 500 });
  }
}

// POST /api/admin/tenants - Creates a new Organization, Admin User, and initial Board setup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      logoUrl = '🏢',
      planTier = 'PRO',
      maxSeats,
      adminName,
      adminEmail,
      adminJobTitle = 'Tenant Administrator',
    } = body;

    if (!name || !slug || !adminEmail) {
      return NextResponse.json(
        { error: 'Organization name, slug, and Admin email are required' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const cleanEmail = adminEmail.trim().toLowerCase();

    // Check slug uniqueness
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: cleanSlug },
    });
    if (existingOrg) {
      return NextResponse.json(
        { error: `Organization slug "${cleanSlug}" is already taken.` },
        { status: 400 }
      );
    }

    // Determine default seats by tier
    const seatLimit =
      maxSeats && maxSeats > 0
        ? Number(maxSeats)
        : planTier === 'ENTERPRISE'
        ? 50
        : planTier === 'PRO'
        ? 10
        : 3;

    // 1. Create or retrieve Admin User
    let adminUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!adminUser) {
      const displayName =
        adminName?.trim() ||
        cleanEmail
          .split('@')[0]
          .split('.')
          .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ');

      const initialPasswordHash = await hashPassword(body.adminPassword || 'Supervision2026!');

      adminUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: displayName,
          passwordHash: initialPasswordHash,
          jobTitle: adminJobTitle,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
          isSuperAdmin: false,
        },
      });
    }

    // 2. Create Organization with Subscription and Admin Membership
    const periodEnd = new Date();
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    const organization = await prisma.organization.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        logoUrl: logoUrl.trim() || '🏢',
        subscription: {
          create: {
            planTier: (planTier as PlanTier) || PlanTier.PRO,
            status: 'ACTIVE',
            seatCount: 1,
            maxSeats: seatLimit,
            currentPeriodEnd: periodEnd,
            billingCycle: 'monthly',
          },
        },
        memberships: {
          create: {
            userId: adminUser.id,
            role: Role.OWNER,
          },
        },
      },
    });

    // 3. Create Default Workspace
    const workspace = await prisma.workspace.create({
      data: {
        organizationId: organization.id,
        name: `${organization.name} Engineering`,
        description: `Primary workspace for ${organization.name} team`,
      },
    });

    // 4. Create Default Project
    const project = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        organizationId: organization.id,
        name: 'Core Platform & Boards',
        description: 'Main project backlog and Kanban workflow',
        key: cleanSlug.slice(0, 4).toUpperCase(),
      },
    });

    // 5. Create Standard Azure DevOps Kanban Board Columns
    await prisma.boardColumn.createMany({
      data: [
        {
          projectId: project.id,
          organizationId: organization.id,
          name: 'New',
          order: 0,
          state: WorkItemState.NEW,
          wipLimit: null,
        },
        {
          projectId: project.id,
          organizationId: organization.id,
          name: 'Active',
          order: 1,
          state: WorkItemState.ACTIVE,
          wipLimit: 5,
        },
        {
          projectId: project.id,
          organizationId: organization.id,
          name: 'Resolved',
          order: 2,
          state: WorkItemState.RESOLVED,
          wipLimit: null,
        },
        {
          projectId: project.id,
          organizationId: organization.id,
          name: 'Closed',
          order: 3,
          state: WorkItemState.CLOSED,
          wipLimit: null,
        },
      ],
    });

    // 6. Return the newly created tenant details
    const fullOrg = await prisma.organization.findUnique({
      where: { id: organization.id },
      include: {
        subscription: true,
        memberships: {
          include: { user: true },
        },
        workspaces: {
          include: { projects: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      organization: fullOrg,
      adminUser,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/tenants:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create organization' },
      { status: 500 }
    );
  }
}
