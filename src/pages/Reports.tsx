import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Download, DollarSign, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';

const COLORS = ['#7C3AED', '#0D9488', '#F59E0B', '#EF4444'];

const Reports: React.FC = () => {
  const { payments, residents } = useAppContext();
  const [dateRange, setDateRange] = useState<'3m' | '6m' | '1y'>('3m');
  
  // Calculate start date based on range
  const getStartDate = () => {
    const today = new Date();
    switch (dateRange) {
      case '3m':
        return subMonths(today, 3);
      case '6m':
        return subMonths(today, 6);
      case '1y':
        return subMonths(today, 12);
      default:
        return subMonths(today, 3);
    }
  };
  
  // Monthly revenue data
  const getMonthlyRevenueData = () => {
    const data = [];
    const startDate = getStartDate();
    const today = new Date();
    
    let currentDate = startOfMonth(startDate);
    while (currentDate <= today) {
      const monthKey = format(currentDate, 'yyyy-MM');
      
      const rentPayments = payments.filter(p => 
        p.month === monthKey && 
        p.status === 'paid' && 
        p.type === 'rent'
      ).reduce((sum, p) => sum + p.amount, 0);
      
      const messPayments = payments.filter(p => 
        p.month === monthKey && 
        p.status === 'paid' && 
        p.type === 'mess'
      ).reduce((sum, p) => sum + p.amount, 0);
      
      const otherPayments = payments.filter(p => 
        p.month === monthKey && 
        p.status === 'paid' && 
        (p.type !== 'rent' && p.type !== 'mess' && p.type !== 'security')
      ).reduce((sum, p) => sum + p.amount, 0);
      
      data.push({
        month: format(currentDate, 'MMM yy'),
        rent: rentPayments,
        mess: messPayments,
        other: otherPayments,
        total: rentPayments + messPayments + otherPayments,
      });
      
      currentDate = startOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
    
    return data;
  };
  
  // Payment status distribution
  const getPaymentStatusData = () => {
    const startDate = getStartDate();
    const relevantPayments = payments.filter(p => 
      new Date(p.date) >= startDate || p.status !== 'paid'
    );
    
    const statusCount = {
      paid: relevantPayments.filter(p => p.status === 'paid').length,
      pending: relevantPayments.filter(p => p.status === 'pending').length,
      overdue: relevantPayments.filter(p => p.status === 'overdue').length,
    };
    
    return [
      { name: 'Paid', value: statusCount.paid },
      { name: 'Pending', value: statusCount.pending },
      { name: 'Overdue', value: statusCount.overdue },
    ];
  };
  
  // Payment type distribution
  const getPaymentTypeData = () => {
    const startDate = getStartDate();
    const relevantPayments = payments.filter(p => new Date(p.date) >= startDate);
    
    const typeSum = {
      rent: relevantPayments.filter(p => p.type === 'rent' && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      mess: relevantPayments.filter(p => p.type === 'mess' && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      security: relevantPayments.filter(p => p.type === 'security' && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      other: relevantPayments.filter(p => p.type === 'other' && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    };
    
    return [
      { name: 'Rent', value: typeSum.rent },
      { name: 'Mess', value: typeSum.mess },
      { name: 'Security', value: typeSum.security },
      { name: 'Other', value: typeSum.other },
    ];
  };
  
  const exportPaymentData = () => {
    const startDate = getStartDate();
    const relevantPayments = payments.filter(p => new Date(p.date) >= startDate);
    
    const csvData = relevantPayments.map(payment => {
      const resident = residents.find(r => r.id === payment.residentId);
      return {
        date: format(parseISO(payment.date), 'yyyy-MM-dd'),
        resident: resident ? resident.name : 'Unknown',
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        month: payment.month,
        notes: payment.notes || '',
      };
    });
    
    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).map(value => `"${value}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <button 
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
          onClick={exportPaymentData}
        >
          <Download size={18} className="mr-2" />
          Export Data
        </button>
      </div>
      
      {/* Date Range Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-3">
        <span className="text-gray-700 font-medium mr-2 my-auto">Time Period:</span>
        {(
          [
            { value: '3m', label: 'Last 3 Months' },
            { value: '6m', label: 'Last 6 Months' },
            { value: '1y', label: 'Last Year' },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            className={`px-4 py-2 rounded-lg ${
              dateRange === option.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setDateRange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      {/* Revenue Overview */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-card">
        <div className="flex items-center mb-4">
          <BarChartIcon size={20} className="mr-2 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-800">Monthly Revenue</h2>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getMonthlyRevenueData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`₹${value}`, '']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <Legend />
              <Bar dataKey="rent" name="Rent" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mess" name="Mess" fill="#0D9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="other" name="Other" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Payment Trends and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trends */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center mb-4">
            <LineChart className="mr-2 text-primary-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Revenue Trends</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getMonthlyRevenueData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, '']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total Revenue" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Payment Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center mb-4">
            <PieChartIcon className="mr-2 text-primary-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Revenue Distribution</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getPaymentTypeData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {getPaymentTypeData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₹${value}`, '']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <DollarSign size={20} className="mr-2 text-primary-600" />
          Payment Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Collected */}
          <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
            <p className="text-sm text-primary-600 mb-1">Total Collected</p>
            <p className="text-2xl font-bold text-primary-800">
              ₹{
                payments
                  .filter(p => 
                    p.status === 'paid' && 
                    new Date(p.date) >= getStartDate() &&
                    p.type !== 'security'
                  )
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString()
              }
            </p>
            <p className="text-xs text-primary-600 mt-2">
              {dateRange === '3m' && 'Last 3 Months'}
              {dateRange === '6m' && 'Last 6 Months'}
              {dateRange === '1y' && 'Last 12 Months'}
            </p>
          </div>
          
          {/* Pending Amount */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <p className="text-sm text-yellow-600 mb-1">Pending Amount</p>
            <p className="text-2xl font-bold text-yellow-800">
              ₹{
                payments
                  .filter(p => p.status === 'pending')
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString()
              }
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              {payments.filter(p => p.status === 'pending').length} pending payments
            </p>
          </div>
          
          {/* Overdue Amount */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="text-sm text-red-600 mb-1">Overdue Amount</p>
            <p className="text-2xl font-bold text-red-800">
              ₹{
                payments
                  .filter(p => p.status === 'overdue')
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString()
              }
            </p>
            <p className="text-xs text-red-600 mt-2">
              {payments.filter(p => p.status === 'overdue').length} overdue payments
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-md font-medium text-gray-800 mb-3">Payment Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getPaymentStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#10B981" /> {/* Paid */}
                  <Cell fill="#F59E0B" /> {/* Pending */}
                  <Cell fill="#EF4444" /> {/* Overdue */}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} payments`, '']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;