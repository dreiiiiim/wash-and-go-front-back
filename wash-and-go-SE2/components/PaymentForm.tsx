import React, { useState } from 'react';
import { ServicePackage, VehicleSize, FuelType } from '../types';
import { DOWN_PAYMENT_PERCENTAGE, PAYMENT_METHODS } from '../constants';
import { CreditCard, Upload, User, Phone, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentFormProps {
  service: ServicePackage;
  vehicleSize: VehicleSize;
  fuelType: FuelType | null;
  date: string;
  timeSlot: string;
  onBack: () => void;
  onSubmit: (details: { name: string, phone: string, proof: string, paymentMethod: string }) => void;
  submitting?: boolean;
}

export default function PaymentForm({ service, vehicleSize, fuelType, date, timeSlot, onBack, onSubmit, submitting }: PaymentFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Calculate price based on service type
  let totalPrice: number;
  if (service.isLubeFlat && service.lubePrices && fuelType) {
    totalPrice = service.lubePrices[fuelType];
  } else if (service.isLubeFlat) {
    totalPrice = Object.values(service.prices)[0];
  } else {
    totalPrice = service.prices[vehicleSize];
  }

  const downPayment = totalPrice * DOWN_PAYMENT_PERCENTAGE;
  
  const selectedMethodDetails = PAYMENT_METHODS.find(m => m.id === method);

  // Build display labels
  const vehicleLabel = service.isLubeFlat
    ? (fuelType ? fuelType : 'N/A')
    : `${vehicleSize}${service.vehicleType ? ` (${service.vehicleType})` : ''}${fuelType ? ` — ${fuelType}` : ''}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !proofFile) return;
    setUploading(true);
    try {
      const path = `proofs/${Date.now()}-${proofFile.name.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(path, proofFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(path);
      onSubmit({ name, phone, proof: publicUrl, paymentMethod: method });
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-5 gap-8">
      
      {/* Booking Summary - Left/Top Side */}
      <div className="lg:col-span-2 bg-gray-50 p-6 rounded-xl h-fit border border-gray-100">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">BOOKING SUMMARY</h3>
        
        <div className="space-y-4">
          <div>
            <span className="block text-xs text-gray-500">Service</span>
            <span className="block font-bold text-gray-900 text-lg leading-tight">{service.name}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
                <span className="block text-xs text-gray-500">
                  {service.isLubeFlat ? 'Fuel Type' : 'Vehicle'}
                </span>
                <span className="block font-bold text-gray-900">{vehicleLabel}</span>
            </div>
            <div>
                <span className="block text-xs text-gray-500">Schedule</span>
                <span className="block font-bold text-gray-900">{date}<br/>{timeSlot}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-4 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Price</span>
              <span className="font-bold text-gray-900">₱{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
              <span className="font-bold text-sm">Required Down Payment ({(DOWN_PAYMENT_PERCENTAGE * 100).toFixed(0)}%)</span>
              <span className="font-black text-xl">₱{downPayment.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form - Right/Bottom Side */}
      <div className="lg:col-span-3">
        <h2 className="text-2xl italic font-black text-gray-900 mb-6">CUSTOMER & PAYMENT</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
                    setName(val);
                  }}
                  placeholder="Juan Dela Cruz"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, ''); // Only digits
                    if (val.length <= 11) {
                      setPhone(val);
                    }
                  }}
                  pattern="^09\d{9}$"
                  title="Phone number must start with 09 and be exactly 11 digits (e.g., 09171234567)"
                  placeholder="09XXXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Select Payment Method</label>
             <div className="grid grid-cols-2 gap-4">
               {PAYMENT_METHODS.map(m => (
                 <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex flex-col items-start p-4 border rounded-xl transition-all ${
                    method === m.id 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
                 >
                   <div className="flex items-center gap-2 mb-1">
                     <CreditCard size={18} className={method === m.id ? 'text-orange-600' : 'text-gray-400'} />
                     <span className={`font-bold ${method === m.id ? 'text-orange-800' : 'text-gray-700'}`}>{m.name}</span>
                   </div>
                 </button>
               ))}
             </div>
             
             {selectedMethodDetails && (
               <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
                 <p>Send <strong>₱{downPayment.toLocaleString()}</strong> to:</p>
                 <p className="font-mono font-bold text-lg mt-1">{selectedMethodDetails.number}</p>
                 <p className="text-gray-500 text-xs">{selectedMethodDetails.accountName}</p>
               </div>
             )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Upload Proof of Payment</label>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> screenshot</p>
                        <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
                </label>
            </div>
            {proofFile && (
              <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
                <Info size={14}/> Selected: {proofFile.name}
              </p>
            )}
          </div>

          <div className="flex justify-between pt-6 border-t">
            <button type="button" onClick={onBack} disabled={uploading || submitting} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900 disabled:opacity-50">
              BACK
            </button>
            <button
              type="submit"
              disabled={!name || !phone || !proofFile || uploading || submitting}
              className={`px-8 py-3 rounded-lg font-bold text-white transition-colors ${
                name && phone && proofFile && !uploading && !submitting ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {uploading ? 'Uploading...' : submitting ? 'Submitting...' : 'COMPLETE BOOKING'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}