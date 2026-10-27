import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSessionToken } from '@/lib/auth';

// POST /api/auth/session - Issues session token for persona selection
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    });

    const response = NextResponse.json({ success: true, token, user });

    response.cookies.set('supervision_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
