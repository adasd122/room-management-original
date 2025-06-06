import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  User, 
  Phone, 
  Home as HomeIcon,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format, parseISO } from 'date-fns';
import { Resident } from '../types';

const ResidentsList: React.FC = () => {
  const { residents, rooms } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  
  useEffect(() => {
    let filtered = residents;
    
    // Apply active/inactive filter
    if (activeFilter === 'active') {
      filtered = filtered.filter(resident => resident.status === 'active');
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter(resident => resident.status === 'inactive');
    }
    
    // Apply room filter
    if (roomFilter !== 'all') {
      filtered = filtered.filter(resident => resident.roomNumber === roomFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        resident =>
          resident.name.toLowerCase().includes(term) ||
          resident.contactNumber.includes(term) ||
          resident.homeAddress.toLowerCase().includes(term)
      );
    }
    
    setFilteredResidents(filtered);
  }, [residents, searchTerm, activeFilter, roomFilter]);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Residents</h1>
        <Link
          to="/residents/add"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add Resident
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search residents..."
              className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Status:</span>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              {(['active', 'inactive', 'all'] as const).map((status) => (
                <button
                  key={status}
                  className={`px-3 py-2 text-sm ${
                    activeFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Room filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Room:</span>
            <select
              className="border border-gray-300 rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="all">All Rooms</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.roomNumber}>
                  Room {room.roomNumber}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Residents List */}
      {filteredResidents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResidents.map((resident) => (
            <Link 
              to={`/residents/${resident.id}`} 
              key={resident.id}
              className="bg-white rounded-lg shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden"
            >
              <div className={`h-2 ${resident.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">{resident.name}</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <HomeIcon size={16} className="mr-2" />
                    <span>Room {resident.roomNumber}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Phone size={16} className="mr-2" />
                    <span>{resident.contactNumber}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span>Joined: {format(parseISO(resident.joiningDate), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <DollarSign size={16} className="mr-2" />
                    <span>Rent: ₹{resident.rentAmount}/month</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    resident.messSubscription === 'subscribed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {resident.messSubscription === 'subscribed' ? 'Mess: Active' : 'Mess: Inactive'}
                  </span>
                  <div className="text-primary-600 text-sm font-medium">View Details →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <User size={48} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">No residents found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || activeFilter !== 'all' || roomFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first resident to get started'}
          </p>
          {!searchTerm && activeFilter === 'all' && roomFilter === 'all' && (
            <Link
              to="/residents/add"
              className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Add Resident
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ResidentsList;