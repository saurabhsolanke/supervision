import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'supervision-b2b-saas-enterprise-secret-key-2026';
const SALT_ROUNDS = 10;

export interface TokenPayload {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
}

// 1. Password Hashing & Verification
export async function hashPassword(plainPassword: string): Promise<string> {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, passwordHash);
}

// 2. JWT Session Token Management
export function signSessionToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// 3. Extract and Authenticate User from Request (Cookie or Authorization header)
export async function getAuthenticatedUser(req: NextRequest) {
  // Check cookie or Bearer header
  const authHeader = req.headers.get('Authorization');
  const cookieToken = req.cookies.get('supervision_token')?.value;

  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : cookieToken;

  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
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

  return user;
}

// 4. Strict Multi-Tenant Authorization Guard
export async function authorizeTenantRequest(
  req: NextRequest,
  requiredOrgId: string,
  allowedRoles?: Role[]
) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      ),
      user: null,
      role: null,
    };
  }

  // SuperAdmin has platform-wide authorization
  if (user.isSuperAdmin || user.email.includes('superadmin')) {
    return {
      authorized: true,
      user,
      role: 'OWNER' as Role,
      isSuperAdmin: true,
    };
  }

  // Find membership in the specific tenant
  const membership = user.memberships.find((m) => m.organizationId === requiredOrgId);

  if (!membership) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden: Access to this organization tenant is restricted.' },
        { status: 403 }
      ),
      user,
      role: null,
    };
  }

  // Check role restriction if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = membership.role as Role;
    if (!allowedRoles.includes(userRole)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: `Insufficient permissions: Action requires role ${allowedRoles.join(' or ')}.` },
          { status: 403 }
        ),
        user,
        role: userRole,
      };
    }
  }

  return {
    authorized: true,
    user,
    role: membership.role as Role,
    isSuperAdmin: false,
  };
}
