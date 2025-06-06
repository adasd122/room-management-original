import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addMonths, format, isAfter, parseISO, startOfMonth } from 'date-fns';
import { 
  Resident, 
  Payment, 
  Room, 
  MessFee, 
  PaymentStatus 
} from '../types';

interface AppContextType {
  residents: Resident[];
  payments: Payment[];
  rooms: Room[];
  messFee: MessFee;
  addResident: (resident: Omit<Resident, 'id' | 'status'>) => void;
  updateResident: (resident: Resident) => void;
  removeResident: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (payment: Payment) => void;
  updateRoom: (room: Room) => void;
  updateMessFee: (fee: MessFee) => void;
  getPendingPayments: () => Payment[];
  getResidentPayments: (residentId: string) => Payment[];
  getTotalRevenue: () => number;
  getCurrentMonthRevenue: () => number;
}

const defaultMessFee: MessFee = {
  monthlyRate: 2000,
  isActive: true,
};

const defaultRooms: Room[] = [
  {
    id: uuidv4(),
    roomNumber: '101',
    capacity: 2,
    occupiedBy: [],
    status: 'vacant',
  },
  {
    id: uuidv4(),
    roomNumber: '102',
    capacity: 2,
    occupiedBy: [],
    status: 'vacant',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rooms, setRooms] = useState<Room[]>(() => {
    const savedRooms = localStorage.getItem('rooms');
    return savedRooms ? JSON.parse(savedRooms) : defaultRooms;
  });
  const [messFee, setMessFee] = useState<MessFee>(() => {
    const savedMessFee = localStorage.getItem('messFee');
    return savedMessFee ? JSON.parse(savedMessFee) : defaultMessFee;
  });

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadedResidents = localStorage.getItem('residents');
    const loadedPayments = localStorage.getItem('payments');
    
    if (loadedResidents) setResidents(JSON.parse(loadedResidents));
    if (loadedPayments) setPayments(JSON.parse(loadedPayments));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('residents', JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('messFee', JSON.stringify(messFee));
  }, [messFee]);

  const addResident = (residentData: Omit<Resident, 'id' | 'status'>) => {
    const newResident: Resident = {
      ...residentData,
      id: uuidv4(),
      status: 'active',
    };
    
    setResidents([...residents, newResident]);
    
    // Update room occupancy
    setRooms(rooms.map(room => {
      if (room.roomNumber === residentData.roomNumber) {
        return {
          ...room,
          occupiedBy: [...room.occupiedBy, newResident.id],
          status: room.occupiedBy.length + 1 >= room.capacity ? 'occupied' : 'vacant',
        };
      }
      return room;
    }));

    // Add security deposit payment
    if (residentData.securityDeposit > 0) {
      addPayment({
        residentId: newResident.id,
        amount: residentData.securityDeposit,
        date: new Date().toISOString(),
        type: 'security',
        month: format(new Date(), 'yyyy-MM'),
        status: 'paid',
        notes: 'Security deposit',
      });
    }
  };

  const updateResident = (resident: Resident) => {
    const oldResident = residents.find(r => r.id === resident.id);
    
    // Update room occupancy if room changed
    if (oldResident && oldResident.roomNumber !== resident.roomNumber) {
      setRooms(rooms.map(room => {
        if (room.roomNumber === oldResident.roomNumber) {
          return {
            ...room,
            occupiedBy: room.occupiedBy.filter(id => id !== resident.id),
            status: room.occupiedBy.filter(id => id !== resident.id).length >= room.capacity ? 'occupied' : 'vacant',
          };
        } else if (room.roomNumber === resident.roomNumber) {
          return {
            ...room,
            occupiedBy: [...room.occupiedBy, resident.id],
            status: [...room.occupiedBy, resident.id].length >= room.capacity ? 'occupied' : 'vacant',
          };
        }
        return room;
      }));
    }

    setResidents(residents.map(r => (r.id === resident.id ? resident : r)));
  };

  const removeResident = (id: string) => {
    const resident = residents.find(r => r.id === id);
    if (!resident) return;

    // Update room occupancy
    setRooms(rooms.map(room => {
      if (room.roomNumber === resident.roomNumber) {
        return {
          ...room,
          occupiedBy: room.occupiedBy.filter(residentId => residentId !== id),
          status: room.occupiedBy.filter(residentId => residentId !== id).length >= room.capacity ? 'occupied' : 'vacant',
        };
      }
      return room;
    }));

    // Set resident status to inactive instead of removing
    setResidents(residents.map(r => 
      r.id === id ? { ...r, status: 'inactive' } : r
    ));
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: uuidv4(),
    };
    setPayments([...payments, newPayment]);
  };

  const updatePayment = (payment: Payment) => {
    setPayments(payments.map(p => (p.id === payment.id ? payment : p)));
  };

  const updateRoom = (room: Room) => {
    setRooms(prevRooms => prevRooms.map(r => (r.id === room.id ? room : r)));
  };

  const updateMessFee = (fee: MessFee) => {
    setMessFee(fee);
  };

  const getPendingPayments = (): Payment[] => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    return payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  };

  const getResidentPayments = (residentId: string): Payment[] => {
    return payments.filter(p => p.residentId === residentId);
  };

  const getTotalRevenue = (): number => {
    return payments.reduce((total, payment) => {
      if (payment.status === 'paid' && payment.type !== 'security') {
        return total + payment.amount;
      }
      return total;
    }, 0);
  };

  const getCurrentMonthRevenue = (): number => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    return payments.reduce((total, payment) => {
      if (payment.status === 'paid' && payment.month === currentMonth && payment.type !== 'security') {
        return total + payment.amount;
      }
      return total;
    }, 0);
  };

  const value: AppContextType = {
    residents,
    payments,
    rooms,
    messFee,
    addResident,
    updateResident,
    removeResident,
    addPayment,
    updatePayment,
    updateRoom,
    updateMessFee,
    getPendingPayments,
    getResidentPayments,
    getTotalRevenue,
    getCurrentMonthRevenue,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}