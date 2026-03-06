import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import BookingWizard from './components/BookingWizard';
import AdminDashboard from './components/AdminDashboard';
import ServicesAndRates from './components/ServicesAndRates';
import CheckStatus from './components/CheckStatus';
import AuthPage from './components/AuthPage';
import { Booking, BookingStatus } from './types';
import { supabase } from './lib/supabase';
import { api } from './lib/api';

export type AppUser = {
  name: string;
  email: string;
  isStaff: boolean;
};

export type ViewType = 'HOME' | 'CLIENT' | 'ADMIN' | 'SERVICES' | 'STATUS' | 'AUTH';

export default function App() {
  const [view, setView] = useState<ViewType>('HOME');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Listen to Supabase auth state (handles Google OAuth redirect)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleSession(session);
      } else {
        setUser(null);
        setToken(null);
        setBookings([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: any) => {
    const supabaseUser = session.user;
    const accessToken = session.access_token;
    setToken(accessToken);

    // Fetch profile to get role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', supabaseUser.id)
      .single();

    const isStaff = profile?.role === 'admin';
    const appUser: AppUser = {
      name: profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email,
      email: supabaseUser.email,
      isStaff,
    };

    setUser(appUser);

    // If admin, fetch all bookings
    if (isStaff) {
      try {
        const data = await api.getAllBookings(accessToken);
        setBookings(data);
      } catch { /* ignore — will show empty */ }
    }
  };

  const handleNewBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
    alert('Booking Submitted Successfully! Please wait for confirmation.');
    setView('HOME');
  };

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    if (!token) return;
    try {
      await api.updateStatus(id, status, token);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleAddUpdate = (id: string, message: string, imageUrl?: string) => {
    const newUpdate = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      message,
      imageUrl,
    };
    setBookings(prev => prev.map(b =>
      b.id === id ? { ...b, updates: [...(b.updates || []), newUpdate] } : b
    ));
  };

  const handleAuthSuccess = (loggedInUser: AppUser) => {
    setUser(loggedInUser);
    setView(loggedInUser.isStaff ? 'ADMIN' : 'CLIENT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    setBookings([]);
    setView('HOME');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewChange = (newView: ViewType) => {
    if (newView === 'CLIENT' && !user) {
      setView('AUTH');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar currentView={view} onViewChange={handleViewChange} user={user} onLogout={handleLogout} />

      <main className={`flex-grow ${view !== 'HOME' ? 'container mx-auto px-4 py-8' : ''}`}>
        {view === 'HOME' && <HomePage onViewChange={handleViewChange} />}
        {view === 'AUTH' && <AuthPage onAuthSuccess={handleAuthSuccess} />}
        {view === 'CLIENT' && <BookingWizard onSubmit={handleNewBooking} token={token} />}
        {view === 'SERVICES' && <ServicesAndRates onBookNow={() => handleViewChange('CLIENT')} />}
        {view === 'STATUS' && <CheckStatus />}
        {view === 'ADMIN' && (
          <AdminDashboard
            bookings={bookings}
            onUpdateStatus={handleUpdateStatus}
            onAddUpdate={handleAddUpdate}
          />
        )}
      </main>

      <footer className="text-white py-6 text-center text-sm" style={{ backgroundColor: '#383838' }}>
        <p>&copy; {new Date().getFullYear()} Wash &amp; Go Baliwag Branch. All rights reserved.</p>
      </footer>
    </div>
  );
}
