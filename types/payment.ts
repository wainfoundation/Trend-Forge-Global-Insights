export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type PaymentType = 'subscription' | 'donation' | 'tip';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  date: string;
  metadata?: Record<string, any>;
}

export interface Donation {
  id: string;
  amount: number;
  journalistId: string;
  journalistName: string;
  journalistAvatar: string;
  message: string;
  date: string;
  status: PaymentStatus;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'basic' | 'premium';
  status: 'active' | 'expired' | 'canceled';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  price: number;
  currency: string;
}
