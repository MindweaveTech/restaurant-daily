// Role hierarchy:
// - superadmin: Platform owner (gaurav18115@gmail.com), can invite business admins
// - business_admin: Restaurant owner, invited by superadmin, can invite employees
// - employee: Restaurant staff, invited by business admin
export type UserRole = 'superadmin' | 'business_admin' | 'employee';

export interface User {
  id: string;
  phone: string;
  email?: string;
  role: UserRole;
  name: string;
  restaurantId?: string;
  restaurantName?: string;
  status: 'pending' | 'active' | 'inactive';
  createdAt: Date;
  lastLogin?: Date;
}

export interface SystemAdmin {
  id: string;
  email: string;
  phone?: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastLogin?: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  googleMapsLink?: string;
  phone: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

export interface BusinessInvitation {
  id: string;
  invitedBy: string;
  email?: string;
  phone: string;
  restaurantName: string;
  role: 'business_admin';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitationToken: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

export interface StaffInvitation {
  id: string;
  restaurantId: string;
  phone: string;
  invitedBy: string;
  role: 'employee';
  permissions?: string[];
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitationToken: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

export interface CashSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  openingBalance: number;
  closingBalance?: number;
  totalSales: number;
  status: 'active' | 'closed';
}

export interface PettyVoucher {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
}

export interface ElectricityPayment {
  id: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  vendor: string;
  status: 'pending' | 'paid' | 'overdue';
  billNumber: string;
}

export interface DashboardStats {
  todaysSales: number;
  activeCashSession: CashSession | null;
  pendingVouchers: number;
  upcomingPayments: ElectricityPayment[];
}