import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PlanTier } from '@prisma/client';

// DELETE /api/admin/tenants/[orgId] - Removes tenant with cascade clean
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await context.params;

    // Check organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Cascade delete organization (foreign keys cascade)
    await prisma.organization.delete({
      where: { id: orgId },
    });

    return NextResponse.json({ success: true, message: `Organization ${organization.name} deleted successfully` });
  } catch (error: any) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete tenant' }, { status: 500 });
  }
}

// PATCH /api/admin/tenants/[orgId] - Updates tenant metadata and subscription
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await context.params;
    const { name, logoUrl, planTier, maxSeats } = await req.json();

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(logoUrl ? { logoUrl: logoUrl.trim() } : {}),
        ...(planTier || maxSeats
          ? {
              subscription: {
                update: {
                  ...(planTier ? { planTier: planTier as PlanTier } : {}),
                  ...(maxSeats ? { maxSeats: Number(maxSeats) } : {}),
                },
              },
            }
          : {}),
      },
      include: {
        subscription: true,
        memberships: { include: { user: true } },
      },
    });

    return NextResponse.json({ success: true, organization: updatedOrg });
  } catch (error: any) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: error.message || 'Failed to update tenant' }, { status: 500 });
  }
}
