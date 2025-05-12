import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Context } from './create-context';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // infers the `user` as non-nullable
      user: ctx.user,
    },
  });
});

// Protected procedure - only authenticated users can access
export const protectedProcedure = t.procedure.use(isAuthed);

// Admin procedure - only admin users can access
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Journalist procedure - only journalist users can access
export const journalistProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'journalist' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Journalist access required' });
  }
  return next({ ctx });
});
