import React, { useState } from 'react';
import { CarFront, LayoutDashboard, LogIn, LogOut, UserCircle2, Menu, X } from 'lucide-react';
import logo from '../assets/wash and go logo.png';
import type { ViewType, AppUser } from '../App';

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  user: AppUser | null;
  onLogout: () => void;
}

export default function Navbar({ currentView, onViewChange, user, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onViewChange('HOME')}
        >
          <img 
            src={logo} 
            alt="Wash & Go Logo" 
            className="w-14 h-14 object-contain rounded-lg shadow-sm border border-gray-100"
          />
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight" style={{ color: '#383838' }}>Wash & Go Auto Salon</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">Baliwag Branch</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => handleNavClick('HOME')}
            className={`text-sm font-semibold transition-colors ${currentView === 'HOME' ? '' : 'text-gray-600 hover:text-gray-900'}`}
            style={currentView === 'HOME' ? { color: '#ee4923' } : {}}
          >
            HOME
          </button>
          <button 
            onClick={() => handleNavClick('CLIENT')}
            className={`text-sm font-semibold transition-colors ${currentView === 'CLIENT' ? '' : 'text-gray-600 hover:text-gray-900'}`}
            style={currentView === 'CLIENT' ? { color: '#ee4923' } : {}}
          >
            BOOK NOW
          </button>
          <button 
             onClick={() => handleNavClick('SERVICES')}
             className={`text-sm font-semibold transition-colors ${currentView === 'SERVICES' ? '' : 'text-gray-600 hover:text-gray-900'}`}
             style={currentView === 'SERVICES' ? { color: '#ee4923' } : {}}
          >
            SERVICES & RATES
          </button>
          <button 
             onClick={() => handleNavClick('STATUS')}
             className={`text-sm font-semibold transition-colors ${currentView === 'STATUS' ? '' : 'text-gray-600 hover:text-gray-900'}`}
             style={currentView === 'STATUS' ? { color: '#ee4923' } : {}}
          >
            CHECK STATUS
          </button>
          
          {!user ? (
            <button
              onClick={() => handleNavClick('AUTH')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                currentView === 'AUTH'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={currentView === 'AUTH' ? { backgroundColor: '#ee4923' } : {}}
            >
              <LogIn size={16} />
              LOGIN / SIGN UP
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {user.isStaff && (
                <button
                  onClick={() => handleNavClick('ADMIN')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    currentView === 'ADMIN'
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={currentView === 'ADMIN' ? { backgroundColor: '#383838' } : {}}
                >
                  <LayoutDashboard size={16} />
                  ADMIN PANEL
                </button>
              )}
              {!user.isStaff && (
                <button
                  onClick={() => handleNavClick('PROFILE')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                    currentView === 'PROFILE'
                      ? ''
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={currentView === 'PROFILE' ? { backgroundColor: '#fff5f2', color: 'var(--brand-orange)' } : {}}
                  title="My Profile"
                >
                  <UserCircle2 size={18} style={currentView === 'PROFILE' ? { color: 'var(--brand-orange)' } : { color: '#9ca3af' }} />
                  <span>{user.name}</span>
                </button>
              )}
              {user.isStaff && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <UserCircle2 size={18} className="text-gray-400" />
                  <span>{user.name}</span>
                </div>
              )}
              <button
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                title="Logout"
              >
                <LogOut size={16} />
                <span>LOGOUT</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-1 shadow-md">
          {(['HOME', 'CLIENT', 'SERVICES', 'STATUS'] as const).map((v, i) => {
            const labels = ['HOME', 'BOOK NOW', 'SERVICES & RATES', 'CHECK STATUS'];
            const views: ViewType[] = ['HOME', 'CLIENT', 'SERVICES', 'STATUS'];
            const isActive = currentView === views[i];
            return (
              <button
                key={v}
                onClick={() => handleNavClick(views[i])}
                className="block w-full text-left px-3 py-3 rounded-lg text-base font-semibold transition-colors"
                style={isActive
                  ? { backgroundColor: '#fff5f2', color: 'var(--brand-orange)' }
                  : { color: '#374151' }
                }
              >
                {labels[i]}
              </button>
            );
          })}

          <div className="border-t border-gray-100 my-2 pt-2">
            {!user ? (
              <button
                onClick={() => handleNavClick('AUTH')}
                className="flex items-center gap-2 w-full px-3 py-3 rounded-lg text-base font-bold text-white transition-colors"
                style={{ backgroundColor: currentView === 'AUTH' ? 'var(--brand-orange)' : 'var(--brand-dark)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--brand-orange)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = currentView === 'AUTH' ? 'var(--brand-orange)' : 'var(--brand-dark)'; }}
              >
                <LogIn size={18} />
                LOGIN / SIGN UP
              </button>
            ) : (
              <div className="space-y-2">
                {user.isStaff && (
                  <button
                    onClick={() => handleNavClick('ADMIN')}
                    className="flex items-center gap-2 w-full px-3 py-3 rounded-lg text-base font-bold text-white transition-colors"
                    style={{ backgroundColor: 'var(--brand-dark)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--brand-orange)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--brand-dark)'; }}
                  >
                    <LayoutDashboard size={18} />
                    ADMIN PANEL
                  </button>
                )}
                {!user.isStaff && (
                  <button
                    onClick={() => handleNavClick('PROFILE')}
                    className="flex items-center gap-2 w-full px-3 py-3 rounded-lg text-base font-semibold"
                    style={{ backgroundColor: '#fff5f2', color: 'var(--brand-orange)' }}
                  >
                    <UserCircle2 size={20} />
                    <span>My Profile ({user.name})</span>
                  </button>
                )}
                {user.isStaff && (
                  <div className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold text-gray-600">
                    <UserCircle2 size={18} />
                    <span>{user.name}</span>
                  </div>
                )}
                <button
                  onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-3 rounded-lg text-base font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={18} />
                  <span>LOGOUT</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}