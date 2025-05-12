import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';
import axios from 'axios';

export const verifyPiPaymentProcedure = protectedProcedure
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
      
      // Verify payment with Pi Network
      const response = await axios.get(
        `https://api.minepi.com/v2/payments/${paymentId}`,
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
      
      const payment = response.data;
      
      // Check if payment is verified
      if (!payment.transaction || !payment.transaction.verified) {
        return { 
          verified: false, 
          error: 'Payment not verified by Pi Network',
          status: payment.status
        };
      }
      
      // Return verified payment data
      return { 
        verified: true, 
        payment: {
          id: payment.identifier,
          amount: payment.amount,
          memo: payment.memo,
          txid: payment.transaction?.txid,
          user: payment.user,
          metadata: payment.metadata,
          status: payment.status,
          created_at: payment.created_at
        }
      };
    } catch (error) {
      console.error('Pi payment verification error:', error);
      throw new Error('Failed to verify Pi payment');
    }
  });
