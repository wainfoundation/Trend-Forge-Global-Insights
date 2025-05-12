import { Donation } from '@/types/payment';

export const mockDonations: Donation[] = [
  {
    id: '1',
    amount: 5,
    journalistId: 'a1',
    journalistName: 'Sarah Johnson',
    journalistAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    message: 'I really enjoyed your article on tech startups. Keep up the great work!',
    date: '2023-09-15T14:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    amount: 10,
    journalistId: 'a6',
    journalistName: 'James Thompson',
    journalistAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    message: 'Your coverage of the crypto market has been invaluable. Thank you!',
    date: '2023-08-22T09:15:00Z',
    status: 'completed'
  },
  {
    id: '3',
    amount: 2.5,
    journalistId: 'a3',
    journalistName: 'Emma Rodriguez',
    journalistAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80',
    message: '',
    date: '2023-07-10T16:45:00Z',
    status: 'completed'
  },
  {
    id: '4',
    amount: 15,
    journalistId: 'a7',
    journalistName: 'Sophia Martinez',
    journalistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
    message: 'Your Pi Network coverage is the best! Looking forward to more insights.',
    date: '2023-06-05T11:20:00Z',
    status: 'completed'
  },
  {
    id: '5',
    amount: 7.5,
    journalistId: 'a2',
    journalistName: 'Michael Chen',
    journalistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    message: 'Your economic analysis is always spot on. Thank you for your insights!',
    date: '2023-05-18T13:10:00Z',
    status: 'completed'
  }
];
