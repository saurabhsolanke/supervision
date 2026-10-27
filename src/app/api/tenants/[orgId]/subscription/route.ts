import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PlanTier } from '@prisma/client';
import { PLAN_CONFIGS } from '@/lib/constants';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { planTier, billingCycle = 'monthly' } = await req.json();

    const planConfig = PLAN_CONFIGS[planTier as keyof typeof PLAN_CONFIGS];
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan tier' }, { status: 400 });
    }

    const updated = await prisma.subscription.update({
      where: { organizationId: orgId },
      data: {
        planTier: planTier as PlanTier,
        maxSeats: planConfig.maxSeats,
        billingCycle,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ subscription: updated });
  } catch (error: any) {
    console.error('Error updating subscription in Supabase:', error);
    return NextResponse.json({ error: error.message || 'Failed to update subscription' }, { status: 500 });
  }
}
