import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { error: 'Current password is required.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Check current password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'No existing password configured for this user. Please contact SuperAdmin.' },
        { status: 400 }
      );
    }

    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Current password does not match. Please verify and try again.' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password.' },
        { status: 400 }
      );
    }

    // Hash and update
    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully! You can now use your new password.',
    });
  } catch (error: any) {
    console.error('Failed to change password:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while changing password.' },
      { status: 500 }
    );
  }
}
