export interface User {
  id: string;
  phone: string;
  role: 'admin' | 'team_member';
  name: string;
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