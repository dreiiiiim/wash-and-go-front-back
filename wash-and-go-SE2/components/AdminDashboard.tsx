import React, { useState, useMemo, useRef } from 'react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { Booking, ServicePackage } from '../types';
import {
  Filter, Calendar, Car, Bike, Wrench, Image as ImageIcon, Plus, X,
  DollarSign, Save, ChevronDown, ChevronUp, CheckCircle, ChevronLeft,
  ChevronRight, Clock, CheckCircle2, XCircle, Loader2, BarChart3,
  AlertCircle, TrendingUp, Users, Layers
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AdminDashboardProps {
  bookings: Booking[];
  services: ServicePackage[];
  token: string | null;
  onUpdateStatus: (id: string, status: any) => void;
  onAddUpdate: (id: string, message: string, imageUrl?: string) => void;
  onUpdateService: (id: string, dto: object) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusMeta: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  PENDING:     { label: 'Pending',     color: '#92400e', bg: '#fef3c7', border: '#fde68a', icon: <Clock        className="w-3 h-3" /> },
  CONFIRMED:   { label: 'Confirmed',   color: '#1e40af', bg: '#dbeafe', border: '#bfdbfe', icon: <CheckCircle2 className="w-3 h-3" /> },
  IN_PROGRESS: { label: 'In Progress', color: '#9a3412', bg: '#ffedd5', border: '#fed7aa', icon: <Loader2      className="w-3 h-3" /> },
  COMPLETED:   { label: 'Completed',   color: '#14532d', bg: '#dcfce7', border: '#bbf7d0', icon: <CheckCircle2 className="w-3 h-3" /> },
  CANCELLED:   { label: 'Cancelled',   color: '#7f1d1d', bg: '#fee2e2', border: '#fecaca', icon: <XCircle      className="w-3 h-3" /> },
};
function getStatusMeta(status: string) {
  const key = status.toUpperCase().replace(/[\s-]/g, '_');
  return statusMeta[key] ?? { label: status, color: '#374151', bg: '#f3f4f6', border: '#e5e7eb', icon: <Clock className="w-3 h-3" /> };
}

function StatusBadge({ status }: { status: string }) {
  const m = getStatusMeta(status);
  return (
    <span className="font-lovelo inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border"
      style={{ color: m.color, backgroundColor: m.bg, borderColor: m.border }}>
      {m.icon}{m.label}
    </span>
  );
}

// ─── Price Input ──────────────────────────────────────────────────────────────
interface PriceInputProps { label: string; value: number | undefined; onChange: (v: number) => void }
const PriceInput: React.FC<PriceInputProps> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-lovelo text-[9px] font-black tracking-[0.18em] text-gray-400 uppercase">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-lovelo text-xs text-gray-400">₱</span>
      <input type="number" min={0} value={value ?? ''}
        onChange={e => onChange(Number(e.target.value))}
        className="font-lovelo w-full pl-7 pr-3 py-2 border-2 border-gray-100 rounded-xl text-sm font-black text-gray-800 focus:border-orange-400 outline-none bg-gray-50 hover:bg-white transition-all"
      />
    </div>
  </div>
);

