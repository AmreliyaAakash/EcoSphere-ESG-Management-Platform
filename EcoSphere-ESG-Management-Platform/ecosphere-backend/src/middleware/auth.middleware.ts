import { Request, Response, NextFunction } from 'express';
import { createClerkClient } from '@clerk/backend';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';
import { Employee } from '../models/Employee';
import { Department } from '../models/Department';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Initialize Clerk Backend SDK Client
const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

/**
 * Production-ready JWT middleware supporting both Clerk tokens and local JWTs.
 *  1. Try Clerk session token verification
 *  2. Fall back to local signed JWT (useful for integration tests & custom API calls)
 *  3. Auto-provisions Employee records for new Clerk users.
 */
export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    throw new ApiError(401, 'Unauthorized: No token provided');
  }

  // ── Path 1: Clerk Token Verification ─────────────────────────────────────
  try {
    const { verifyToken } = await import('@clerk/backend');
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
      clockSkewInMs: 5 * 60 * 1000,
    });

    const userId = payload.sub;
    if (!userId) throw new Error('Missing user ID in token payload');

    // Fetch Clerk user profile for their email
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) throw new Error('No email on Clerk user profile');

    // Find or auto-provision the Employee record
    let user = await Employee.findOne({ email });
    if (!user) {
      console.log(`[AUTH] Auto-provisioning Employee for: ${email}`);
      const defaultDept = await Department.findOne();
      user = await Employee.create({
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
              clerkUser.username || email.split('@')[0],
        email,
        password: `clerk_sso_${Date.now()}_not_used`,
        role: 'ADMIN',
        departmentId: defaultDept?._id,
        xpBalance: 1000,
        pointsBalance: 500,
        avatarUrl: clerkUser.imageUrl ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
      });
    }

    req.user = user;
    return next();
  } catch (clerkErr: any) {
    // If it's a Clerk token expiry error, propagate it early
    const msg = clerkErr?.message ?? String(clerkErr);
    if (msg.includes('expired')) {
      throw new ApiError(401, 'Session expired. Please refresh the page to continue.');
    }
    // Otherwise, try Path 2
    console.log('[AUTH] Clerk token verification failed, trying local JWT...');
  }

  // ── Path 2: Local JWT Verification (for integration tests & local bypass) ──
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };

    if (!decoded?.id) throw new Error('Missing id in local JWT payload');

    const user = await Employee.findById(decoded.id);
    if (!user) throw new Error('Employee not found for local JWT id');

    req.user = user;
    return next();
  } catch (jwtErr: any) {
    console.error('[AUTH] Local JWT verification also failed:', jwtErr?.message ?? jwtErr);
    throw new ApiError(401, 'Invalid or expired authentication token. Please log in again.');
  }
});
