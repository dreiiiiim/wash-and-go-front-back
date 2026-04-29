import React, { useEffect, useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { Calendar, Clock, Car, Bike, User, MessageSquare, CheckCircle2, XCircle, Loader2, RefreshCw, CalendarDays, X, ChevronRight, ImageIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { AppUser } from '../App';
import { cn } from '../lib/utils';
import { isActiveBooking, isPastBooking } from '../lib/bookingStatus';

interface CheckStatusProps {
  user?: AppUser | null;
  userBookings?: Booking[];
  loading?: boolean;
  loadError?: string | null;
  onRefresh?: () => void;
}

type Tab = 'present' | 'past';

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

/* ── Booking Detail Modal ── */
interface BookingDetailModalProps { booking: Booking; onClose: () => void }
const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, onClose }) => {
  const cfg = getStatusCfg(booking.status as string);
  const isMotorcycle = booking.vehicleCategory === 'Motorcycle' || booking.vehicleType === 'MOTORCYCLE';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400 mb-0.5">Booking Details</p>
            <h2 className="font-lovelo font-black text-base" style={{ color: '#383838' }}>#{booking.id}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="font-lovelo flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border"
              style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
            >
              {cfg.icon}{cfg.label}
            </span>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-gray-100 hover:border-red-200 hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Service',  value: booking.serviceName },
              { label: 'Date',     value: format(parseISO(booking.date), 'MMM d, yyyy') },
              { label: 'Time',     value: booking.time ?? booking.timeSlot },
              { label: 'Vehicle',  value: `${booking.vehicleCategory ?? (isMotorcycle ? 'Motorcycle' : 'Car')} — ${booking.vehicleSize}` },
              { label: 'Customer', value: booking.customerName },
              { label: 'Phone',    value: booking.customerPhone },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-2xl p-3">
                <p className="font-lovelo text-[9px] font-black tracking-[0.15em] text-gray-400 uppercase mb-1">{label}</p>
                <p className="font-lovelo font-black text-sm" style={{ color: '#383838' }}>{value}</p>
              </div>
            ))}
          </div>

          {booking.plateNumber && (
            <div>
              <span className="font-lovelo text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: '#383838' }}>
                {booking.plateNumber}
              </span>
            </div>
          )}

          {/* Payment */}
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
            <div>
              <p className="font-lovelo text-[9px] text-gray-400 font-black tracking-widest uppercase mb-0.5">Down Payment</p>
              <p className="font-lovelo font-black text-xl" style={{ color: '#ee4923' }}>
                ₱{(booking.downPayment ?? booking.downPaymentAmount).toLocaleString()}
              </p>
            </div>
            {booking.totalPrice > 0 && (
              <div className="text-right">
                <p className="font-lovelo text-[9px] text-gray-400 font-black tracking-widest uppercase mb-0.5">Total</p>
                <p className="font-lovelo font-black text-base" style={{ color: '#383838' }}>
                  ₱{booking.totalPrice.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Progress Updates */}
          {booking.updates && booking.updates.length > 0 && (
            <div>
              <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400 mb-3 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" style={{ color: '#ee4923' }} />
                Progress Updates
              </p>
              <div className="space-y-3 relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-100" />
                {booking.updates.map(update => {
                  const imgs = update.imageUrls?.length ? update.imageUrls : (update.imageUrl ? [update.imageUrl] : []);
                  return (
                    <div key={update.id} className="pl-9 relative">
                      <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: '#ee4923' }} />
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="font-lovelo text-[10px] font-black tracking-wider text-gray-400 mb-1.5">
                          {format(new Date(update.timestamp), 'MMM d, h:mm a')}
                        </p>
                        <p className="font-lovelo text-sm" style={{ color: '#383838', fontWeight: 300 }}>{update.message}</p>
                        {imgs.length > 0 && (
                          <div className={cn('mt-3 grid gap-1.5', imgs.length === 1 ? 'grid-cols-1' : imgs.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                            {imgs.map((url, i) => (
                              <img key={i} src={url} alt={`Update photo ${i + 1}`}
                                className="rounded-xl w-full object-cover border border-gray-200"
                                style={{ maxHeight: imgs.length === 1 ? '200px' : '120px' }} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(!booking.updates || booking.updates.length === 0) && (
            <div className="text-center py-6 rounded-2xl border-2 border-dashed border-gray-100">
              <MessageSquare className="w-7 h-7 mx-auto mb-2 text-gray-200" />
              <p className="font-lovelo text-xs text-gray-300" style={{ fontWeight: 300 }}>No progress updates yet.</p>
            </div>
          )}

          <p className="font-lovelo text-[10px] text-gray-400 text-center" style={{ fontWeight: 300 }}>
            Booked on {new Date(booking.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Booking Card ── */
interface BookingCardProps { booking: Booking; onView: (b: Booking) => void }
const BookingCard: React.FC<BookingCardProps> = ({ booking, onView }) => {
  const isMotorcycle = booking.vehicleCategory === 'Motorcycle' || booking.vehicleType === 'MOTORCYCLE';
  const cfg = getStatusCfg(booking.status as string);
  const updateCount = booking.updates?.length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => onView(booking)}>
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

        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <div>
            <p className="font-lovelo text-[10px] text-gray-400 mb-0.5" style={{ fontWeight: 300 }}>Down Payment</p>
            <p className="font-lovelo font-black text-base" style={{ color: '#ee4923' }}>
              ₱{(booking.downPayment ?? booking.downPaymentAmount).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {updateCount > 0 && (
              <span className="font-lovelo flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(238,73,35,0.08)', color: '#ee4923' }}>
                <ImageIcon className="w-3 h-3" />
                {updateCount}
              </span>
            )}
            <span className="font-lovelo flex items-center gap-1 text-[10px] font-black text-gray-400">
              View <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CheckStatus({ user, userBookings = [], loading, loadError, onRefresh }: CheckStatusProps) {
  const [activeTab, setActiveTab] = useState<Tab>('present');
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!detailBooking) return;
    const updatedBooking = userBookings.find(booking => booking.id === detailBooking.id);
    if (updatedBooking && updatedBooking !== detailBooking) {
      setDetailBooking(updatedBooking);
    }
  }, [userBookings, detailBooking]);

  const presentBookings = userBookings.filter(isActiveBooking);
  const pastBookings    = userBookings.filter(isPastBooking);
  const displayed       = activeTab === 'present' ? presentBookings : pastBookings;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden py-14 px-4" style={{ background: 'linear-gradient(135deg, #383838 0%, #1a1a1a 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ee4923 0, #ee4923 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-xl mx-auto text-center">
          <p className="font-lovelo text-xs font-black tracking-[0.35em] uppercase mb-3" style={{ color: '#ee4923' }}>
            Wash &amp; Go Auto Salon
          </p>
          <h1 className="font-lovelo text-4xl font-black text-white mb-3 tracking-tight">My Bookings</h1>
          <p className="font-lovelo text-gray-400 text-sm" style={{ fontWeight: 300 }}>
            Track and manage your auto care appointments.
          </p>
        </div>
      </div>

      {/* ── My Bookings section ── */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {loadError && (
              <p className="font-lovelo text-red-500 text-xs mt-1" style={{ fontWeight: 300 }}>
                {loadError}
              </p>
            )}
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
              .map(b => <BookingCard key={b.id} booking={b} onView={setDetailBooking} />)
            }
          </div>
        )}
      </div>

      {/* ── Booking Detail Modal ── */}
      {detailBooking && (
        <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
      )}
    </div>
  );
}
