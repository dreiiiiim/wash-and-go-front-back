import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { Search, Calendar, Clock, Car, Bike, User, AlertCircle, MessageSquare, CheckCircle2, XCircle, Loader2, RefreshCw, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { api } from '../lib/api';
import { AppUser } from '../App';
import { cn } from '../lib/utils';

interface CheckStatusProps {
  user?: AppUser | null;
  userBookings?: Booking[];
  loading?: boolean;
  onRefresh?: () => void;
}

type Tab = 'present' | 'past';

const STATUS_PRESENT = new Set(['PENDING', 'CONFIRMED', 'IN_PROGRESS']);
const STATUS_PAST    = new Set(['COMPLETED', 'CANCELLED']);
const normalizeStatus = (status: string) => status.toUpperCase().replace(/[\s-]/g, '_');

function accentColor(status: string): string {
  const s = status.toUpperCase().replace(' ', '_');
  if (s === 'COMPLETED') return '#16a34a';
  if (s === 'CANCELLED') return '#dc2626';
  if (s === 'CONFIRMED') return '#2563eb';
  if (s === 'IN_PROGRESS') return '#ea580c';
  return '#ca8a04';
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  PENDING:     { label: 'Pending',     color: '#92400e', bg: '#fef3c7', border: '#fde68a', icon: <Clock className="w-3.5 h-3.5" /> },
  CONFIRMED:   { label: 'Confirmed',   color: '#1e40af', bg: '#dbeafe', border: '#bfdbfe', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  IN_PROGRESS: { label: 'In Progress', color: '#9a3412', bg: '#ffedd5', border: '#fed7aa', icon: <Loader2 className="w-3.5 h-3.5" /> },
  COMPLETED:   { label: 'Completed',   color: '#14532d', bg: '#dcfce7', border: '#bbf7d0', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  CANCELLED:   { label: 'Cancelled',   color: '#7f1d1d', bg: '#fee2e2', border: '#fecaca', icon: <XCircle className="w-3.5 h-3.5" /> },
};

function getStatusCfg(status: string) {
  const key = status.toUpperCase().replace(/[\s-]/g, '_');
  return statusConfig[key] ?? { label: status, color: '#374151', bg: '#f3f4f6', border: '#e5e7eb', icon: <Clock className="w-3.5 h-3.5" /> };
}

/* ── Booking Card (same as UserProfile) ── */
interface BookingCardProps { booking: Booking }
const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const isMotorcycle = booking.vehicleCategory === 'Motorcycle' || booking.vehicleType === 'MOTORCYCLE';
  const cfg = getStatusCfg(booking.status as string);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: accentColor(booking.status as string) }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="font-lovelo text-[10px] font-black tracking-[0.15em] text-gray-400 mb-1">#{booking.id}</p>
            <h3 className="font-lovelo font-black text-sm leading-tight truncate" style={{ color: '#383838' }}>
              {booking.serviceName}
            </h3>
          </div>
          <span
            className="font-lovelo flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border"
            style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
          >
            {cfg.icon}
            {cfg.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
          <div className="flex items-center gap-1.5 text-gray-500">
            <CalendarDays className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <span className="font-lovelo" style={{ fontWeight: 300 }}>
              {format(parseISO(booking.date), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <span className="font-lovelo" style={{ fontWeight: 300 }}>{booking.time ?? booking.timeSlot}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 col-span-2">
            {isMotorcycle
              ? <Bike className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
              : <Car  className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
            <span className="font-lovelo" style={{ fontWeight: 300 }}>
              {booking.vehicleCategory ?? (isMotorcycle ? 'Motorcycle' : 'Car')} — Size {booking.vehicleSize}
            </span>
          </div>
        </div>

        {booking.plateNumber && (
          <div className="mb-3">
            <span className="font-lovelo text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg text-white" style={{ backgroundColor: '#383838' }}>
              {booking.plateNumber}
            </span>
          </div>
        )}

        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <div>
            <p className="font-lovelo text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 300 }}>Down Payment</p>
            <p className="font-lovelo font-black text-base" style={{ color: '#ee4923' }}>
              ₱{(booking.downPayment ?? booking.downPaymentAmount).toLocaleString()}
            </p>
          </div>
          {booking.totalPrice > 0 && (
            <div className="text-right">
              <p className="font-lovelo text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 300 }}>Total</p>
              <p className="font-lovelo font-black text-sm" style={{ color: '#383838' }}>
                ₱{booking.totalPrice.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {booking.paymentMethod && (
          <div className="mt-2">
            <span className="font-lovelo text-[10px] font-black px-2.5 py-1 rounded-lg text-gray-500" style={{ backgroundColor: '#f3f4f6' }}>
              {booking.paymentMethod}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CheckStatus({ user, userBookings = [], loading, onRefresh }: CheckStatusProps) {
  const [searchId, setSearchId]       = useState('');
  const [result, setResult]           = useState<Booking | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching]     = useState(false);
  const [activeTab, setActiveTab]     = useState<Tab>('present');

  const presentBookings = userBookings.filter(b => STATUS_PRESENT.has(normalizeStatus(b.status as string)));
  const pastBookings    = userBookings.filter(b => STATUS_PAST.has(normalizeStatus(b.status as string)));
  const displayed       = activeTab === 'present' ? presentBookings : pastBookings;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearching(true);
    try {
      const booking = await api.getBookingById(searchId.trim());
      setResult(booking);
    } catch {
      setResult(null);
    } finally {
      setHasSearched(true);
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden py-14 px-4" style={{ background: 'linear-gradient(135deg, #383838 0%, #1a1a1a 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ee4923 0, #ee4923 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-xl mx-auto text-center">
          <p className="font-lovelo text-xs font-black tracking-[0.35em] uppercase mb-3" style={{ color: '#ee4923' }}>
            Wash &amp; Go Auto Salon
          </p>
          <h1 className="font-lovelo text-4xl font-black text-white mb-3 tracking-tight">Track Your Booking</h1>
          <p className="font-lovelo text-gray-400 text-sm" style={{ fontWeight: 300 }}>
            Enter your Reference ID to check the status of your appointment.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10 space-y-6">

        {/* ── Search card ── */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="e.g. BK-170752"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                className="font-lovelo w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm font-black tracking-wider uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal outline-none transition-all"
                style={{ color: '#383838' }}
                onFocus={e => e.currentTarget.style.borderColor = '#ee4923'}
                onBlur={e => e.currentTarget.style.borderColor = '#f3f4f6'}
              />
            </div>
            <button
              type="submit"
              disabled={searching || !searchId.trim()}
              className="font-lovelo w-full font-black text-sm tracking-widest uppercase text-white py-4 rounded-2xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: searching || !searchId.trim() ? '#9ca3af' : 'linear-gradient(135deg, #ee4923 0%, #F4921F 100%)', boxShadow: !searching && searchId.trim() ? '0 6px 20px rgba(238,73,35,0.3)' : 'none' }}
            >
              {searching ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching…</> : 'Check Status'}
            </button>
          </form>
        </div>

        {/* ── Not found ── */}
        {hasSearched && !result && (
          <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl p-5 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-lovelo font-black text-sm text-red-700">Booking Not Found</p>
              <p className="font-lovelo text-red-500 text-xs mt-0.5" style={{ fontWeight: 300 }}>Please check the Reference ID and try again.</p>
            </div>
          </div>
        )}

        {/* ── Result card ── */}
        {result && (() => {
          const cfg = getStatusCfg(result.status as string);
          return (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
              <div className="h-1.5 w-full" style={{ backgroundColor: cfg.color }} />
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4" style={{ backgroundColor: '#fafafa' }}>
                <div>
                  <p className="font-lovelo text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-1">Reference ID</p>
                  <p className="font-lovelo font-black text-xl tracking-wide" style={{ color: '#383838' }}>{result.id}</p>
                </div>
                <span
                  className="font-lovelo flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black border"
                  style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>
              </div>
              <div className="p-6 space-y-5">
                {[
                  {
                    bg: '#fff5f0', icon: <Car className="w-4 h-4" style={{ color: '#ee4923' }} />,
                    label: 'Service',
                    main: result.serviceName,
                    sub: [result.vehicleSize, result.fuelType].filter(Boolean).join(' · '),
                  },
                  {
                    bg: '#eff6ff', icon: <Calendar className="w-4 h-4 text-blue-500" />,
                    label: 'Schedule',
                    main: result.date,
                    sub: result.timeSlot,
                  },
                  {
                    bg: '#f0fdf4', icon: <User className="w-4 h-4 text-green-600" />,
                    label: 'Customer',
                    main: result.customerName,
                    sub: result.customerPhone,
                  },
                ].map(({ bg, icon, label, main, sub }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                      {icon}
                    </div>
                    <div>
                      <p className="font-lovelo text-[10px] font-black tracking-[0.15em] text-gray-400 uppercase mb-0.5">{label}</p>
                      <p className="font-lovelo font-black text-sm" style={{ color: '#383838' }}>{main}</p>
                      {sub && <p className="font-lovelo text-gray-400 text-xs mt-0.5" style={{ fontWeight: 300 }}>{sub}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {result.updates && result.updates.length > 0 && (
                <div className="border-t border-gray-100 p-6">
                  <h3 className="font-lovelo font-black text-sm tracking-wide mb-5 flex items-center gap-2" style={{ color: '#383838' }}>
                    <MessageSquare className="w-4 h-4" style={{ color: '#ee4923' }} />
                    Progress Updates
                  </h3>
                  <div className="space-y-4 relative">
                    <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-100" />
                    {result.updates.map((update) => (
                      <div key={update.id} className="pl-9 relative">
                        <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: '#ee4923' }} />
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                          <p className="font-lovelo text-[10px] font-black tracking-wider text-gray-400 mb-1.5">
                            {format(new Date(update.timestamp), 'MMM d, h:mm a')}
                          </p>
                          <p className="font-lovelo text-sm" style={{ color: '#383838', fontWeight: 300 }}>{update.message}</p>
                          {update.imageUrl && (
                            <img src={update.imageUrl} alt="Update" className="mt-3 rounded-xl w-full max-h-56 object-cover border border-gray-200" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-6 py-3 border-t border-gray-100" style={{ backgroundColor: '#fafafa' }}>
                <p className="font-lovelo text-[10px] text-gray-400 text-center" style={{ fontWeight: 300 }}>
                  Booked on {new Date(result.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── My Bookings section (only when logged in) ── */}
      {user && (
        <div className="max-w-3xl mx-auto px-4 pb-12">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-lovelo text-[10px] font-black tracking-[0.25em] uppercase mb-1" style={{ color: '#ee4923' }}>My Account</p>
              <h2 className="font-lovelo font-black text-xl" style={{ color: '#383838' }}>My Bookings</h2>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-2 font-lovelo text-xs font-black tracking-wider text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40 border border-gray-200 rounded-xl px-3 py-2 hover:border-gray-300 bg-white"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
                <span>Refresh</span>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm">
            {(['present', 'past'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-lovelo font-black text-xs tracking-wider uppercase transition-all duration-200',
                  activeTab === tab ? 'text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                )}
                style={activeTab === tab ? { background: 'linear-gradient(135deg, #ee4923, #F4921F)' } : {}}
              >
                {tab === 'present' ? `Active (${presentBookings.length})` : `Past (${pastBookings.length})`}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: '#ee4923' }} />
              <p className="font-lovelo text-sm font-black text-gray-400">Loading your bookings…</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                <CalendarDays className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-lovelo font-black text-base mb-1" style={{ color: '#383838' }}>
                {activeTab === 'present' ? 'No Active Bookings' : 'No Past Bookings'}
              </p>
              <p className="font-lovelo text-gray-400 text-xs max-w-xs mx-auto" style={{ fontWeight: 300 }}>
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
      )}
    </div>
  );
}
