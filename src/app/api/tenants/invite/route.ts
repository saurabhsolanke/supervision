import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { organizationId, email, role = 'MEMBER' } = await req.json();

    if (!organizationId || !email) {
      return NextResponse.json({ error: 'organizationId and email are required' }, { status: 400 });
    }

    // 1. Check organization & subscription limits
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscription: true,
        memberships: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const currentSeats = org.memberships.length;
    const maxSeats = org.subscription?.maxSeats || 3;

    if (currentSeats >= maxSeats) {
      return NextResponse.json(
        {
          error: `Seat limit reached! Your ${org.subscription?.planTier} plan allows up to ${maxSeats} seats (${currentSeats}/${maxSeats} used). Please upgrade to add more members.`,
        },
        { status: 403 }
      );
    }

    // 2. Find or create user
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      const namePart = email.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: formattedName,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
          jobTitle: 'Software Engineer',
        },
      });
    }

    // 3. Check if already member
    const existingMembership = await prisma.organizationMembership.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'This user is already a member of this organization' },
        { status: 400 }
      );
    }

    // 4. Create membership & update subscription seatCount
    const membership = await prisma.organizationMembership.create({
      data: {
        organizationId,
        userId: user.id,
        role: role as Role,
      },
      include: {
        user: true,
      },
    });

    if (org.subscription) {
      await prisma.subscription.update({
        where: { id: org.subscription.id },
        data: {
          seatCount: currentSeats + 1,
        },
      });
    }

    return NextResponse.json({ membership }, { status: 201 });
  } catch (error: any) {
    console.error('Error inviting member in Supabase:', error);
    return NextResponse.json({ error: error.message || 'Failed to invite member' }, { status: 500 });
  }
}
