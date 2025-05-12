import { publicProcedure } from '../../../trpc';
import { z } from 'zod';

export const hiProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().optional(),
    }).optional()
  )
  .query(({ input }) => {
    // Return minimal response without greeting message
    return {
      success: true
    };
  });
