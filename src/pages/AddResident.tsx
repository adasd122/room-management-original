import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Save, Building, Phone, Map, Calendar, DollarSign, Home, Utensils } from 'lucide-react';

const AddResident: React.FC = () => {
  const navigate = useNavigate();
  const { addResident, rooms, messFee } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    homeAddress: '',
    roomNumber: '',
    rentAmount: 3000,
    paymentDate: 5,
    securityDeposit: 10000,
    joiningDate: new Date().toISOString().split('T')[0],
    expectedLeavingDate: '',
    messSubscription: 'subscribed' as 'subscribed' | 'unsubscribed',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 10 digits';
    }
    
    if (!formData.homeAddress.trim()) {
      newErrors.homeAddress = 'Home address is required';
    }
    
    if (!formData.roomNumber) {
      newErrors.roomNumber = 'Room number is required';
    }
    
    if (formData.rentAmount <= 0) {
      newErrors.rentAmount = 'Rent amount must be greater than 0';
    }
    
    if (formData.paymentDate < 1 || formData.paymentDate > 31) {
      newErrors.paymentDate = 'Payment date must be between 1 and 31';
    }
    
    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      addResident(formData);
      navigate('/residents');
    }
  };
  
  // Get available rooms (not fully occupied)
  const availableRooms = rooms.filter(room => 
    room.occupiedBy.length < room.capacity && room.status !== 'maintenance'
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center">
        <button 
          className="p-2 mr-2 rounded-full hover:bg-gray-100 text-gray-600"
          onClick={() => navigate('/residents')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add New Resident</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building size={18} className="mr-2 text-primary-600" />
              Personal Information
            </h2>
          </div>
          
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
              onChange={handleChange}
              className={`w-full border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              placeholder="Enter full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          
          {/* Contact Number */}
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className={`w-full pl-10 border ${
                  errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                } rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                placeholder="10-digit mobile number"
              />
            </div>
            {errors.contactNumber && <p className="mt-1 text-sm text-red-500">{errors.contactNumber}</p>}
          </div>
          
          {/* Home Address */}
          <div className="md:col-span-2">
            <label htmlFor="homeAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Home Address/Village*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Map size={16} className="text-gray-400" />
              </div>
              <textarea
                id="homeAddress"
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleChange}
                rows={2}
                className={`w-full pl-10 border ${
                  errors.homeAddress ? 'border-red-500' : 'border-gray-300'
                } rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                placeholder="Enter full home address"
              />
            </div>
            {errors.homeAddress && <p className="mt-1 text-sm text-red-500">{errors.homeAddress}</p>}
          </div>
          
          {/* Room Assignment */}
          <div className="md:col-span-2 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Home size={18} className="mr-2 text-primary-600" />
              Room Assignment
            </h2>
          </div>
          
          {/* Room Number */}
          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Room Number*
            </label>
            <select
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              className={`w-full border ${
                errors.roomNumber ? 'border-red-500' : 'border-gray-300'
              } rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
            >
              <option value="">Select a room</option>
              {availableRooms.length > 0 ? (
                availableRooms.map((room) => (
                  <option key={room.id} value={room.roomNumber}>
                    Room {room.roomNumber} ({room.occupiedBy.length}/{room.capacity} occupied)
                  </option>
                ))
              ) : (
                <option value="" disabled>No available rooms</option>
              )}
            </select>
            {errors.roomNumber && <p className="mt-1 text-sm text-red-500">{errors.roomNumber}</p>}
            {availableRooms.length === 0 && !errors.roomNumber && (
              <p className="mt-1 text-sm text-orange-500">All rooms are currently fully occupied.</p>
            )}
          </div>
          
          {/* Payment Information */}
          <div className="md:col-span-2 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <DollarSign size={18} className="mr-2 text-primary-600" />
              Payment Information
            </h2>
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
                onChange={handleChange}
                min="0"
                className={`w-full pl-10 border ${
                  errors.rentAmount ? 'border-red-500' : 'border-gray-300'
                } rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              />
            </div>
            {errors.rentAmount && <p className="mt-1 text-sm text-red-500">{errors.rentAmount}</p>}
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
              onChange={handleChange}
              min="1"
              max="31"
              className={`w-full border ${
                errors.paymentDate ? 'border-red-500' : 'border-gray-300'
              } rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              placeholder="Day of month (1-31)"
            />
            {errors.paymentDate && <p className="mt-1 text-sm text-red-500">{errors.paymentDate}</p>}
            <p className="mt-1 text-sm text-gray-500">Day of the month when rent is due</p>
          </div>
          
          {/* Security Deposit */}
          <div>
            <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700 mb-1">
              Security Deposit (₹)*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">₹</span>
              </div>
              <input
                type="number"
                id="securityDeposit"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
                min="0"
                className={`w-full pl-10 border ${
                  errors.securityDeposit ? 'border-red-500' : 'border-gray-300'
                } rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              />
            </div>
            {errors.securityDeposit && <p className="mt-1 text-sm text-red-500">{errors.securityDeposit}</p>}
          </div>
          
          {/* Mess Subscription */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mess Subscription
            </label>
            <div className="flex items-center space-x-3 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="messSubscription"
                  value="subscribed"
                  checked={formData.messSubscription === 'subscribed'}
                  onChange={() => setFormData(prev => ({ ...prev, messSubscription: 'subscribed' }))}
                  className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700">Subscribed (₹{messFee.monthlyRate}/month)</span>
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
          
          {/* Dates */}
          <div className="md:col-span-2 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar size={18} className="mr-2 text-primary-600" />
              Dates
            </h2>
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
              onChange={handleChange}
              className={`w-full border ${
                errors.joiningDate ? 'border-red-500' : 'border-gray-300'
              } rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
            />
            {errors.joiningDate && <p className="mt-1 text-sm text-red-500">{errors.joiningDate}</p>}
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
              value={formData.expectedLeavingDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/residents')}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
          >
            <Save size={18} className="mr-2" />
            Save Resident
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddResident;