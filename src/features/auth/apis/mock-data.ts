import { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-customer-1',
    name: 'أحمد التاجر (زبون 1)',
    email: 'customer1@store.local',
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
  },
  {
    id: 'user-customer-2',
    name: 'سارة الزبونة (زبون 2)',
    email: 'customer2@store.local',
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  },
  {
    id: 'user-admin-1',
    name: 'مدير المتجر العام',
    email: 'admin@store.local',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
];
