import React, { useState, useMemo, useRef } from 'react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { Booking, ServicePackage } from '../types';
import { Filter, Calendar, Car, Bike, Wrench, Image as ImageIcon, Plus, X, DollarSign, Save, ChevronDown, ChevronUp, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface AdminDashboardProps {
  bookings: Booking[];
  services: ServicePackage[];
  token: string | null;
  onUpdateStatus: (id: string, status: any) => void;
  onAddUpdate: (id: string, message: string, imageUrl?: string) => void;
  onUpdateService: (id: string, dto: object) => Promise<void>;
}

// ─── Price Input ───────────────────────────────────────────────────────────────
interface PriceInputProps { label: string; value: number | undefined; onChange: (v: number) => void }
const PriceInput: React.FC<PriceInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₱</span>
        <input
          type="number"
          min={0}
          value={value ?? ''}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:ring-2 focus:ring-orange-400 outline-none bg-gray-50 hover:bg-white transition-colors"
        />
      </div>
    </div>
  );
}

// ─── Service Editor Card ───────────────────────────────────────────────────────
interface ServiceEditorCardProps { service: ServicePackage; onSave: (id: string, dto: object) => Promise<void> }
const ServiceEditorCard: React.FC<ServiceEditorCardProps> = ({ service, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [prices, setPrices] = useState({ ...service.prices });
  const [lubePrices, setLubePrices] = useState<Record<string, number>>(service.lubePrices ?? {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty =
    name !== service.name ||
    description !== service.description ||
    JSON.stringify(prices) !== JSON.stringify(service.prices) ||
    JSON.stringify(lubePrices) !== JSON.stringify(service.lubePrices ?? {});

  const handleSave = async () => {
    setSaving(true);
    const dto: Record<string, any> = { name, description,
      price_small: prices.SMALL, price_medium: prices.MEDIUM,
      price_large: prices.LARGE, price_extra_large: prices.EXTRA_LARGE,
    };
    if (service.isLubeFlat && Object.keys(lubePrices).length > 0) dto.lube_prices = lubePrices;
    await onSave(service.id, dto);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const catColor: Record<string, string> = { LUBE: 'from-amber-400 to-orange-500', GROOMING: 'from-slate-500 to-slate-700', COATING: 'from-orange-500 to-red-600' };

  return (
    <div className={cn('bg-white rounded-2xl border overflow-hidden transition-all', isOpen ? 'border-orange-300 shadow-lg' : 'border-gray-200 hover:border-orange-200 shadow-sm')}>
      <button onClick={() => setIsOpen(v => !v)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <div className={cn('w-2 h-10 rounded-full bg-gradient-to-b flex-shrink-0', catColor[service.category] ?? 'from-gray-400 to-gray-600')} />
          <div>
            <p className="font-bold text-gray-900 text-sm">{name}</p>
            <p className="text-xs text-gray-400">{service.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && !saved && <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">Unsaved</span>}
          {saved && <span className="text-xs bg-green-100 text-green-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Saved</span>}
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Service Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-orange-400 outline-none bg-gray-50" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-orange-400 outline-none bg-gray-50" />
            </div>
          </div>

          {!service.isLubeFlat && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Prices by Vehicle Size</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <PriceInput label="Small (S)"      value={prices.SMALL}       onChange={v => setPrices(p => ({ ...p, SMALL: v }))} />
                <PriceInput label="Medium (M)"     value={prices.MEDIUM}      onChange={v => setPrices(p => ({ ...p, MEDIUM: v }))} />
                <PriceInput label="Large (L)"      value={prices.LARGE}       onChange={v => setPrices(p => ({ ...p, LARGE: v }))} />
                <PriceInput label="Extra Large (XL)" value={prices.EXTRA_LARGE} onChange={v => setPrices(p => ({ ...p, EXTRA_LARGE: v }))} />
              </div>
            </div>
          )}

          {service.isLubeFlat && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Fuel-based Prices</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(lubePrices) as [string, number][]).map(([fuel, val]) => (
                  <PriceInput key={fuel} label={fuel} value={val} onChange={v => setLubePrices(p => ({ ...p, [fuel]: v }))} />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={handleSave} disabled={saving || !isDirty}
              className={cn('flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all',
                saving ? 'bg-gray-200 text-gray-500 cursor-wait' :
                !isDirty ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
              )}>
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard({ bookings, services, token, onUpdateStatus, onAddUpdate, onUpdateService }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'services'>('bookings');

  const [filterStatus, setFilterStatus] = useState<Booking['status'] | 'All'>('All');
  const [filterDate, setFilterDate] = useState('');
  const [filterVehicle, setFilterVehicle] = useState<'All' | 'Car' | 'Motorcycle'>('All');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateImage, setUpdateImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredBookings = useMemo(() =>
    bookings.filter(b => {
      if (filterStatus !== 'All') {
        const bStatus = (b.status as string).toUpperCase().replace(' ', '_');
        const fStatus = filterStatus.toUpperCase().replace(' ', '_');
        if (bStatus !== fStatus) return false;
      }
      if (filterDate && b.date !== filterDate) return false;
      if (filterVehicle !== 'All' && b.vehicleCategory !== filterVehicle) return false;
      return true;
    }).sort((a, b) => {
      const tA = a.time ?? a.timeSlot; const tB = b.time ?? b.timeSlot;
      return new Date(`${a.date}T${tA}`).getTime() - new Date(`${b.date}T${tB}`).getTime();
    }), [bookings, filterStatus, filterDate, filterVehicle]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);

  const activeOnSelectedDate = bookings.filter(b => {
    const s = b.status as string;
    return b.date === selectedDate && s !== 'Cancelled' && s !== 'Completed' && s !== 'CANCELLED' && s !== 'COMPLETED';
  });

  const activeSlots = useMemo(() => {
    const slots: Record<string, { lube: number, grooming: number, coating: number }> = {};
    activeOnSelectedDate.forEach(b => {
      const time = b.time ?? b.timeSlot;
      if (!slots[time]) slots[time] = { lube: 0, grooming: 0, coating: 0 };
      
      const service = services.find(s => s.id === b.serviceId);
      if (service?.category === 'LUBE') slots[time].lube++;
      else if (service?.category === 'GROOMING') slots[time].grooming++;
      else if (service?.category === 'COATING') slots[time].coating++;
    });
    // Extract AM/PM correctly for simple sorting, or sort alphabetically since HH:MM format is tricky with 12 hour
    return Object.entries(slots).sort((a, b) => {
      const tA = new Date(`${selectedDate} ${a[0]}`).getTime();
      const tB = new Date(`${selectedDate} ${b[0]}`).getTime();
      return tA - tB;
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': case 'PENDING':       return 'bg-yellow-100 text-yellow-700';
      case 'Confirmed': case 'CONFIRMED':   return 'bg-blue-100 text-blue-700';
      case 'In Progress': case 'IN_PROGRESS': return 'bg-orange-100 text-orange-700';
      case 'Completed': case 'COMPLETED':   return 'bg-green-100 text-green-700';
      case 'Cancelled': case 'CANCELLED':   return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage bookings and update service prices.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white rounded-xl border border-gray-200 p-1.5 shadow-sm w-max">
          <button onClick={() => setActiveTab('bookings')}
            className={cn('flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all',
              activeTab === 'bookings' ? 'bg-slate-900 text-white shadow' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100')}>
            <Calendar className="w-4 h-4" /> Bookings
          </button>
          <button onClick={() => setActiveTab('services')}
            className={cn('flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all',
              activeTab === 'services' ? 'bg-orange-500 text-white shadow' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100')}>
            <DollarSign className="w-4 h-4" /> Services &amp; Rates
          </button>
        </div>

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <>
            {/* Capacity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-orange-500" /> Active Slots
                </h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedDate(prev => format(subDays(parseISO(prev), 1), 'yyyy-MM-dd'))}
                    className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                  />
                  <button 
                    onClick={() => setSelectedDate(prev => format(addDays(parseISO(prev), 1), 'yyyy-MM-dd'))}
                    className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {activeSlots.length === 0 ? (
                <p className="text-sm text-gray-500">No active bookings for {format(parseISO(selectedDate), 'MMM d, yyyy')}.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {activeSlots.map(([time, counts]) => (
                    <div key={time} className="bg-slate-50 p-4 rounded-xl border border-gray-100 space-y-3">
                      <p className="font-bold text-slate-900 border-b border-gray-200 pb-2">{time}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Lube &amp; Go</span>
                        <span className={cn("font-bold text-xs px-2 py-0.5 rounded-full", counts.lube >= 1 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>{counts.lube} / 1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Detailing Studio</span>
                        <span className={cn("font-bold text-xs px-2 py-0.5 rounded-full", counts.grooming >= 2 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>{counts.grooming} / 2</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Ceramic Coating</span>
                        <span className={cn("font-bold text-xs px-2 py-0.5 rounded-full", counts.coating >= 2 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>{counts.coating} / 2</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900 text-white">
                <h2 className="text-xl font-bold flex items-center"><Filter className="w-5 h-5 mr-2 text-orange-500" /> Filter Bookings</h2>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <select value={filterStatus as string} onChange={e => setFilterStatus(e.target.value as any)}
                    className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 outline-none">
                    <option value="All">All Statuses</option>
                    <option value="PENDING"> Pending</option>
                    <option value="CONFIRMED"> Confirmed</option>
                    <option value="IN_PROGRESS"> In Progress</option>
                    <option value="COMPLETED"> Completed</option>
                    <option value="CANCELLED"> Cancelled</option>
                  </select>
                  <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value as any)}
                    className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 outline-none">
                    <option value="All">All Vehicles</option>
                    <option value="Car">Cars</option>
                    <option value="Motorcycle">Motorcycles</option>
                  </select>
                  <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                    className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 outline-none" />
                  {filterDate && <button onClick={() => setFilterDate('')} className="text-xs text-orange-400 hover:text-orange-300">Clear</button>}
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
                      <tr><td colSpan={6} className="p-8 text-center text-gray-500">No bookings found.</td></tr>
                    ) : filteredBookings.map(booking => (
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
                            {booking.vehicleCategory === 'Car'
                              ? <Car className="w-4 h-4 mr-1 text-gray-400" />
                              : <Bike className="w-4 h-4 mr-1 text-gray-400" />}
                            {booking.vehicleCategory ?? booking.vehicleType} (Size {booking.vehicleSize}) {booking.fuelType}
                          </div>
                          {booking.plateNumber && <div className="text-sm font-bold text-slate-900 mb-1">{booking.plateNumber}</div>}
                          <div className="text-sm text-gray-600">{booking.serviceName}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-slate-900">
                            ₱{(booking.downPayment ?? booking.downPaymentAmount).toLocaleString()} <span className="text-xs text-gray-500 font-normal">DP</span>
                          </div>
                          {booking.paymentMethod && <div className="text-xs text-gray-500 mt-1">{booking.paymentMethod}</div>}
                          {booking.referenceNumber && <div className="text-xs font-mono text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">Ref: {booking.referenceNumber}</div>}
                        </td>
                        <td className="p-4">
                          <span className={cn('px-3 py-1 rounded-full text-xs font-bold flex items-center w-max', getStatusColor(booking.status as string))}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => setSelectedBooking(booking)}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm">
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

        {/* ── SERVICES TAB ── */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">Price updates are live</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Changes you save here are written to the database and immediately appear on the <strong>Services &amp; Rates</strong> page and the <strong>Book Now</strong> wizard.
                </p>
              </div>
            </div>

            {(Object.entries(servicesByCategory) as [string, ServicePackage[]][]).map(([category, catServices]) => (
              <div key={category} className="space-y-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-orange-500 inline-block" />
                  {categoryLabels[category] ?? category}
                  <span className="text-xs font-normal text-gray-400 ml-1">({catServices.length} services)</span>
                </h2>
                <div className="space-y-2">
                  {catServices.map(s => <ServiceEditorCard key={s.id} service={s} onSave={onUpdateService} />)}
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No services loaded. Check your database connection.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Manage Booking Modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-500" />
                Manage #{selectedBooking.id}
                {selectedBooking.plateNumber && <span className="text-sm font-normal text-gray-500">({selectedBooking.plateNumber})</span>}
              </h2>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 space-y-8">
              {selectedBooking.paymentProofUrl && (
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Proof of Payment</h3>
                  <img src={selectedBooking.paymentProofUrl} alt="Payment Proof" className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200 bg-white" />
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map(status => (
                    <button key={status}
                      onClick={() => { onUpdateStatus(selectedBooking.id, status); setSelectedBooking({ ...selectedBooking, status: status as any }); }}
                      className={cn('px-4 py-2 rounded-lg text-sm font-bold border transition-colors',
                        (selectedBooking.status as string) === status
                          ? getStatusColor(status) + ' border-transparent'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Add Progress Update</h3>
                <form onSubmit={handleAddUpdate} className="space-y-4">
                  <textarea value={updateMessage} onChange={e => setUpdateMessage(e.target.value)}
                    placeholder="Enter update message…"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none h-24 text-sm" required />
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium hover:text-orange-600 transition-colors w-max">
                    <ImageIcon className="w-5 h-5" />
                    {updateImage ? 'Change Image' : 'Attach Image (Optional)'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} ref={fileInputRef} />
                  </label>
                  {updateImage && (
                    <div className="relative inline-block">
                      <img src={updateImage} alt="Preview" className="h-32 rounded-lg border border-gray-200 object-cover" />
                      <button type="button" onClick={() => { setUpdateImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button type="submit" disabled={!updateMessage.trim()}
                    className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-lg transition-colors">
                    <Plus className="w-5 h-5" /> Post Update
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Update History</h3>
                {selectedBooking.updates && selectedBooking.updates.length > 0 ? (
                  <div className="space-y-4">
                    {selectedBooking.updates.slice().reverse().map(update => (
                      <div key={update.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-slate-900 font-medium">{update.message}</p>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{format(new Date(update.timestamp), 'MMM d, h:mm a')}</span>
                        </div>
                        {update.imageUrl && <img src={update.imageUrl} alt="Update" className="mt-3 rounded-lg max-h-48 object-cover border border-gray-100" />}
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