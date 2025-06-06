import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Map, 
  Calendar, 
  DollarSign, 
  Home as HomeIcon,
  Utensils,
  Edit,
  Trash2,
  Download,
  Plus,
  X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Payment, PaymentStatus } from '../types';

const ResidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    residents, 
    payments, 
    updateResident, 
    removeResident, 
    getResidentPayments, 
    messFee,
    addPayment
  } = useAppContext();
  
  const resident = residents.find(r => r.id === id);
  const residentPayments = id ? getResidentPayments(id) : [];
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  
  // Form state for editing
  const [formData, setFormData] = useState(resident || {
    id: '',
    name: '',
    contactNumber: '',
    homeAddress: '',
    roomNumber: '',
    rentAmount: 0,
    paymentDate: 1,
    securityDeposit: 0,
    joiningDate: '',
    messSubscription: 'unsubscribed' as 'subscribed' | 'unsubscribed',
    status: 'active' as 'active' | 'inactive',
  });
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: resident?.rentAmount || 0,
    date: new Date().toISOString().split('T')[0],
    type: 'rent' as 'rent' | 'mess' | 'security' | 'other',
    month: format(new Date(), 'yyyy-MM'),
    status: 'paid' as PaymentStatus,
    notes: '',
  });
  
  if (!resident) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <User size={48} className="text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Resident not found</h2>
        <p className="text-gray-600 mb-6">The resident you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/residents"
          className="flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Residents
        </Link>
      </div>
    );
  }
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling edit
      setFormData(resident);
    }
    setIsEditing(!isEditing);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };
  
  const handleSaveEdit = () => {
    updateResident(formData);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    removeResident(resident.id);
    navigate('/residents');
  };
  
  const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setPaymentForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };
  
  const handlePaymentTypeChange = (type: 'rent' | 'mess' | 'security' | 'other') => {
    let amount = 0;
    
    switch (type) {
      case 'rent':
        amount = resident.rentAmount;
        break;
      case 'mess':
        amount = messFee.monthlyRate;
        break;
      case 'security':
        amount = resident.securityDeposit;
        break;
      default:
        amount = 0;
    }
    
    setPaymentForm((prev) => ({
      ...prev,
      type,
      amount,
    }));
  };
  
  const handleAddPayment = () => {
    addPayment({
      ...paymentForm,
      residentId: resident.id,
    });
    
    setPaymentForm({
      amount: resident.rentAmount,
      date: new Date().toISOString().split('T')[0],
      type: 'rent',
      month: format(new Date(), 'yyyy-MM'),
      status: 'paid',
      notes: '',
    });
    
    setShowAddPayment(false);
  };
  
  return (
    <div className="animate-fade-in">
      {/* Header with navigation and actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <button 
            className="p-2 mr-2 rounded-full hover:bg-gray-100 text-gray-600"
            onClick={() => navigate('/residents')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{resident.name}</h1>
          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
            resident.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {resident.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-2 rounded-lg border ${
              isEditing 
                ? 'border-red-300 text-red-600 hover:bg-red-50' 
                : 'border-primary-300 text-primary-600 hover:bg-primary-50'
            } focus:outline-none`}
            onClick={handleEditToggle}
          >
            {isEditing ? (
              <>
                <X size={18} className="inline mr-1" />
                Cancel
              </>
            ) : (
              <>
                <Edit size={18} className="inline mr-1" />
                Edit
              </>
            )}
          </button>
          
          {isEditing ? (
            <button 
              className="px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none"
              onClick={handleSaveEdit}
            >
              <Save size={18} className="inline mr-1" />
              Save
            </button>
          ) : (
            <button 
              className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={18} className="inline mr-1" />
              Delete
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resident Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="px-6 py-4 bg-primary-50 border-b border-primary-100">
              <h2 className="text-lg font-semibold text-gray-800">Resident Information</h2>
            </div>
            
            <div className="p-6">
              {isEditing ? (
                /* Edit Form */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  {/* Contact Number */}
                  <div>
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number*
                    </label>
                    <input
                      type="text"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  {/* Home Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="homeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Home Address/Village*
                    </label>
                    <textarea
                      id="homeAddress"
                      name="homeAddress"
                      value={formData.homeAddress}
                      onChange={handleFormChange}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  {/* Room Number */}
                  <div>
                    <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Room Number*
                    </label>
                    <input
                      type="text"
                      id="roomNumber"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      readOnly
                    />
                    <p className="mt-1 text-xs text-gray-500">Room cannot be changed</p>
                  </div>
                  
                  {/* Rent Amount */}
                  <div>
                    <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Rent Amount (₹)*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        type="number"
                        id="rentAmount"
                        name="rentAmount"
                        value={formData.rentAmount}
                        onChange={handleFormChange}
                        min="0"
                        className="w-full pl-10 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  {/* Payment Date */}
                  <div>
                    <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Payment Date*
                    </label>
                    <input
                      type="number"
                      id="paymentDate"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleFormChange}
                      min="1"
                      max="31"
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  {/* Mess Subscription */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mess Subscription
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="messSubscription"
                          value="subscribed"
                          checked={formData.messSubscription === 'subscribed'}
                          onChange={() => setFormData(prev => ({ ...prev, messSubscription: 'subscribed' }))}
                          className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-gray-700">Subscribed</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="messSubscription"
                          value="unsubscribed"
                          checked={formData.messSubscription === 'unsubscribed'}
                          onChange={() => setFormData(prev => ({ ...prev, messSubscription: 'unsubscribed' }))}
                          className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-gray-700">Not Subscribed</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={formData.status === 'active'}
                          onChange={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                          className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-gray-700">Active</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={formData.status === 'inactive'}
                          onChange={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                          className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-gray-700">Inactive</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Joining Date */}
                  <div>
                    <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Joining Date*
                    </label>
                    <input
                      type="date"
                      id="joiningDate"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  {/* Expected Leaving Date */}
                  <div>
                    <label htmlFor="expectedLeavingDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Leaving Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="expectedLeavingDate"
                      name="expectedLeavingDate"
                      value={formData.expectedLeavingDate || ''}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-gray-800 font-medium flex items-center mt-1">
                      <User size={18} className="mr-2 text-gray-400" />
                      {resident.name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="text-gray-800 font-medium flex items-center mt-1">
                      <Phone size={18} className="mr-2 text-gray-400" />
                      {resident.contactNumber}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Home Address/Village</p>
                    <p className="text-gray-800 font-medium flex items-center mt-1">
                      <Map size={18} className="mr-2 text-gray-400" />
                      {resident.homeAddress}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Room Number</p>
                    <p className="text-gray-800 font-medium flex items-center mt-1">
                      <HomeIcon size={18} className="mr-2 text-gray-400" />
                      Room {resident.roomNumber}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Monthly Rent</p>
                    <p className="text-gray-800 font-medium flex items-center mt-1">
                      <DollarSign size={18} className="mr-2 text-gray-400" />
                      ₹{resident.rentAmount.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Payment Date</p>
                    <p className="text-gray-800 font-medium flex items-center mt-1">
                      <Calendar size={18} className="mr-2 text-gray-400" />
                      {resident.paymentDate}<sup>th</sup> of every month
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Mess Subscription</p>
                    <p className="text-gray-800 font-medium flex items-center mt-1">
                      <Utensils size={18} className="mr-2 text-gray-400" />
                      {resident.messSubscription === 'subscribed' ? 
                        `Subscribed (₹${messFee.monthlyRate}/month)` : 
                        'Not Subscribed'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Joining Date</p>
                    <p className="text-gray-800 font-medium flex items-center mt-1">
                      <Calendar size={18} className="mr-2 text-gray-400" />
                      {format(parseISO(resident.joiningDate), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Expected Leaving Date</p>
                    <p className="text-gray-800 font-medium flex items-center mt-1">
                      <Calendar size={18} className="mr-2 text-gray-400" />
                      {resident.expectedLeavingDate 
                        ? format(parseISO(resident.expectedLeavingDate), 'MMMM dd, yyyy')
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Security Deposit</p>
                    <p className="text-gray-800 font-medium flex items-center mt-1">
                      <DollarSign size={18} className="mr-2 text-gray-400" />
                      ₹{resident.securityDeposit.toLocaleString()} 
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                        Paid
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Payment History */}
          <div className="bg-white rounded-lg shadow-card mt-6 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 bg-primary-50 border-b border-primary-100">
              <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
              <button 
                className="text-sm flex items-center text-primary-600 hover:text-primary-700 focus:outline-none"
                onClick={() => setShowAddPayment(true)}
              >
                <Plus size={16} className="mr-1" />
                Add Payment
              </button>
            </div>
            
            <div className="p-6">
              {residentPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {residentPayments
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {format(parseISO(payment.date), 'MMM dd, yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{payment.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                payment.type === 'rent' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : payment.type === 'mess'
                                  ? 'bg-purple-100 text-purple-800'
                                  : payment.type === 'security'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                payment.status === 'paid' 
                                  ? 'bg-green-100 text-green-800'
                                  : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              <button className="text-primary-600 hover:text-primary-700 focus:outline-none">
                                <Download size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign size={40} className="mx-auto mb-2 text-gray-400" />
                  <p>No payment records found</p>
                  <button 
                    className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    onClick={() => setShowAddPayment(true)}
                  >
                    Add first payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Resident Summary */}
        <div className="lg:row-start-1">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="px-6 py-4 bg-primary-50 border-b border-primary-100">
              <h2 className="text-lg font-semibold text-gray-800">Resident Summary</h2>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="inline-block h-20 w-20 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
                  <User size={40} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{resident.name}</h3>
                <p className="text-gray-600">Resident since {format(parseISO(resident.joiningDate), 'MMMM yyyy')}</p>
              </div>
              
              <div className="space-y-4">
                {/* Length of Stay */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <Calendar size={18} className="mr-2 text-primary-600" />
                    <span>Length of Stay</span>
                  </div>
                  <span className="font-medium">
                    {(() => {
                      const start = parseISO(resident.joiningDate);
                      const today = new Date();
                      const diffMonths = today.getMonth() - start.getMonth() + 
                        (today.getFullYear() - start.getFullYear()) * 12;
                      
                      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
                    })()}
                  </span>
                </div>
                
                {/* Room */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <HomeIcon size={18} className="mr-2 text-primary-600" />
                    <span>Room</span>
                  </div>
                  <span className="font-medium">Room {resident.roomNumber}</span>
                </div>
                
                {/* Rent Amount */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <DollarSign size={18} className="mr-2 text-primary-600" />
                    <span>Monthly Rent</span>
                  </div>
                  <span className="font-medium">₹{resident.rentAmount.toLocaleString()}</span>
                </div>
                
                {/* Security Deposit */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <DollarSign size={18} className="mr-2 text-primary-600" />
                    <span>Security Deposit</span>
                  </div>
                  <span className="font-medium">₹{resident.securityDeposit.toLocaleString()}</span>
                </div>
                
                {/* Mess Status */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <Utensils size={18} className="mr-2 text-primary-600" />
                    <span>Mess Status</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    resident.messSubscription === 'subscribed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {resident.messSubscription === 'subscribed' ? 'Subscribed' : 'Not Subscribed'}
                  </span>
                </div>
                
                {/* Total Payments */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <DollarSign size={18} className="mr-2 text-primary-600" />
                    <span>Total Payments</span>
                  </div>
                  <span className="font-medium">
                    ₹{residentPayments
                      .filter(p => p.status === 'paid')
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()}
                  </span>
                </div>
                
                {/* Payment Due Date */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <Calendar size={18} className="mr-2 text-primary-600" />
                    <span>Payment Due Date</span>
                  </div>
                  <span className="font-medium">
                    {resident.paymentDate}<sup>th</sup> of every month
                  </span>
                </div>
                
                {/* Next Payment */}
                <div className="mt-6">
                  <button 
                    className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                    onClick={() => setShowAddPayment(true)}
                  >
                    <Plus size={18} className="mr-2" />
                    Record Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove <span className="font-medium">{resident.name}</span> from the system? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Payment Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4 animate-slide-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Record Payment</h3>
              <button 
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                onClick={() => setShowAddPayment(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type*
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['rent', 'mess', 'security', 'other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`px-3 py-2 rounded-lg border ${
                        paymentForm.type === type 
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handlePaymentTypeChange(type)}
                    >
                      {type === 'rent' && <HomeIcon size={16} className="inline mr-1" />}
                      {type === 'mess' && <Utensils size={16} className="inline mr-1" />}
                      {type === 'security' && <DollarSign size={16} className="inline mr-1" />}
                      {type === 'other' && <Plus size={16} className="inline mr-1" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={paymentForm.amount}
                    onChange={handlePaymentFormChange}
                    min="0"
                    className="w-full pl-10 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date*
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={paymentForm.date}
                  onChange={handlePaymentFormChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* Month */}
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                  For Month*
                </label>
                <input
                  type="month"
                  id="month"
                  name="month"
                  value={paymentForm.month}
                  onChange={handlePaymentFormChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status*
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['paid', 'pending', 'overdue'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`px-3 py-2 rounded-lg border ${
                        paymentForm.status === status 
                          ? status === 'paid' 
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : status === 'pending'
                            ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                            : 'bg-red-50 border-red-500 text-red-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setPaymentForm(prev => ({ ...prev, status }))}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={paymentForm.notes}
                  onChange={handlePaymentFormChange}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add any additional information here"
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowAddPayment(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  onClick={handleAddPayment}
                >
                  Save Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDetail;