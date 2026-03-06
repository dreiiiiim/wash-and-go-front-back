import React, { useState } from 'react';
import { VehicleSize, FuelType } from '../types';
import { Car, Bike, Fuel } from 'lucide-react';

interface VehicleSelectionProps {
  onSelect: (type: 'Car' | 'Motorcycle', size: VehicleSize, fuel: FuelType) => void;
}

export default function VehicleSelection({ onSelect }: VehicleSelectionProps) {
  const [vehicleType, setVehicleType] = useState<'Car' | 'Motorcycle' | null>(null);
  const [vehicleSize, setVehicleSize] = useState<VehicleSize | null>(null);
  const [fuelType, setFuelType] = useState<FuelType | null>(null);

  const carSizes = [
    { id: VehicleSize.SMALL, label: 'SMALL', desc: 'Sedan / Hatchback' },
    { id: VehicleSize.MEDIUM, label: 'MEDIUM', desc: 'Compact SUV / Crossover' },
    { id: VehicleSize.LARGE, label: 'LARGE', desc: 'SUV / Pick-up / Van' },
    { id: VehicleSize.EXTRA_LARGE, label: 'EXTRA LARGE', desc: 'Full-size Van / L300' },
  ];

  const motoSizes = [
    { id: VehicleSize.SMALL, label: 'SMALL', desc: 'Scooter / Underbone' },
    { id: VehicleSize.MEDIUM, label: 'MEDIUM', desc: 'Standard / Sport' },
    { id: VehicleSize.LARGE, label: 'LARGE', desc: 'Touring / Adventure' },
    { id: VehicleSize.EXTRA_LARGE, label: 'EXTRA LARGE', desc: 'Big Bike / Heavy Touring' },
  ];

  const sizeOptions = vehicleType === 'Motorcycle' ? motoSizes : carSizes;

  // Auto-set gas for motorcycles, they don't use diesel
  const handleTypeSelect = (type: 'Car' | 'Motorcycle') => {
    setVehicleType(type);
    setVehicleSize(null);
    if (type === 'Motorcycle') {
      setFuelType(FuelType.GAS);
    } else {
      setFuelType(null); // Reset for cars so they choose
    }
  };

  const handleContinue = () => {
    if (vehicleType && vehicleSize && fuelType) {
      onSelect(vehicleType, vehicleSize, fuelType);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl italic font-black text-gray-900 mb-2">SELECT VEHICLE</h2>
        <p className="text-gray-500">Tell us what you drive so we can provide accurate pricing.</p>
      </div>

      {/* Step 1: Type */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">1. Vehicle Type</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleTypeSelect('Car')}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${vehicleType === 'Car'
                ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
          >
            <Car size={32} className={`mb-3 ${vehicleType === 'Car' ? 'text-orange-600' : 'text-gray-400'}`} />
            <span className={`font-bold ${vehicleType === 'Car' ? 'text-orange-700' : 'text-gray-800'}`}>CAR / SUV / VAN</span>
          </button>
          <button
            onClick={() => handleTypeSelect('Motorcycle')}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${vehicleType === 'Motorcycle'
                ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
          >
            <Bike size={32} className={`mb-3 ${vehicleType === 'Motorcycle' ? 'text-orange-600' : 'text-gray-400'}`} />
            <span className={`font-bold ${vehicleType === 'Motorcycle' ? 'text-orange-700' : 'text-gray-800'}`}>MOTORCYCLE</span>
          </button>
        </div>
      </div>

      {/* Step 2: Size */}
      {vehicleType && (
        <div className="animate-fade-in">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">2. Vehicle Size</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sizeOptions.map((s) => (
              <button
                key={s.id}
                onClick={() => setVehicleSize(s.id)}
                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all ${vehicleSize === s.id
                    ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                <span className={`font-bold text-lg ${vehicleSize === s.id ? 'text-orange-700' : 'text-gray-900'}`}>{s.label}</span>
                <span className="text-sm text-gray-500">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Fuel Type (Only for Cars) */}
      {vehicleType === 'Car' && vehicleSize && (
        <div className="animate-fade-in">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">3. Fuel Type</h3>
          <div className="grid grid-cols-2 gap-4">
            {[FuelType.GAS, FuelType.DIESEL].map(f => (
              <button
                key={f}
                onClick={() => setFuelType(f)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all justify-center ${fuelType === f
                    ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                <Fuel size={20} className={fuelType === f ? 'text-orange-600' : 'text-gray-400'} />
                <span className={`font-bold text-lg ${fuelType === f ? 'text-orange-700' : 'text-gray-900'}`}>{f}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">* Required to determine accurate pricing for Lube Services.</p>
        </div>
      )}

      {/* Proceed */}
      <div className="flex justify-end pt-8">
        <button
          onClick={handleContinue}
          disabled={!vehicleType || !vehicleSize || !fuelType}
          className={`px-8 py-3 rounded-lg font-bold text-white transition-colors ${vehicleType && vehicleSize && fuelType
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-gray-300 cursor-not-allowed'
            }`}
        >
          NEXT: SELECT SERVICE
        </button>
      </div>
    </div>
  );
}