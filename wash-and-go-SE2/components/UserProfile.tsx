import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Booking } from '../types';
import { AppUser } from '../App';
import { UserCircle2, CalendarDays, Car, Bike, Clock, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface UserProfileProps {
  user: AppUser;
  userBookings: Booking[];
  loading?: boolean;
  onRefresh?: () => void;
}

type Tab = 'present' | 'past';

const STATUS_PRESENT = new Set(['Pending', 'Confirmed', 'In Progress', 'PENDING', 'CONFIRMED']);
const STATUS_PAST    = new Set(['Completed', 'Cancelled', 'COMPLETED', 'CANCELLED']);

function statusColor(status: string) {
  switch (status) {
    case 'Pending':   case 'PENDING':    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Confirmed': case 'CONFIRMED':  return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'In Progress':                  return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Completed': case 'COMPLETED':  return 'bg-green-100 text-green-700 border-green-200';
    case 'Cancelled': case 'CANCELLED':  return 'bg-red-100 text-red-700 border-red-200';
    default:                             return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function statusIcon(status: string) {
  if (['Completed', 'COMPLETED'].includes(status))
    return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (['Cancelled', 'CANCELLED'].includes(status))
    return <XCircle className="w-3.5 h-3.5" />;
  return <Clock className="w-3.5 h-3.5" />;
}

interface BookingCardProps { booking: Booking }
const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const isMotorcycle = booking.vehicleCategory === 'Motorcycle' || booking.vehicleType === 'MOTORCYCLE';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top accent bar by status */}
      <div
        className="h-1 w-full"
        style={{
          background: ['Completed','COMPLETED'].includes(booking.status as string)
            ? '#16a34a'
            : ['Cancelled','CANCELLED'].includes(booking.status as string)
              ? '#dc2626'
              : ['Confirmed','CONFIRMED'].includes(booking.status as string)
                ? '#2563eb'
                : (booking.status as string) === 'In Progress'
                  ? '#ea580c'
                  : '#ca8a04',
        }}
      />
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-mono text-xs text-gray-400 mb-0.5">#{booking.id}</p>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{booking.serviceName}</h3>
          </div>
          <span className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap',
            statusColor(booking.status as string)
          )}>
            {statusIcon(booking.status as string)}
            {booking.status}
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{format(parseISO(booking.date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{booking.time ?? booking.timeSlot}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            {isMotorcycle
              ? <Bike className="w-4 h-4 text-gray-400 flex-shrink-0" />
              : <Car  className="w-4 h-4 text-gray-400 flex-shrink-0" />
            }
            <span>{booking.vehicleCategory ?? (isMotorcycle ? 'Motorcycle' : 'Car')} — Size {booking.vehicleSize}</span>
          </div>
          {booking.plateNumber && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="bg-gray-800 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest">
                {booking.plateNumber}
              </span>
            </div>
          )}
        </div>

        {/* Price row */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Down Payment</span>
          <span className="font-bold text-gray-900">
            ₱{(booking.downPayment ?? booking.downPaymentAmount).toLocaleString()}
          </span>
        </div>
        {booking.totalPrice > 0 && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-400">Total Price</span>
            <span className="text-sm font-semibold text-gray-700">₱{booking.totalPrice.toLocaleString()}</span>
          </div>
        )}
        {booking.paymentMethod && (
          <div className="mt-2">
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">
              {booking.paymentMethod}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserProfile({ user, userBookings, loading, onRefresh }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<Tab>('present');

  const presentBookings = userBookings.filter(b => STATUS_PRESENT.has(b.status as string));
  const pastBookings    = userBookings.filter(b => STATUS_PAST.has(b.status as string));

  const displayed = activeTab === 'present' ? presentBookings : pastBookings;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#ee4923,#F4921F)' }}
        >
          {user.name?.charAt(0)?.toUpperCase() ?? <UserCircle2 className="w-8 h-8" />}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-gray-900 truncate">{user.name}</h1>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-orange-600 transition-colors disabled:opacity-50"
            title="Refresh bookings"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {(['present', 'past'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab === 'present'
              ? `My Bookings (${presentBookings.length})`
              : `Past Bookings (${pastBookings.length})`
            }
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm font-medium">Loading your bookings…</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-500">
            {activeTab === 'present' ? 'No active bookings' : 'No past bookings'}
          </p>
          <p className="text-sm mt-1">
            {activeTab === 'present'
              ? 'Your upcoming and in-progress bookings will appear here.'
              : 'Completed and cancelled bookings will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {displayed
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(b => <BookingCard key={b.id} booking={b} />)
          }
        </div>
      )}
    </div>
  );
}
