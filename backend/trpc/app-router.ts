import { router } from './trpc';
import { hiProcedure } from './routes/example/hi/route';
import { verifyPiPaymentProcedure } from './routes/pi-sdk/verify-payment/route';
import { completePiPaymentProcedure } from './routes/pi-sdk/complete-payment/route';

export const appRouter = router({
  example: router({
    hi: hiProcedure,
  }),
  piSdk: router({
    verifyPayment: verifyPiPaymentProcedure,
    completePayment: completePiPaymentProcedure,
  }),
});

export type AppRouter = typeof appRouter;
