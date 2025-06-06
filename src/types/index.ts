export type ResidentStatus = 'active' | 'inactive';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type MessSubscription = 'subscribed' | 'unsubscribed';
export type RoomStatus = 'occupied' | 'vacant' | 'maintenance';

export interface Resident {
  id: string;
  name: string;
  contactNumber: string;
  homeAddress: string;
  roomNumber: string;
  rentAmount: number;
  paymentDate: number; // Day of month (1-31)
  securityDeposit: number;
  joiningDate: string; // ISO date string
  expectedLeavingDate?: string; // ISO date string
  messSubscription: MessSubscription;
  status: ResidentStatus;
}

export interface Payment {
  id: string;
  residentId: string;
  amount: number;
  date: string; // ISO date string
  type: 'rent' | 'mess' | 'security' | 'other';
  month: string; // Format: "YYYY-MM"
  status: PaymentStatus;
  notes?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  occupiedBy: string[]; // Array of resident IDs
  status: RoomStatus;
}

export interface MessFee {
  monthlyRate: number;
  isActive: boolean;
}