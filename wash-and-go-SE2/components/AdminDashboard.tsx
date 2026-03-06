import React, { useState, useMemo, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { Booking } from '../types';
import { CheckCircle, XCircle, Clock, Filter, Calendar, Settings, Car, Bike, Wrench, Image as ImageIcon, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface AdminDashboardProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, status: any) => void;
  onAddUpdate: (id: string, message: string, imageUrl?: string) => void;
}

export default function AdminDashboard({ bookings, onUpdateStatus, onAddUpdate }: AdminDashboardProps) {

  const [downPaymentPercentage, setDownPaymentPercentage] = useState(30);

  const [filterStatus, setFilterStatus] = useState<Booking['status'] | 'All'>('All');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterVehicle, setFilterVehicle] = useState<'All' | 'Car' | 'Motorcycle'>('All');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateImage, setUpdateImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (filterStatus !== 'All' && b.status !== filterStatus) return false;
      if (filterDate && b.date !== filterDate) return false;
      if (filterVehicle !== 'All' && b.vehicleCategory !== filterVehicle) return false;
      return true;
    }).sort((a, b) => {
      const timeA = a.time ?? a.timeSlot;
      const timeB = b.time ?? b.timeSlot;
      return new Date(`${a.date}T${timeA}`).getTime() - new Date(`${b.date}T${timeB}`).getTime();
    });
  }, [bookings, filterStatus, filterDate, filterVehicle]);

  // Capacity Monitoring
  const today = format(new Date(), 'yyyy-MM-dd');
  const activeToday = bookings.filter(b => {
    const s = b.status as string;
    return b.date === today && s !== 'Cancelled' && s !== 'Completed' && s !== 'CANCELLED' && s !== 'COMPLETED';
  });

  const carWashLubeCount = activeToday.filter(b => b.vehicleCategory === 'Car' && (b.bayType === 'Wash' || b.bayType === 'Lube')).length;
  const motoWashLubeCount = activeToday.filter(b => b.vehicleCategory === 'Motorcycle' && (b.bayType === 'Wash' || b.bayType === 'Lube')).length;
  const detailingCount = activeToday.filter(b => b.bayType === 'Detailing').length;
  const coatingCount = activeToday.filter(b => b.bayType === 'Coating').length;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdateImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBooking && updateMessage.trim()) {
      onAddUpdate(selectedBooking.id, updateMessage, updateImage || undefined);

      // Optimistically update the selected booking in local state
      const newUpdate = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        message: updateMessage,
        imageUrl: updateImage || undefined,
      };
      setSelectedBooking({
        ...selectedBooking,
        updates: [...(selectedBooking.updates || []), newUpdate]
      });

      setUpdateMessage('');
      setUpdateImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Confirmed': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-orange-100 text-orange-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      // enum values
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
            <p className="text-gray-500">Manage bookings and monitor capacity.</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <Settings className="text-gray-400 w-5 h-5" />
            <div>
              <label className="text-xs text-gray-500 block">Down Payment %</label>
              <select
                value={downPaymentPercentage}
                onChange={(e) => setDownPaymentPercentage(Number(e.target.value))}
                className="text-sm font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
              >
                <option value={30}>30%</option>
                <option value={50}>50%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Capacity Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-orange-500" /> Today's Capacity Overview ({today})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Car Wash/Lube</p>
              <p className="text-2xl font-bold text-slate-900">{carWashLubeCount} <span className="text-sm font-normal text-gray-400">/ 4 max</span></p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Moto Wash/Lube</p>
              <p className="text-2xl font-bold text-slate-900">{motoWashLubeCount} <span className="text-sm font-normal text-gray-400">/ 3 max</span></p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Detailing Room</p>
              <p className="text-2xl font-bold text-slate-900">{detailingCount} <span className="text-sm font-normal text-gray-400">/ 2 max</span></p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Ceramic Coating</p>
              <p className="text-2xl font-bold text-slate-900">{coatingCount} <span className="text-sm font-normal text-gray-400">/ 2 max</span></p>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <Filter className="w-5 h-5 mr-2 text-orange-500" /> Filter Bookings
            </h2>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select
                value={filterStatus as string}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={filterVehicle}
                onChange={(e) => setFilterVehicle(e.target.value as any)}
                className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 outline-none"
              >
                <option value="All">All Vehicles</option>
                <option value="Car">Cars</option>
                <option value="Motorcycle">Motorcycles</option>
              </select>

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 outline-none"
              />
              {filterDate && (
                <button onClick={() => setFilterDate('')} className="text-xs text-orange-400 hover:text-orange-300">Clear Date</button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-semibold">ID / Date</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Vehicle &amp; Service</th>
                  <th className="p-4 font-semibold">Payment</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No bookings found matching the filters.</td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono text-xs text-gray-500 mb-1">#{booking.id}</div>
                        <div className="font-semibold text-slate-900">{format(parseISO(booking.date), 'MMM d, yyyy')}</div>
                        <div className="text-sm text-orange-600 font-medium">{booking.time ?? booking.timeSlot}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{booking.customerName}</div>
                        <div className="text-sm text-gray-500">{booking.contact ?? booking.customerPhone}</div>
                        {booking.email && <div className="text-xs text-gray-400">{booking.email}</div>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm font-medium text-slate-800 mb-1">
                          {booking.vehicleCategory === 'Car' ? <Car className="w-4 h-4 mr-1 text-gray-400" /> : <Bike className="w-4 h-4 mr-1 text-gray-400" />}
                          {booking.vehicleCategory ?? booking.vehicleType} (Size {booking.vehicleSize}) {booking.fuelType}
                        </div>
                        {booking.plateNumber && (
                          <div className="text-sm font-bold text-slate-900 mb-1">{booking.plateNumber}</div>
                        )}
                        <div className="text-sm text-gray-600">{booking.serviceName}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-900">
                          ₱{(booking.downPayment ?? booking.downPaymentAmount).toLocaleString()} <span className="text-xs text-gray-500 font-normal">DP</span>
                        </div>
                        {booking.paymentMethod && (
                          <div className="text-xs text-gray-500 mt-1">{booking.paymentMethod}</div>
                        )}
                        {booking.referenceNumber && (
                          <div className="text-xs font-mono text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">Ref: {booking.referenceNumber}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold flex items-center w-max",
                          getStatusColor(booking.status as string)
                        )}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manage Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-500" />
                Manage Booking #{selectedBooking.id}
                {selectedBooking.plateNumber && (
                  <span className="text-sm font-normal text-gray-500">({selectedBooking.plateNumber})</span>
                )}
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Payment Proof */}
              {selectedBooking.paymentProofUrl && (
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Proof of Payment</h3>
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <img src={selectedBooking.paymentProofUrl} alt="Payment Proof" className="w-full h-auto max-h-64 object-contain" />
                  </div>
                </div>
              )}

              {/* Status Controls */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        onUpdateStatus(selectedBooking.id, status as any);
                        setSelectedBooking({ ...selectedBooking, status: status as any });
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-bold border transition-colors",
                        (selectedBooking.status as string) === status
                          ? getStatusColor(status) + " border-transparent"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Update Form */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Add Progress Update</h3>
                <form onSubmit={handleAddUpdate} className="space-y-4">
                  <div>
                    <textarea
                      value={updateMessage}
                      onChange={(e) => setUpdateMessage(e.target.value)}
                      placeholder="Enter update message (e.g., 'Washing completed, starting interior detailing...')"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none h-24 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium hover:text-orange-600 transition-colors w-max">
                      <ImageIcon className="w-5 h-5" />
                      <span>{updateImage ? 'Change Image' : 'Attach Image (Optional)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                      />
                    </label>
                    {updateImage && (
                      <div className="mt-3 relative inline-block">
                        <img src={updateImage} alt="Preview" className="h-32 rounded-lg border border-gray-200 object-cover" />
                        <button
                          type="button"
                          onClick={() => { setUpdateImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!updateMessage.trim()}
                    className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Post Update
                  </button>
                </form>
              </div>

              {/* Update History */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Update History</h3>
                {selectedBooking.updates && selectedBooking.updates.length > 0 ? (
                  <div className="space-y-4">
                    {selectedBooking.updates.slice().reverse().map((update) => (
                      <div key={update.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-slate-900 font-medium">{update.message}</p>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                            {format(new Date(update.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        {update.imageUrl && (
                          <img src={update.imageUrl} alt="Update" className="mt-3 rounded-lg max-h-48 object-cover border border-gray-100" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-4">No updates posted yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}