// ─── Service Editor Card ──────────────────────────────────────────────────────
interface ServiceEditorCardProps { service: ServicePackage; onSave: (id: string, dto: object) => Promise<void> }
const ServiceEditorCard: React.FC<ServiceEditorCardProps> = ({ service, onSave }) => {
  const [isOpen, setIsOpen]         = useState(false);
  const [name, setName]             = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [prices, setPrices]         = useState({ ...service.prices });
  const [lubePrices, setLubePrices] = useState<Record<string, number>>(service.lubePrices ?? {});
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

  const isDirty =
    name !== service.name ||
    description !== service.description ||
    JSON.stringify(prices) !== JSON.stringify(service.prices) ||
    JSON.stringify(lubePrices) !== JSON.stringify(service.lubePrices ?? {});

  const handleSave = async () => {
    setSaving(true);
    const dto: Record<string, any> = {
      name, description,
      price_small: prices.SMALL, price_medium: prices.MEDIUM,
      price_large: prices.LARGE, price_extra_large: prices.EXTRA_LARGE,
    };
    if (service.isLubeFlat && Object.keys(lubePrices).length > 0) dto.lube_prices = lubePrices;
    await onSave(service.id, dto);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const catAccent: Record<string, string> = {
    LUBE: '#F4921F', GROOMING: '#383838', COATING: '#ee4923',
  };
  const accent = catAccent[service.category] ?? '#6b7280';

  return (
    <div className={cn(
      'bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200',
      isOpen ? 'border-orange-300 shadow-lg' : 'border-gray-100 hover:border-orange-200 shadow-sm'
    )}>
      <button onClick={() => setIsOpen(v => !v)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
          <div>
            <p className="font-lovelo font-black text-sm text-gray-900">{name}</p>
            <p className="font-lovelo text-[10px] text-gray-400 mt-0.5" style={{ fontWeight: 300 }}>{service.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && !saved && (
            <span className="font-lovelo text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>Unsaved</span>
          )}
          {saved && (
            <span className="font-lovelo text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle className="w-3 h-3" /> Saved
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 p-5 space-y-5" style={{ backgroundColor: '#fafafa' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-lovelo text-[9px] font-black tracking-[0.18em] text-gray-400 uppercase mb-1.5 block">Service Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="font-lovelo w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm font-black text-gray-800 focus:border-orange-400 outline-none bg-white" />
            </div>
            <div>
              <label className="font-lovelo text-[9px] font-black tracking-[0.18em] text-gray-400 uppercase mb-1.5 block">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                className="font-lovelo w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm text-gray-600 focus:border-orange-400 outline-none bg-white" />
            </div>
          </div>

          {!service.isLubeFlat && (
            <div>
              <p className="font-lovelo text-[9px] font-black tracking-[0.18em] text-gray-400 uppercase mb-3">Prices by Vehicle Size</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <PriceInput label="Small"       value={prices.SMALL}       onChange={v => setPrices(p => ({ ...p, SMALL: v }))} />
                <PriceInput label="Medium"      value={prices.MEDIUM}      onChange={v => setPrices(p => ({ ...p, MEDIUM: v }))} />
                <PriceInput label="Large"       value={prices.LARGE}       onChange={v => setPrices(p => ({ ...p, LARGE: v }))} />
                <PriceInput label="Extra Large" value={prices.EXTRA_LARGE} onChange={v => setPrices(p => ({ ...p, EXTRA_LARGE: v }))} />
              </div>
            </div>
          )}

          {service.isLubeFlat && (
            <div>
              <p className="font-lovelo text-[9px] font-black tracking-[0.18em] text-gray-400 uppercase mb-3">Fuel-based Prices</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(lubePrices) as [string, number][]).map(([fuel, val]) => (
                  <PriceInput key={fuel} label={fuel} value={val} onChange={v => setLubePrices(p => ({ ...p, [fuel]: v }))} />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button onClick={handleSave} disabled={saving || !isDirty}
              className={cn(
                'font-lovelo flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all',
                saving        ? 'bg-gray-200 text-gray-400 cursor-wait' :
                !isDirty      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                'text-white shadow-md hover:opacity-90'
              )}
              style={!saving && isDirty ? { background: 'linear-gradient(135deg, #ee4923, #F4921F)' } : {}}>
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard({ bookings, services, token, onUpdateStatus, onAddUpdate, onUpdateService }: AdminDashboardProps) {
  const [activeTab, setActiveTab]     = useState<'bookings' | 'services'>('bookings');
  const [filterStatus, setFilterStatus] = useState<Booking['status'] | 'All'>('All');
  const [filterDate, setFilterDate]   = useState('');
  const [filterVehicle, setFilterVehicle] = useState<'All' | 'Car' | 'Motorcycle'>('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateImage, setUpdateImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);

  // Stats
  const totalBookings   = bookings.length;
  const pendingCount    = bookings.filter(b => { const s = (b.status as string).toUpperCase(); return s === 'PENDING'; }).length;
  const confirmedCount  = bookings.filter(b => { const s = (b.status as string).toUpperCase(); return s === 'CONFIRMED'; }).length;
  const todayCount      = bookings.filter(b => b.date === today).length;

  const filteredBookings = useMemo(() =>
    bookings.filter(b => {
      if (filterStatus !== 'All') {
        const bStatus = (b.status as string).toUpperCase().replace(/[\s-]/g, '_');
        const fStatus = (filterStatus as string).toUpperCase().replace(/[\s-]/g, '_');
        if (bStatus !== fStatus) return false;
      }
      if (filterDate && b.date !== filterDate) return false;
      if (filterVehicle !== 'All' && b.vehicleCategory !== filterVehicle) return false;
      return true;
    }).sort((a, b) => {
      const tA = a.time ?? a.timeSlot; const tB = b.time ?? b.timeSlot;
      return new Date(`${a.date}T${tA}`).getTime() - new Date(`${b.date}T${tB}`).getTime();
    }), [bookings, filterStatus, filterDate, filterVehicle]);

  const activeOnSelectedDate = bookings.filter(b => {
    const s = (b.status as string).toUpperCase();
    return b.date === selectedDate && s !== 'CANCELLED' && s !== 'COMPLETED';
  });

  const activeSlots = useMemo(() => {
    const slots: Record<string, { lube: number; grooming: number; coating: number }> = {};
    activeOnSelectedDate.forEach(b => {
      const time = b.time ?? b.timeSlot;
      if (!slots[time]) slots[time] = { lube: 0, grooming: 0, coating: 0 };
      const svc = services.find(s => s.id === b.serviceId);
      if (svc?.category === 'LUBE')     slots[time].lube++;
      else if (svc?.category === 'GROOMING') slots[time].grooming++;
      else if (svc?.category === 'COATING')  slots[time].coating++;
    });
    return Object.entries(slots).sort((a, b) =>
      new Date(`${selectedDate} ${a[0]}`).getTime() - new Date(`${selectedDate} ${b[0]}`).getTime()
    );
  }, [activeOnSelectedDate, services, selectedDate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setUpdateImage(r.result as string); r.readAsDataURL(file); }
  };

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBooking && updateMessage.trim()) {
      onAddUpdate(selectedBooking.id, updateMessage, updateImage || undefined);
      const newUpdate = { id: Math.random().toString(36).slice(2), timestamp: new Date().toISOString(), message: updateMessage, imageUrl: updateImage || undefined };
      setSelectedBooking({ ...selectedBooking, updates: [...(selectedBooking.updates || []), newUpdate] });
      setUpdateMessage(''); setUpdateImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const servicesByCategory = useMemo(() => {
    const groups: Record<string, ServicePackage[]> = {};
    for (const s of services) {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    }
    return groups;
  }, [services]);

  const categoryLabels: Record<string, string> = { LUBE: 'Lube & Go', GROOMING: 'Auto Grooming', COATING: 'Ceramic Coating' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>

      {/* ── Dashboard Banner ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #383838 0%, #1a1a1a 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ee4923 0, #ee4923 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <p className="font-lovelo text-[10px] font-black tracking-[0.3em] uppercase mb-2" style={{ color: '#ee4923' }}>
            Wash &amp; Go Auto Salon
          </p>
          <h1 className="font-lovelo font-black text-3xl text-white mb-1">Admin Dashboard</h1>
          <p className="font-lovelo text-gray-400 text-xs" style={{ fontWeight: 300 }}>
            Manage bookings, update statuses, and configure service pricing.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {[
              { label: 'Total Bookings', value: totalBookings,  icon: <BarChart3 className="w-4 h-4" />, accent: true  },
              { label: 'Pending',        value: pendingCount,   icon: <Clock className="w-4 h-4" />,     accent: false },
              { label: 'Confirmed',      value: confirmedCount, icon: <CheckCircle2 className="w-4 h-4" />, accent: false },
              { label: "Today's Apts",   value: todayCount,     icon: <Calendar className="w-4 h-4" />,  accent: false },
            ].map(({ label, value, icon, accent }) => (
              <div key={label} className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: accent ? '#ee4923' : 'rgba(255,255,255,0.4)' }}>
                  {icon}
                  <span className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase">{label}</span>
                </div>
                <p className="font-lovelo font-black text-2xl" style={{ color: accent ? '#ee4923' : '#ffffff' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Tab Navigation ── */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-max">
          <button onClick={() => setActiveTab('bookings')}
            className={cn(
              'font-lovelo flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all duration-200',
              activeTab === 'bookings' ? 'text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
            )}
            style={activeTab === 'bookings' ? { background: 'linear-gradient(135deg, #383838, #1a1a1a)' } : {}}>
            <Calendar className="w-3.5 h-3.5" /> Bookings
          </button>
          <button onClick={() => setActiveTab('services')}
            className={cn(
              'font-lovelo flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all duration-200',
              activeTab === 'services' ? 'text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
            )}
            style={activeTab === 'services' ? { background: 'linear-gradient(135deg, #ee4923, #F4921F)' } : {}}>
            <DollarSign className="w-3.5 h-3.5" /> Services &amp; Rates
          </button>
        </div>

        {/* ─────────────── BOOKINGS TAB ─────────────── */}
        {activeTab === 'bookings' && (
          <>
            {/* Capacity / Date Slots */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ backgroundColor: '#fafafa' }}>
                <div>
                  <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400 mb-0.5">Capacity Overview</p>
                  <h2 className="font-lovelo font-black text-base" style={{ color: '#383838' }}>Active Slots</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedDate(prev => format(subDays(parseISO(prev), 1), 'yyyy-MM-dd'))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-gray-100 hover:border-orange-300 transition-colors bg-white">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    className="font-lovelo px-4 py-2 border-2 border-gray-100 rounded-xl text-xs font-black text-gray-800 outline-none focus:border-orange-400 bg-white" />
                  <button onClick={() => setSelectedDate(prev => format(addDays(parseISO(prev), 1), 'yyyy-MM-dd'))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-gray-100 hover:border-orange-300 transition-colors bg-white">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                    <p className="font-lovelo text-sm text-gray-400" style={{ fontWeight: 300 }}>
                      No active bookings for {format(parseISO(selectedDate), 'MMM d, yyyy')}.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {activeSlots.map(([time, counts]) => (
                      <div key={time} className="rounded-2xl p-4 border-2 border-gray-100">
                        <p className="font-lovelo font-black text-sm mb-3 pb-2 border-b border-gray-100" style={{ color: '#383838' }}>{time}</p>
                        {[
                          { label: 'Lube & Go',      count: counts.lube,     max: 1 },
                          { label: 'Detailing Studio', count: counts.grooming, max: 2 },
                          { label: 'Ceramic Coating', count: counts.coating,  max: 2 },
                        ].map(({ label, count, max }) => (
                          <div key={label} className="flex items-center justify-between mb-2">
                            <span className="font-lovelo text-xs text-gray-500" style={{ fontWeight: 300 }}>{label}</span>
                            <span className="font-lovelo text-[10px] font-black px-2 py-0.5 rounded-full"
                              style={count >= max
                                ? { backgroundColor: '#fee2e2', color: '#991b1b' }
                                : { backgroundColor: '#dcfce7', color: '#166534' }}>
                              {count} / {max}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Filter + Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Filter Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ background: 'linear-gradient(135deg, #383838 0%, #1a1a1a 100%)' }}>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" style={{ color: '#ee4923' }} />
                  <h2 className="font-lovelo font-black text-sm text-white tracking-wider uppercase">All Bookings</h2>
                  <span className="font-lovelo text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(238,73,35,0.2)', color: '#F4921F' }}>
                    {filteredBookings.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={filterStatus as string} onChange={e => setFilterStatus(e.target.value as any)}
                    className="font-lovelo text-xs font-black bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2 outline-none hover:bg-white/20 transition-colors">
                    <option value="All" className="text-gray-800 bg-white">All Statuses</option>
                    <option value="PENDING"     className="text-gray-800 bg-white">Pending</option>
                    <option value="CONFIRMED"   className="text-gray-800 bg-white">Confirmed</option>
                    <option value="IN_PROGRESS" className="text-gray-800 bg-white">In Progress</option>
                    <option value="COMPLETED"   className="text-gray-800 bg-white">Completed</option>
                    <option value="CANCELLED"   className="text-gray-800 bg-white">Cancelled</option>
                  </select>
                  <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value as any)}
                    className="font-lovelo text-xs font-black bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2 outline-none hover:bg-white/20 transition-colors">
                    <option value="All"        className="text-gray-800 bg-white">All Vehicles</option>
                    <option value="Car"        className="text-gray-800 bg-white">Cars</option>
                    <option value="Motorcycle" className="text-gray-800 bg-white">Motorcycles</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                      className="font-lovelo text-xs font-black bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2 outline-none hover:bg-white/20 transition-colors" />
                    {filterDate && (
                      <button onClick={() => setFilterDate('')}
                        className="font-lovelo text-[10px] font-black px-2 py-1 rounded-lg transition-colors"
                        style={{ color: '#F4921F' }}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ backgroundColor: '#fafafa' }} className="border-b border-gray-100">
                      {['ID / Schedule', 'Customer', 'Vehicle & Service', 'Payment', 'Status', ''].map(h => (
                        <th key={h} className="font-lovelo px-5 py-3 text-[9px] font-black tracking-[0.2em] uppercase text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                          <p className="font-lovelo text-sm text-gray-400" style={{ fontWeight: 300 }}>No bookings match the current filters.</p>
                        </td>
                      </tr>
                    ) : filteredBookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* ID / Schedule */}
                        <td className="px-5 py-4">
                          <p className="font-lovelo text-[9px] font-black tracking-wider text-gray-400 mb-1">#{booking.id}</p>
                          <p className="font-lovelo font-black text-sm" style={{ color: '#383838' }}>
                            {format(parseISO(booking.date), 'MMM d, yyyy')}
                          </p>
                          <p className="font-lovelo text-xs mt-0.5" style={{ color: '#ee4923', fontWeight: 300 }}>
                            {booking.time ?? booking.timeSlot}
                          </p>
                        </td>
                        {/* Customer */}
                        <td className="px-5 py-4">
                          <p className="font-lovelo font-black text-sm" style={{ color: '#383838' }}>{booking.customerName}</p>
                          <p className="font-lovelo text-xs text-gray-400 mt-0.5" style={{ fontWeight: 300 }}>
                            {booking.contact ?? booking.customerPhone}
                          </p>
                          {booking.email && (
                            <p className="font-lovelo text-[10px] text-gray-300 mt-0.5" style={{ fontWeight: 300 }}>{booking.email}</p>
                          )}
                        </td>
                        {/* Vehicle & Service */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            {booking.vehicleCategory === 'Car'
                              ? <Car  className="w-3.5 h-3.5 text-gray-300" />
                              : <Bike className="w-3.5 h-3.5 text-gray-300" />}
                            <span className="font-lovelo text-xs font-black" style={{ color: '#383838' }}>
                              {booking.vehicleCategory ?? booking.vehicleType} · Size {booking.vehicleSize}
                            </span>
                          </div>
                          {booking.plateNumber && (
                            <span className="font-lovelo text-[9px] font-black tracking-widest px-2 py-0.5 rounded-lg text-white inline-block mb-1" style={{ backgroundColor: '#383838' }}>
                              {booking.plateNumber}
                            </span>
                          )}
                          <p className="font-lovelo text-xs text-gray-400" style={{ fontWeight: 300 }}>{booking.serviceName}</p>
                        </td>
                        {/* Payment */}
                        <td className="px-5 py-4">
                          <p className="font-lovelo font-black text-sm" style={{ color: '#ee4923' }}>
                            ₱{(booking.downPayment ?? booking.downPaymentAmount).toLocaleString()}
                          </p>
                          <p className="font-lovelo text-[9px] text-gray-400 mb-1" style={{ fontWeight: 300 }}>Down Payment</p>
                          {booking.paymentMethod && (
                            <span className="font-lovelo text-[9px] font-black px-2 py-0.5 rounded-lg text-gray-500 inline-block" style={{ backgroundColor: '#f3f4f6' }}>
                              {booking.paymentMethod}
                            </span>
                          )}
                          {booking.referenceNumber && (
                            <p className="font-lovelo text-[9px] font-black text-blue-500 mt-1">Ref: {booking.referenceNumber}</p>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={booking.status as string} />
                        </td>
                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => setSelectedBooking(booking)}
                            className="font-lovelo font-black text-[10px] tracking-widest uppercase px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #383838, #1a1a1a)' }}>
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ─────────────── SERVICES TAB ─────────────── */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            {/* Info banner */}
            <div className="flex items-start gap-4 rounded-2xl p-5 border-2"
              style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fef3c7' }}>
                <TrendingUp className="w-4 h-4" style={{ color: '#d97706' }} />
              </div>
              <div>
                <p className="font-lovelo font-black text-sm" style={{ color: '#92400e' }}>Price updates are live</p>
                <p className="font-lovelo text-xs mt-0.5" style={{ color: '#b45309', fontWeight: 300 }}>
                  Changes saved here are written to the database and immediately reflected on the Services &amp; Rates page and the Book Now wizard.
                </p>
              </div>
            </div>

            {(Object.entries(servicesByCategory) as [string, ServicePackage[]][]).map(([category, catServices]) => {
              const catAccent: Record<string, string> = { LUBE: '#F4921F', GROOMING: '#383838', COATING: '#ee4923' };
              const accent = catAccent[category] ?? '#6b7280';
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full" style={{ backgroundColor: accent }} />
                    <h2 className="font-lovelo font-black text-base" style={{ color: '#383838' }}>
                      {categoryLabels[category] ?? category}
                    </h2>
                    <span className="font-lovelo text-[10px] text-gray-400" style={{ fontWeight: 300 }}>
                      {catServices.length} service{catServices.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {catServices.map(s => <ServiceEditorCard key={s.id} service={s} onSave={onUpdateService} />)}
                  </div>
                </div>
              );
            })}

            {services.length === 0 && (
              <div className="text-center py-20">
                <Layers className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="font-lovelo text-sm text-gray-400" style={{ fontWeight: 300 }}>
                  No services loaded. Check your database connection.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Manage Booking Modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400 mb-0.5">Managing Booking</p>
                <h2 className="font-lovelo font-black text-base flex items-center gap-2" style={{ color: '#383838' }}>
                  <Wrench className="w-4 h-4" style={{ color: '#ee4923' }} />
                  #{selectedBooking.id}
                  {selectedBooking.plateNumber && (
                    <span className="font-lovelo text-[10px] font-black tracking-widest px-2 py-0.5 rounded-lg text-white" style={{ backgroundColor: '#383838' }}>
                      {selectedBooking.plateNumber}
                    </span>
                  )}
                </h2>
              </div>
              <button onClick={() => setSelectedBooking(null)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-gray-100 hover:border-red-200 hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Payment Proof */}
              {selectedBooking.paymentProofUrl && (
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: '#fafafa' }}>
                    <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400">Proof of Payment</p>
                  </div>
                  <img src={selectedBooking.paymentProofUrl} alt="Payment Proof"
                    className="w-full max-h-56 object-contain bg-white p-4" />
                </div>
              )}

              {/* Update Status */}
              <div>
                <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400 mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'] as const).map(status => {
                    const m = getStatusMeta(status);
                    const isActive = (selectedBooking.status as string) === status ||
                      (selectedBooking.status as string).toUpperCase().replace(/[\s-]/g, '_') === status.toUpperCase().replace(/[\s-]/g, '_');
                    return (
                      <button key={status}
                        onClick={() => { onUpdateStatus(selectedBooking.id, status); setSelectedBooking({ ...selectedBooking, status: status as any }); }}
                        className="font-lovelo font-black text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all"
                        style={isActive
                          ? { color: m.color, backgroundColor: m.bg, borderColor: m.border }
                          : { color: '#9ca3af', backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
                        {m.icon}{m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Progress Update */}
              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: '#fafafa' }}>
                  <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400">Add Progress Update</p>
                </div>
                <div className="p-4">
                  <form onSubmit={handleAddUpdate} className="space-y-3">
                    <textarea value={updateMessage} onChange={e => setUpdateMessage(e.target.value)}
                      placeholder="Enter update message…"
                      className="font-lovelo w-full p-3 border-2 border-gray-100 rounded-xl focus:border-orange-400 outline-none resize-none h-20 text-sm" style={{ fontWeight: 300 }}
                      required />
                    <label className="font-lovelo flex items-center gap-2 cursor-pointer text-xs font-black text-gray-500 hover:text-orange-500 transition-colors w-max">
                      <ImageIcon className="w-4 h-4" />
                      {updateImage ? 'Change Image' : 'Attach Image (optional)'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} ref={fileInputRef} />
                    </label>
                    {updateImage && (
                      <div className="relative inline-block">
                        <img src={updateImage} alt="Preview" className="h-28 rounded-xl border border-gray-100 object-cover" />
                        <button type="button"
                          onClick={() => { setUpdateImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <button type="submit" disabled={!updateMessage.trim()}
                      className="font-lovelo flex items-center justify-center gap-2 w-full font-black text-xs tracking-widest uppercase text-white py-3 rounded-xl transition-all disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #ee4923 0%, #F4921F 100%)' }}>
                      <Plus className="w-4 h-4" /> Post Update
                    </button>
                  </form>
                </div>
              </div>

              {/* Update History */}
              <div>
                <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400 mb-3">Update History</p>
                {selectedBooking.updates && selectedBooking.updates.length > 0 ? (
                  <div className="space-y-3">
                    {selectedBooking.updates.slice().reverse().map(update => (
                      <div key={update.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <p className="font-lovelo text-sm" style={{ color: '#383838', fontWeight: 300 }}>{update.message}</p>
                          <span className="font-lovelo text-[9px] text-gray-400 whitespace-nowrap" style={{ fontWeight: 300 }}>
                            {format(new Date(update.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        {update.imageUrl && (
                          <img src={update.imageUrl} alt="Update" className="mt-2 rounded-xl max-h-44 object-cover border border-gray-100 w-full" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="font-lovelo text-xs text-gray-300">No updates posted yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
