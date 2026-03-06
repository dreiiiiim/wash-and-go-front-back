import React, { useState } from 'react';
import { CarFront, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react';
import bgImage from '../assets/washngobg.jpg';
import type { AppUser } from '../App';
import { supabase } from '../lib/supabase';

type AuthMode = 'login' | 'signup';

interface AuthPageProps {
  onAuthSuccess: (user: AppUser) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', data.user.id)
          .single();

        onAuthSuccess({
          name: profile?.full_name || data.user.email || '',
          email: data.user.email || '',
          isStaff: profile?.role === 'admin',
        });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;

        onAuthSuccess({
          name,
          email: data.user?.email || '',
          isStaff: false,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    // onAuthStateChange in App.tsx handles the rest after redirect
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setName(''); setPhone(''); setEmail(''); setPassword(''); setError('');
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-orange-600 text-white p-2.5 rounded-xl"><CarFront size={28} /></div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">WASH & GO</h1>
            <p className="text-xs text-orange-400 font-semibold tracking-widest">BALIWAG BRANCH</p>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl font-black italic text-white uppercase leading-tight mb-4">
            YOUR CAR,<br /><span className="text-orange-500">PREMIUM</span><br />CARE.
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
            Book auto detailing, lube services, and ceramic coating — all online. Fast, easy, and hassle-free.
          </p>
        </div>
        <p className="relative z-10 text-xs text-gray-500">&copy; {new Date().getFullYear()} Wash & Go Baliwag Branch</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gray-50">
        <div className="lg:hidden bg-white border-b border-gray-100 shadow-sm px-4 h-16 flex items-center gap-2">
          <div className="bg-orange-600 text-white p-2 rounded-lg"><CarFront size={22} /></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">WASH & GO</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">BALIWAG BRANCH</p>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-3xl font-black italic text-gray-900 uppercase">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                {mode === 'login' ? 'Sign in to book your next appointment.' : 'Register to start booking services.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Google OAuth */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.7-3.1-11.3-7.7l-6.5 5C9.6 39.5 16.3 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C37 39 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </button>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">or with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4 text-sm font-medium">
                  <AlertCircle size={16} />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input type="text" required value={name} onChange={e => setName(e.target.value)}
                          placeholder="Juan Dela Cruz"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="0917 123 4567"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="juan@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} required value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gray-900 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg font-bold transition-colors mt-2">
                  {loading ? 'Please wait...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button type="button" onClick={toggleMode} className="font-bold text-orange-600 hover:text-orange-700">
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              Staff or owner? Your account is managed by the system admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
