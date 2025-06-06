import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, DollarSign, Home, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { PaymentStatus } from '../types';

const StatusCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
  textColor: string;
}> = ({ icon, label, value, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} ${textColor} rounded-lg p-6 shadow-card transition-all duration-300 hover:shadow-card-hover`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-white/20`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const PaymentAlert: React.FC<{
  residentName: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
}> = ({ residentName, amount, status, dueDate }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="mr-4">
          {status === 'overdue' ? (
            <AlertTriangle className="h-8 w-8 text-red-500" />
          ) : (
            <DollarSign className="h-8 w-8 text-orange-500" />
          )}
        </div>
        <div>
          <h3 className="font-medium">{residentName}</h3>
          <p className="text-sm text-gray-600">
            Due: {format(new Date(dueDate), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-lg font-semibold mr-3">₹{amount}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { 
    residents, 
    payments, 
    rooms, 
    getPendingPayments,
    getTotalRevenue,
    getCurrentMonthRevenue 
  } = useAppContext();
  
  const activeResidents = residents.filter(r => r.status === 'active');
  const pendingPayments = getPendingPayments();
  const totalRevenue = getTotalRevenue();
  const currentMonthRevenue = getCurrentMonthRevenue();
  
  // Calculate room occupancy
  const roomData = rooms.map(room => {
    const occupied = room.occupiedBy.length;
    const available = room.capacity - occupied;
    return {
      room: room.roomNumber,
      occupied,
      available,
    };
  });

  // Prepare data for monthly revenue chart (last 6 months)
  const getLastSixMonthsData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = format(month, 'yyyy-MM');
      
      const monthlyRevenue = payments.reduce((total, payment) => {
        if (payment.status === 'paid' && payment.month === monthKey && payment.type !== 'security') {
          return total + payment.amount;
        }
        return total;
      }, 0);
      
      data.push({
        name: format(month, 'MMM'),
        revenue: monthlyRevenue,
      });
    }
    
    return data;
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusCard 
          icon={<Users size={24} className="text-white" />}
          label="Total Residents"
          value={activeResidents.length}
          bgColor="bg-primary-600"
          textColor="text-white"
        />
        <StatusCard 
          icon={<DollarSign size={24} className="text-white" />}
          label="Monthly Revenue"
          value={`₹${currentMonthRevenue.toLocaleString()}`}
          bgColor="bg-accent-500"
          textColor="text-white"
        />
        <StatusCard 
          icon={<AlertTriangle size={24} className="text-white" />}
          label="Pending Payments"
          value={pendingPayments.length}
          bgColor="bg-red-500"
          textColor="text-white"
        />
        <StatusCard 
          icon={<Home size={24} className="text-white" />}
          label="Room Occupancy"
          value={`${activeResidents.length}/${rooms.reduce((total, room) => total + room.capacity, 0)}`}
          bgColor="bg-secondary-600"
          textColor="text-white"
        />
      </div>
      
      {/* Room Occupancy and Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-card lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getLastSixMonthsData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#7c3aed" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Room Occupancy</h2>
            <Link to="/residents" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {roomData.map((room) => (
              <div key={room.room} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-800">Room {room.room}</h3>
                  <span className="text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {room.occupied}/{room.occupied + room.available}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${(room.occupied / (room.occupied + room.available)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Payment Alerts */}
      <div className="bg-white p-6 rounded-lg shadow-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Payment Alerts</h2>
          <Link to="/payments" className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>
        
        {pendingPayments.length > 0 ? (
          <div className="space-y-3">
            {pendingPayments.slice(0, 5).map((payment) => {
              const resident = residents.find(r => r.id === payment.residentId);
              if (!resident) return null;
              
              return (
                <PaymentAlert 
                  key={payment.id}
                  residentName={resident.name}
                  amount={payment.amount}
                  status={payment.status}
                  dueDate={format(new Date(resident.joiningDate), 'yyyy-MM') === payment.month
                    ? resident.joiningDate
                    : `${payment.month}-${resident.paymentDate.toString().padStart(2, '0')}`}
                />
              );
            })}
            
            {pendingPayments.length > 5 && (
              <div className="text-center mt-4">
                <Link 
                  to="/payments" 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View {pendingPayments.length - 5} more alerts
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle size={40} className="mx-auto mb-2 text-gray-400" />
            <p>No pending payments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;