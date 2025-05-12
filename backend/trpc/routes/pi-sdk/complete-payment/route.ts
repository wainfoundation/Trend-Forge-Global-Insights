import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';
import axios from 'axios';

export const completePiPaymentProcedure = protectedProcedure
  .input(
    z.object({
      paymentId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { paymentId } = input;
      
      // Get Pi API key from environment variables
      const piApiKey = process.env.PI_API_KEY;
      
      if (!piApiKey) {
        throw new Error('Pi API key not configured');
      }
      
      // Complete payment with Pi Network
      const response = await axios.post(
        `https://api.minepi.com/v2/payments/${paymentId}/complete`,
        {},
        {
          headers: {
            'X-Pi-API-Key': piApiKey
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      if (!response.data || !response.data.identifier) {
        throw new Error('Invalid response from Pi Network');
      }
      
      // Return completed payment data
      return { 
        completed: true, 
        payment: response.data
      };
    } catch (error) {
      console.error('Pi payment completion error:', error);
      throw new Error('Failed to complete Pi payment');
    }
  });
