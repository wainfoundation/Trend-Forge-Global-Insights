export interface Journalist {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  expertise: string[];
  joinDate: string;
  articles?: number; // Number of articles published
  followers?: number;
  rating?: number;
  verified: boolean;
  twitter?: string; // Twitter handle
  linkedin?: string;
  website?: string;
  status: 'active' | 'pending' | 'rejected';
  role: 'journalist';
  piAddress?: string;
  earnings?: number;
  paymentHistory?: {
    id: string;
    amount: number;
    date: string;
    type: 'donation' | 'salary' | 'bonus';
    status: 'completed' | 'pending' | 'failed';
  }[];
}

export interface JournalistApplication {
  id: string;
  name: string;
  email: string;
  bio: string;
  expertise: string[];
  samples: string[];
  resume?: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: string;
  reviewDate?: string;
  reviewedBy?: string;
  comments?: string;
}
