import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { Booking, ServicePackage, VehicleSize } from '../types';
import {
  Filter, Calendar, Car, Bike, Wrench, Image as ImageIcon, Plus, X,
  DollarSign, Save, ChevronDown, ChevronUp, CheckCircle, ChevronLeft,
  ChevronRight, Clock, CheckCircle2, XCircle, Loader2, BarChart3,
  AlertCircle, TrendingUp, Users, Layers, RotateCcw,
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

interface ServiceDraft {
  name: string;
  description: string;
  prices: Record<string, string>;
  lubePrices: Record<string, string>;
}

const priceToDraftValue = (value: unknown) =>
  value === null || value === undefined || !Number.isFinite(Number(value)) ? '' : String(value);

const pricesToDraftValues = (prices?: Record<string, number>) =>
  Object.fromEntries(Object.entries(prices ?? {}).map(([key, value]) => [key, priceToDraftValue(value)]));

const sanitizePriceInput = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '');
  return digitsOnly.replace(/^0+(?=\d)/, '');
};

const draftPriceToNumber = (value: string | number | undefined) => {
  if (value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const pricesAreEqual = (draftPrices: Record<string, string>, prices?: Record<string, number>) => {
  const keys = new Set([...Object.keys(draftPrices), ...Object.keys(prices ?? {})]);
  for (const key of keys) {
    if (draftPriceToNumber(draftPrices[key]) !== (prices?.[key] ?? 0)) return false;
  }
  return true;
};

const draftPricesToNumbers = (draftPrices: Record<string, string>) =>
  Object.fromEntries(Object.entries(draftPrices).map(([key, value]) => [key, draftPriceToNumber(value)]));

// ─── Status Helpers ────────────────────────────────────────────────────────────
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

// ─── Draft Helpers ────────────────────────────────────────────────────────────
function initDraft(service: ServicePackage): ServiceDraft {
  return {
    name: service.name,
    description: service.description,
    prices: pricesToDraftValues(service.prices as unknown as Record<string, number>),
    lubePrices: service.lubePrices ? pricesToDraftValues(service.lubePrices as unknown as Record<string, number>) : {},
  };
}

function draftIsDirty(draft: ServiceDraft, service: ServicePackage): boolean {
  return (
    draft.name !== service.name ||
    draft.description !== service.description ||
    !pricesAreEqual(draft.prices, service.prices as unknown as Record<string, number>) ||
    !pricesAreEqual(draft.lubePrices, service.lubePrices as unknown as Record<string, number> | undefined)
  );
}

function buildDto(draft: ServiceDraft, service: ServicePackage): Record<string, any> {
  const dto: Record<string, any> = {
    name: draft.name,
    description: draft.description,
    price_small: draftPriceToNumber(draft.prices[VehicleSize.SMALL]),
    price_medium: draftPriceToNumber(draft.prices[VehicleSize.MEDIUM]),
    price_large: draftPriceToNumber(draft.prices[VehicleSize.LARGE]),
    price_extra_large: draftPriceToNumber(draft.prices[VehicleSize.EXTRA_LARGE]),
  };
  if (service.isLubeFlat && Object.keys(draft.lubePrices).length > 0) {
    dto.lube_prices = draftPricesToNumbers(draft.lubePrices);
  }
  return dto;
}

// ─── Price Grid ───────────────────────────────────────────────────────────────
const SIZE_COLS = [VehicleSize.SMALL, VehicleSize.MEDIUM, VehicleSize.LARGE, VehicleSize.EXTRA_LARGE];
const SIZE_LABELS: Record<string, string> = {
  SMALL: 'Small', MEDIUM: 'Medium', LARGE: 'Large', EXTRA_LARGE: 'XL',
};

interface PriceGridProps {
  service: ServicePackage;
  draft: ServiceDraft;
  onPricesChange: (prices: Record<string, string>) => void;
  onLubePricesChange: (lubePrices: Record<string, string>) => void;
}

const PriceGrid: React.FC<PriceGridProps> = ({ service, draft, onPricesChange, onLubePricesChange }) => {
  const cellRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number, total: number) => {
    if (e.key === 'ArrowRight' && idx < total - 1) { e.preventDefault(); cellRefs.current[idx + 1]?.focus(); }
    if (e.key === 'ArrowLeft'  && idx > 0)          { e.preventDefault(); cellRefs.current[idx - 1]?.focus(); }
  };

  const cellClass = "font-lovelo w-full pl-7 pr-2 py-2.5 text-sm font-black text-gray-800 border-2 border-transparent rounded-xl focus:border-orange-400 outline-none bg-gray-50 hover:bg-white transition-all text-center";

  if (service.isLubeFlat) {
    const entries = Object.entries(draft.lubePrices);
    return (
      <div>
        <p className="font-lovelo text-[9px] font-black tracking-[0.18em] text-gray-400 uppercase mb-3">Fuel-based Pricing</p>
        <div className="overflow-x-auto rounded-xl border-2 border-gray-100">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#fafafa' }}>
                {entries.map(([fuel]) => (
                  <th key={fuel} className="font-lovelo text-[10px] font-black tracking-wider uppercase text-gray-500 px-4 py-3 border-b border-gray-100 text-center">
                    {fuel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {entries.map(([fuel, val], idx) => (
                  <td key={fuel} className="px-2 py-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-lovelo text-xs text-gray-400 pointer-events-none z-10">₱</span>
                      <input
                        ref={el => { cellRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={val}
                        onChange={e => onLubePricesChange({ ...draft.lubePrices, [fuel]: sanitizePriceInput(e.target.value) })}
                        onKeyDown={e => handleKeyDown(e, idx, entries.length)}
                        className={cellClass}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="font-lovelo text-[9px] text-gray-300 mt-2 tracking-wide" style={{ fontWeight: 300 }}>
          Tip: use ← → arrow keys to navigate cells
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-lovelo text-[9px] font-black tracking-[0.18em] text-gray-400 uppercase mb-3">Pricing by Vehicle Size</p>
      <div className="overflow-x-auto rounded-xl border-2 border-gray-100">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#fafafa' }}>
              {SIZE_COLS.map(col => (
                <th key={col} className="font-lovelo text-[10px] font-black tracking-wider uppercase text-gray-500 px-4 py-3 border-b border-gray-100 text-center">
                  {SIZE_LABELS[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {SIZE_COLS.map((size, idx) => (
                <td key={size} className="px-2 py-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-lovelo text-xs text-gray-400 pointer-events-none z-10">₱</span>
                    <input
                      ref={el => { cellRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={draft.prices[size] ?? ''}
                      onChange={e => onPricesChange({ ...draft.prices, [size]: sanitizePriceInput(e.target.value) })}
                      onKeyDown={e => handleKeyDown(e, idx, SIZE_COLS.length)}
                      className={cellClass}
                    />
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="font-lovelo text-[9px] text-gray-300 mt-2 tracking-wide" style={{ fontWeight: 300 }}>
        Tip: use ← → arrow keys to navigate cells · Tab to move forward
      </p>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard({ bookings, services, token, onUpdateStatus, onAddUpdate, onUpdateService }: AdminDashboardProps) {
  // Bookings state
  const [activeTab, setActiveTab]           = useState<'bookings' | 'services'>('bookings');
  const [filterStatus, setFilterStatus]     = useState<Booking['status'] | 'All'>('All');
  const [filterDate, setFilterDate]         = useState('');
  const [filterVehicle, setFilterVehicle]   = useState<'All' | 'Car' | 'Motorcycle'>('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updateMessage, setUpdateMessage]   = useState('');
  const [updateImage, setUpdateImage]       = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate]     = useState(today);

  // Services state — lifted up for global save bar
  const [drafts, setDrafts]                     = useState<Record<string, ServiceDraft>>({});
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [savingAll, setSavingAll]               = useState(false);
  const [showDiff, setShowDiff]                 = useState(false);
  const [filterCategory, setFilterCategory]     = useState<string>('All');

  // ── Booking Stats ──────────────────────────────────────────────────────────
  const totalBookings   = bookings.length;
  const pendingCount    = bookings.filter(b => (b.status as string).toUpperCase() === 'PENDING').length;
  const confirmedCount  = bookings.filter(b => (b.status as string).toUpperCase() === 'CONFIRMED').length;
  const todayCount      = bookings.filter(b => b.date === today).length;

  const filteredBookings = useMemo(() =>
    bookings.filter(b => {
      if (filterStatus !== 'All') {
        const bS = (b.status as string).toUpperCase().replace(/[\s-]/g, '_');
        const fS = (filterStatus as string).toUpperCase().replace(/[\s-]/g, '_');
        if (bS !== fS) return false;
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
      if (svc?.category === 'LUBE')          slots[time].lube++;
      else if (svc?.category === 'GROOMING') slots[time].grooming++;
      else if (svc?.category === 'COATING')  slots[time].coating++;
    });
    return Object.entries(slots).sort((a, b) =>
      new Date(`${selectedDate} ${a[0]}`).getTime() - new Date(`${selectedDate} ${b[0]}`).getTime()
    );
  }, [activeOnSelectedDate, services, selectedDate]);

  // ── Services Helpers ───────────────────────────────────────────────────────
  const bookingCountByService = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach(b => { counts[b.serviceId] = (counts[b.serviceId] ?? 0) + 1; });
    return counts;
  }, [bookings]);

  const servicesByCategory = useMemo(() => {
    const groups: Record<string, ServicePackage[]> = {};
    for (const s of services) {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    }
    return groups;
  }, [services]);

  const getDraft = (service: ServicePackage): ServiceDraft =>
    drafts[service.id] ?? initDraft(service);

  const setDraft = (serviceId: string, draft: ServiceDraft) =>
    setDrafts(prev => ({ ...prev, [serviceId]: draft }));

  const resetDraft = (serviceId: string) =>
    setDrafts(prev => { const next = { ...prev }; delete next[serviceId]; return next; });

  const dirtyServices = useMemo(() =>
    services.filter(s => { const d = drafts[s.id]; return d && draftIsDirty(d, s); }),
    [services, drafts]);

  const handleSaveAll = async () => {
    if (dirtyServices.length === 0 || savingAll) return;
    setSavingAll(true);
    await Promise.all(dirtyServices.map(s => onUpdateService(s.id, buildDto(drafts[s.id], s))));
    setDrafts({});
    setSavingAll(false);
  };

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (activeTab !== 'services') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveAll();
      }
      if (e.key === 'Escape') setShowDiff(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dirtyServices]);

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

  const catAccents: Record<string, string> = { LUBE: '#F4921F', GROOMING: '#383838', COATING: '#ee4923' };
  const categoryLabels: Record<string, string> = { LUBE: 'Lube & Go', GROOMING: 'Auto Grooming', COATING: 'Ceramic Coating' };
  const selectedService = services.find(s => s.id === selectedServiceId) ?? null;

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {[
              { label: 'Total Bookings', value: totalBookings,  icon: <BarChart3 className="w-4 h-4" />,     accent: true  },
              { label: 'Pending',        value: pendingCount,   icon: <Clock className="w-4 h-4" />,         accent: false },
              { label: 'Confirmed',      value: confirmedCount, icon: <CheckCircle2 className="w-4 h-4" />,  accent: false },
              { label: "Today's Apts",   value: todayCount,     icon: <Calendar className="w-4 h-4" />,      accent: false },
            ].map(({ label, value, icon, accent }) => (
              <div key={label} className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: accent ? '#ee4923' : 'rgba(255,255,255,0.4)' }}>
                  {icon}
                  <span className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase">{label}</span>
                </div>
                <p className="font-lovelo font-black text-2xl" style={{ color: accent ? '#ee4923' : '#ffffff' }}>{value}</p>
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
            {dirtyServices.length > 0 && (
              <span className="w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-black"
                style={{ backgroundColor: activeTab === 'services' ? 'rgba(255,255,255,0.3)' : '#ee4923', color: '#fff' }}>
                {dirtyServices.length}
              </span>
            )}
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
                          { label: 'Lube & Go',        count: counts.lube,     max: 1 },
                          { label: 'Detailing Studio',  count: counts.grooming, max: 2 },
                          { label: 'Ceramic Coating',   count: counts.coating,  max: 2 },
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
                    <option value="All"         className="text-gray-800 bg-white">All Statuses</option>
                    <option value="PENDING"      className="text-gray-800 bg-white">Pending</option>
                    <option value="CONFIRMED"    className="text-gray-800 bg-white">Confirmed</option>
                    <option value="IN_PROGRESS"  className="text-gray-800 bg-white">In Progress</option>
                    <option value="COMPLETED"    className="text-gray-800 bg-white">Completed</option>
                    <option value="CANCELLED"    className="text-gray-800 bg-white">Cancelled</option>
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
                        style={{ color: '#F4921F' }}>Clear</button>
                    )}
                  </div>
                </div>
              </div>

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
                        <td className="px-5 py-4">
                          <p className="font-lovelo text-[9px] font-black tracking-wider text-gray-400 mb-1">#{booking.id}</p>
                          <p className="font-lovelo font-black text-sm" style={{ color: '#383838' }}>
                            {format(parseISO(booking.date), 'MMM d, yyyy')}
                          </p>
                          <p className="font-lovelo text-xs mt-0.5" style={{ color: '#ee4923', fontWeight: 300 }}>
                            {booking.time ?? booking.timeSlot}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-lovelo font-black text-sm" style={{ color: '#383838' }}>{booking.customerName}</p>
                          <p className="font-lovelo text-xs text-gray-400 mt-0.5" style={{ fontWeight: 300 }}>
                            {booking.contact ?? booking.customerPhone}
                          </p>
                          {booking.email && (
                            <p className="font-lovelo text-[10px] text-gray-300 mt-0.5" style={{ fontWeight: 300 }}>{booking.email}</p>
                          )}
                        </td>
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
                        <td className="px-5 py-4">
                          <StatusBadge status={booking.status as string} />
                        </td>
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
          <div className="space-y-4">

            {/* Improved info banner */}
            <div className="flex items-center gap-3 rounded-xl p-4 border-l-4"
              style={{ backgroundColor: '#fffbeb', borderLeftColor: '#f59e0b' }}>
              <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#d97706' }} />
              <p className="font-lovelo text-xs" style={{ color: '#92400e', fontWeight: 300 }}>
                Price updates are <strong style={{ fontWeight: 900 }}>live</strong> — saved changes appear immediately on the booking wizard and services page.
                Use <kbd className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 border border-amber-200">Ctrl+S</kbd> to save all at once.
              </p>
            </div>

            {/* Sidebar + Detail layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-4 items-start">

              {/* ── Service Sidebar ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 space-y-2.5" style={{ backgroundColor: '#fafafa' }}>
                  <div className="flex items-center justify-between">
                    <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400">Services</p>
                    <span className="font-lovelo text-[9px] font-black px-2 py-0.5 rounded-full text-gray-400" style={{ backgroundColor: '#f3f4f6' }}>
                      {services.length}
                    </span>
                  </div>
                  <select
                    value={filterCategory}
                    onChange={e => { setFilterCategory(e.target.value); setSelectedServiceId(null); }}
                    className="font-lovelo w-full text-[10px] font-black px-3 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-orange-400 bg-white transition-all"
                    style={{ color: filterCategory === 'All' ? '#9ca3af' : (catAccents[filterCategory] ?? '#383838') }}>
                    <option value="All">All Categories</option>
                    {Object.keys(servicesByCategory).map(cat => (
                      <option key={cat} value={cat}>{categoryLabels[cat] ?? cat}</option>
                    ))}
                  </select>
                </div>

                {services.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                    <p className="font-lovelo text-xs text-gray-400" style={{ fontWeight: 300 }}>No services loaded.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {(Object.entries(servicesByCategory) as [string, ServicePackage[]][]).filter(([cat]) => filterCategory === 'All' || cat === filterCategory).map(([cat, catServices]) => (
                      <div key={cat}>
                        {/* Category header */}
                        <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: '#fafafa' }}>
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: catAccents[cat] ?? '#6b7280' }} />
                          <span className="font-lovelo text-[9px] font-black tracking-[0.18em] uppercase" style={{ color: catAccents[cat] ?? '#6b7280' }}>
                            {categoryLabels[cat] ?? cat}
                          </span>
                          <span className="font-lovelo text-[9px] text-gray-400 ml-auto" style={{ fontWeight: 300 }}>
                            {catServices.length}
                          </span>
                        </div>

                        {/* Service items */}
                        {catServices.map(s => {
                          const isSelected = s.id === selectedServiceId;
                          const draft = drafts[s.id];
                          const isDirty = !!(draft && draftIsDirty(draft, s));
                          const bookingCount = bookingCountByService[s.id] ?? 0;
                          return (
                            <button key={s.id}
                              onClick={() => setSelectedServiceId(s.id)}
                              className={cn(
                                'w-full px-4 py-3 flex items-center justify-between text-left transition-all',
                                isSelected
                                  ? 'bg-orange-50 border-r-2'
                                  : 'hover:bg-gray-50 border-r-2 border-transparent'
                              )}
                              style={isSelected ? { borderRightColor: catAccents[cat] ?? '#ee4923' } : {}}>
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', isDirty ? '' : 'opacity-0')}
                                  style={{ backgroundColor: '#ee4923' }} />
                                <span className={cn('font-lovelo text-xs truncate')}
                                  style={{ color: isSelected ? (catAccents[cat] ?? '#ee4923') : '#383838', fontWeight: isSelected ? 900 : 300 }}>
                                  {s.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                {bookingCount > 0 && (
                                  <span className="font-lovelo text-[9px] font-black px-1.5 py-0.5 rounded-full"
                                    style={{ backgroundColor: 'rgba(238,73,35,0.08)', color: '#ee4923' }}>
                                    {bookingCount}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Detail Panel ── */}
              {!selectedService ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center py-24">
                  <div className="text-center">
                    <DollarSign className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="font-lovelo text-sm text-gray-400" style={{ fontWeight: 300 }}>Select a service from the sidebar to edit</p>
                    <p className="font-lovelo text-[10px] text-gray-300 mt-1" style={{ fontWeight: 300 }}>
                      The booking count badge shows how many times a service has been booked.
                    </p>
                  </div>
                </div>
              ) : (() => {
                const draft = getDraft(selectedService);
                const dirty = draftIsDirty(draft, selectedService);
                const accent = catAccents[selectedService.category] ?? '#6b7280';
                const bookingCount = bookingCountByService[selectedService.id] ?? 0;

                return (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Detail header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4" style={{ backgroundColor: '#fafafa' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-lovelo font-black text-base truncate" style={{ color: '#383838' }}>{draft.name}</p>
                            {dirty && (
                              <span className="font-lovelo text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
                                Unsaved
                              </span>
                            )}
                          </div>
                          <p className="font-lovelo text-[9px] uppercase tracking-widest mt-0.5" style={{ color: accent, fontWeight: 300 }}>
                            {categoryLabels[selectedService.category] ?? selectedService.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {bookingCount > 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(238,73,35,0.06)' }}>
                            <BarChart3 className="w-3 h-3" style={{ color: '#ee4923' }} />
                            <span className="font-lovelo text-[10px] font-black" style={{ color: '#ee4923' }}>
                              {bookingCount} booking{bookingCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        {dirty && (
                          <button onClick={() => resetDraft(selectedService.id)}
                            className="font-lovelo flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-red-400 transition-colors">
                            <RotateCcw className="w-3 h-3" /> Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Detail body */}
                    <div className="p-6 space-y-6">
                      {/* Name and Description */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="font-lovelo text-[9px] font-black tracking-[0.18em] text-gray-400 uppercase mb-1.5 block">
                            Service Name
                          </label>
                          <input value={draft.name}
                            onChange={e => setDraft(selectedService.id, { ...draft, name: e.target.value })}
                            className="font-lovelo w-full px-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-black text-gray-800 focus:border-orange-400 outline-none bg-gray-50 hover:bg-white transition-all" />
                        </div>
                        <div>
                          <label className="font-lovelo text-[9px] font-black tracking-[0.18em] text-gray-400 uppercase mb-1.5 block">
                            Description
                          </label>
                          <input value={draft.description}
                            onChange={e => setDraft(selectedService.id, { ...draft, description: e.target.value })}
                            className="font-lovelo w-full px-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm text-gray-600 focus:border-orange-400 outline-none bg-gray-50 hover:bg-white transition-all" />
                        </div>
                      </div>

                      {/* Spreadsheet Price Grid */}
                      <PriceGrid
                        service={selectedService}
                        draft={draft}
                        onPricesChange={prices => setDraft(selectedService.id, { ...draft, prices })}
                        onLubePricesChange={lubePrices => setDraft(selectedService.id, { ...draft, lubePrices })}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* ── Floating Save Bar ── */}
      {dirtyServices.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="relative">
            {/* Diff popover */}
            {showDiff && (
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[420px] max-w-[calc(100vw-2rem)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400">Pending Changes</p>
                  <button onClick={() => setShowDiff(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {dirtyServices.map(s => {
                    const d = drafts[s.id];
                    const changes: string[] = [];
                    if (d.name !== s.name) changes.push(`Name: "${s.name}" → "${d.name}"`);
                    if (d.description !== s.description) changes.push(`Description changed`);
                    SIZE_COLS.forEach(size => {
                      const orig = (s.prices as unknown as Record<string, number>)[size] ?? 0;
                      const next = draftPriceToNumber(d.prices[size]);
                      if (orig !== next) changes.push(`${SIZE_LABELS[size]}: ₱${orig.toLocaleString()} → ₱${next.toLocaleString()}`);
                    });
                    Object.entries(d.lubePrices).forEach(([fuel, draftValue]) => {
                      const val = draftPriceToNumber(draftValue);
                      const orig = (s.lubePrices as unknown as Record<string, number> | undefined)?.[fuel] ?? 0;
                      if (orig !== val) changes.push(`${fuel}: ₱${orig.toLocaleString()} → ₱${val.toLocaleString()}`);
                    });
                    return (
                      <div key={s.id} className="rounded-xl p-3 border border-gray-100">
                        <p className="font-lovelo text-xs font-black mb-1.5" style={{ color: '#383838' }}>{s.name}</p>
                        {changes.map((c, i) => (
                          <p key={i} className="font-lovelo text-[10px] text-gray-500 leading-5" style={{ fontWeight: 300 }}>• {c}</p>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bar */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border"
              style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(238,73,35,0.3)', backdropFilter: 'blur(12px)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#ee4923', boxShadow: '0 0 6px #ee4923' }} />
              <span className="font-lovelo text-xs font-black text-white whitespace-nowrap">
                {dirtyServices.length} unsaved change{dirtyServices.length !== 1 ? 's' : ''}
              </span>
              <button onClick={() => setShowDiff(v => !v)}
                className="font-lovelo text-[10px] font-black transition-colors underline underline-offset-2 whitespace-nowrap"
                style={{ color: showDiff ? '#F4921F' : '#6b7280' }}>
                {showDiff ? 'Hide' : 'View'} diff
              </button>
              <div className="w-px h-4 bg-white/20 flex-shrink-0" />
              <button onClick={() => { setDrafts({}); setShowDiff(false); }}
                className="font-lovelo flex items-center gap-1 text-[10px] font-black text-gray-500 hover:text-red-400 transition-colors whitespace-nowrap">
                <RotateCcw className="w-3 h-3" /> Discard
              </button>
              <button onClick={handleSaveAll} disabled={savingAll}
                className="font-lovelo flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs text-white transition-all disabled:opacity-50 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #ee4923, #F4921F)' }}>
                {savingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                {savingAll ? 'Saving…' : 'Save All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Booking Modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

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

              {selectedBooking.paymentProofUrl && (
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: '#fafafa' }}>
                    <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400">Proof of Payment</p>
                  </div>
                  <img src={selectedBooking.paymentProofUrl} alt="Payment Proof"
                    className="w-full max-h-56 object-contain bg-white p-4" />
                </div>
              )}

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

              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: '#fafafa' }}>
                  <p className="font-lovelo text-[9px] font-black tracking-[0.2em] uppercase text-gray-400">Add Progress Update</p>
                </div>
                <div className="p-4">
                  <form onSubmit={handleAddUpdate} className="space-y-3">
                    <textarea value={updateMessage} onChange={e => setUpdateMessage(e.target.value)}
                      placeholder="Enter update message…"
                      className="font-lovelo w-full p-3 border-2 border-gray-100 rounded-xl focus:border-orange-400 outline-none resize-none h-20 text-sm"
                      style={{ fontWeight: 300 }} required />
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
