import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Settings as SettingsIcon, 
  DollarSign, 
  Home as HomeIcon,
  Utensils, 
  Save
} from 'lucide-react';

const Settings: React.FC = () => {
  const { messFee, updateMessFee, rooms, updateRoom } = useAppContext();
  
  const [messSettings, setMessSettings] = useState(messFee);
  const [roomSettings, setRoomSettings] = useState(rooms);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleMessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setMessSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value),
    }));
  };
  
  const handleRoomChange = (roomId: string, field: keyof typeof roomSettings[0], value: any) => {
    const newValue = field === 'capacity' ? Math.max(1, parseInt(value) || 1) : value;
    
    setRoomSettings(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              [field]: newValue,
              // Update status if capacity changes
              status: field === 'capacity' && room.occupiedBy.length >= newValue ? 'occupied' : room.status
            } 
          : room
      )
    );
  };
  
  const handleSaveSettings = () => {
    // Update mess settings
    updateMessFee(messSettings);
    localStorage.setItem('messFee', JSON.stringify(messSettings));
    
    // Update room settings
    roomSettings.forEach(room => {
      updateRoom(room);
    });
    localStorage.setItem('rooms', JSON.stringify(roomSettings));
    
    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      
      {/* Mess Settings */}
      <div className="mb-6 bg-white rounded-lg shadow-card overflow-hidden">
        <div className="px-6 py-4 bg-primary-50 border-b border-primary-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Utensils size={18} className="mr-2 text-primary-600" />
            Mess Settings
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="monthlyRate" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Mess Fee (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  id="monthlyRate"
                  name="monthlyRate"
                  value={messSettings.monthlyRate}
                  onChange={handleMessChange}
                  min="0"
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={messSettings.isActive}
                  onChange={handleMessChange}
                  className="sr-only"
                />
                <div className={`relative w-12 h-6 rounded-full transition-colors ${
                  messSettings.isActive ? 'bg-primary-600' : 'bg-gray-300'
                }`}>
                  <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-transform ${
                    messSettings.isActive ? 'translate-x-7' : 'translate-x-1'
                  }`}></div>
                </div>
                <span className="ml-3 text-gray-700">
                  {messSettings.isActive ? 'Mess Service Enabled' : 'Mess Service Disabled'}
                </span>
              </label>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            {messSettings.isActive 
              ? 'Mess service is currently active. Residents can subscribe to mess services.'
              : 'Mess service is currently disabled. Residents cannot subscribe to mess services.'}
          </div>
        </div>
      </div>
      
      {/* Room Settings */}
      <div className="mb-6 bg-white rounded-lg shadow-card overflow-hidden">
        <div className="px-6 py-4 bg-primary-50 border-b border-primary-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <HomeIcon size={18} className="mr-2 text-primary-600" />
            Room Settings
          </h2>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Occupancy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roomSettings.map((room) => (
                  <tr key={room.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 font-medium">Room {room.roomNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min={Math.max(1, room.occupiedBy.length)}
                        value={room.capacity}
                        onChange={(e) => handleRoomChange(room.id, 'capacity', e.target.value)}
                        className={`w-20 border rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          room.occupiedBy.length > 0 ? 'border-gray-300' : 'border-gray-300'
                        }`}
                      />
                      {room.occupiedBy.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          Min capacity: {room.occupiedBy.length}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {room.occupiedBy.length} / {room.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={room.status}
                        onChange={(e) => handleRoomChange(room.id, 'status', e.target.value)}
                        className="border border-gray-300 rounded-lg py-1 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="vacant">Vacant</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* General Settings */}
      <div className="mb-6 bg-white rounded-lg shadow-card overflow-hidden">
        <div className="px-6 py-4 bg-primary-50 border-b border-primary-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <SettingsIcon size={18} className="mr-2 text-primary-600" />
            General Settings
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="hostelName" className="block text-sm font-medium text-gray-700 mb-1">
                Hostel Name
              </label>
              <input
                type="text"
                id="hostelName"
                name="hostelName"
                defaultValue="Girls Hostel"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                defaultValue="admin@example.com"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                id="contactPhone"
                name="contactPhone"
                defaultValue="1234567890"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Hostel Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                defaultValue="123 Main Street, City"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Settings Button */}
      <div className="flex justify-end">
        <button
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center shadow-md transition-all duration-300 hover:shadow-lg"
          onClick={handleSaveSettings}
        >
          <Save size={18} className="mr-2" />
          Save Settings
        </button>
      </div>
      
      {/* Success message */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-md animate-fade-in">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>Settings saved successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;