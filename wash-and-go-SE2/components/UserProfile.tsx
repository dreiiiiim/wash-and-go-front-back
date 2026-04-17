import React from 'react';
import { AppUser } from '../App';
import { Booking } from '../types';
import { RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { isActiveBooking, isPastBooking } from '../lib/bookingStatus';

interface UserProfileProps {
  user: AppUser;
  userBookings: Booking[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function UserProfile({ user, userBookings, loading, onRefresh }: UserProfileProps) {
  const presentBookings = userBookings.filter(isActiveBooking);
  const pastBookings    = userBookings.filter(isPastBooking);
  const initial         = user.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>

      {/* ── Profile Banner ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #383838 0%, #1a1a1a 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ee4923 0, #ee4923 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-3xl mx-auto px-4 py-10">
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-lovelo font-black text-2xl flex-shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #ee4923, #F4921F)' }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-lovelo text-[10px] font-black tracking-[0.25em] uppercase mb-1" style={{ color: '#ee4923' }}>
                My Account
              </p>
              <h1 className="font-lovelo font-black text-xl text-white truncate">{user.name}</h1>
              <p className="font-lovelo text-gray-400 text-xs truncate mt-0.5" style={{ fontWeight: 300 }}>{user.email}</p>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-2 font-lovelo text-xs font-black tracking-wider text-gray-400 hover:text-white transition-colors disabled:opacity-40 border border-white/10 rounded-xl px-3 py-2 hover:border-white/20"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              { label: 'Active Bookings', value: presentBookings.length, accent: true },
              { label: 'Past Bookings',   value: pastBookings.length,    accent: false },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="font-lovelo font-black text-2xl mb-1" style={{ color: accent ? '#ee4923' : '#ffffff' }}>
                  {value}
                </p>
                <p className="font-lovelo text-xs text-gray-400" style={{ fontWeight: 300 }}>{label}</p>
              </div>
            ))}
          </div>

          <p className="font-lovelo text-gray-500 text-xs mt-6 text-center" style={{ fontWeight: 300 }}>
            To view your bookings, go to <span style={{ color: '#ee4923' }}>Check Status</span> in the navigation.
          </p>
        </div>
      </div>
    </div>
  );
}
