import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { hashPassword } from '@/lib/auth';

// POST /api/admin/tenants/[orgId]/users - Adds user to organization with specified role
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await context.params;
    const { email, name, jobTitle = 'Software Engineer', role = 'MEMBER' } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { subscription: true, memberships: true },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // 2. Find or create user
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      const displayName =
        name?.trim() ||
        cleanEmail
          .split('@')[0]
          .split('.')
          .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ');

      const initialPasswordHash = await hashPassword('Supervision2026!');

      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: displayName,
          passwordHash: initialPasswordHash,
          jobTitle,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
          isSuperAdmin: false,
        },
      });
    }

    // 3. Check if user is already a member
    const existingMembership = await prisma.organizationMembership.findFirst({
      where: { organizationId: orgId, userId: user.id },
    });

    if (existingMembership) {
      // Update role if already member
      const updated = await prisma.organizationMembership.update({
        where: { id: existingMembership.id },
        data: { role: (role as Role) || Role.MEMBER },
        include: { user: true },
      });
      return NextResponse.json({ success: true, membership: updated, updated: true });
    }

    // 4. Create membership
    const membership = await prisma.organizationMembership.create({
      data: {
        organizationId: orgId,
        userId: user.id,
        role: (role as Role) || Role.MEMBER,
      },
      include: { user: true },
    });

    // 5. Update subscription seat count
    if (organization.subscription) {
      await prisma.subscription.update({
        where: { id: organization.subscription.id },
        data: { seatCount: organization.memberships.length + 1 },
      });
    }

    return NextResponse.json({ success: true, membership });
  } catch (error: any) {
    console.error('Error adding user to tenant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add user to tenant' },
      { status: 500 }
    );
  }
}
