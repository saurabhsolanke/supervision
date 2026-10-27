import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Mandatory Input Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid enterprise email address is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required to authenticate.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Strict Database Verification: User must exist in Supabase PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberships: {
          include: {
            organization: {
              include: { subscription: true },
            },
          },
        },
      },
    });

    if (!user) {
      // Secure uniform error preventing user/email enumeration
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 3. Cryptographic Password Verification
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Account has no password configured. Please contact SuperAdmin.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 4. Issue Cryptographically Signed JWT Session Token
    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    });

    const primaryOrgId = user.memberships[0]?.organizationId || null;

    // Safe user object excluding sensitive passwordHash
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      initials: user.name.slice(0, 2).toUpperCase(),
      jobTitle: user.jobTitle,
      isSuperAdmin: user.isSuperAdmin,
      memberships: user.memberships,
    };

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      token,
      primaryOrgId,
    });

    // 5. Set Secure HTTP-Only Cookie
    response.cookies.set('supervision_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Authentication error in /api/auth/login:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
