import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      },
      orderBy: { createdAt: 'asc' },
    });

    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ organizations, users });
  } catch (error: any) {
    console.error('Error fetching organizations from Supabase:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch organizations' }, { status: 500 });
  }
}
