import React, { useMemo } from 'react';
import { SERVICES, SERVICE_ICONS } from '../constants';
import { ServicePackage, ServiceCategory, LubePackageType, FuelType, VehicleType, VehicleSize } from '../types';
import { Car, ShieldCheck, Droplets, Bike } from 'lucide-react';

interface ServiceSelectionProps {
  vehicleType: 'Car' | 'Motorcycle';
  vehicleSize: VehicleSize;
  fuelType: FuelType | null;
  onSelect: (service: ServicePackage) => void;
  onBack: () => void;
}

export default function ServiceSelection({ vehicleType, vehicleSize, fuelType, onSelect, onBack }: ServiceSelectionProps) {
  const categories = vehicleType === 'Motorcycle'
    ? [ServiceCategory.LUBE, ServiceCategory.COATING]
    : [ServiceCategory.LUBE, ServiceCategory.GROOMING, ServiceCategory.COATING];
  const [activeCategory, setActiveCategory] = React.useState<ServiceCategory | null>(null);

  // Filter services by category and vehicle applicability
  const subServices = useMemo(() => {
    if (!activeCategory) return [];
    let filtered = SERVICES.filter(s => s.category === activeCategory);

    // For Lube, filter out mismatched specific fuels if it's express
    if (activeCategory === ServiceCategory.LUBE && fuelType) {
      filtered = filtered.filter(s => {
        if (s.id === 'lube-express-gas' && fuelType !== FuelType.GAS) return false;
        if (s.id === 'lube-express-diesel' && fuelType !== FuelType.DIESEL) return false;
        return true;
      });
    }

    // For Ceramic and Grooming, filter by vehicle type
    if (activeCategory === ServiceCategory.COATING || activeCategory === ServiceCategory.GROOMING) {
      filtered = filtered.filter(s =>
        (vehicleType === 'Car' && s.vehicleType === VehicleType.VEHICLE) ||
        (vehicleType === 'Motorcycle' && s.vehicleType === VehicleType.MOTORCYCLE)
      );
    }

    return filtered;
  }, [activeCategory, vehicleType, fuelType]);

  const handleBackCategory = () => {
    setActiveCategory(null);
  };

  const getExactPrice = (service: ServicePackage): number => {
    if (service.isLubeFlat && service.lubePrices && fuelType) {
      return service.lubePrices[fuelType];
    }
    if (service.isLubeFlat) {
      return Object.values(service.prices)[0];
    }
    return service.prices[vehicleSize];
  };

  // ============================================================
  // STEP 1: Category Selection
  // ============================================================
  if (!activeCategory) {
    return (
      <div className="text-center animate-fade-in max-w-4xl mx-auto">
        <h2 className="text-3xl italic font-black text-gray-900 mb-2">SELECT SERVICE</h2>
        <p className="text-gray-500 mb-8">Choose a professional treatment for your machine.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = SERVICE_ICONS[cat];

            // If they chose Motorcycle, disable Lube since Lube is mostly for Cars here?
            // Optionally we can let them see it if you have Moto Lube. But the UI allowed it before.
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="group flex flex-col items-center justify-center p-10 bg-gray-50 border-2 border-transparent hover:border-orange-500 hover:bg-orange-50 rounded-2xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                  <Icon size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-700">
                  {cat === 'LUBE'
                    ? 'LUBE & GO'
                    : cat === 'GROOMING'
                      ? (vehicleType === 'Motorcycle' ? 'MOTORCYCLE GROOMING' : 'AUTO GROOMING')
                      : 'CERAMIC COATING'}
                </h3>
              </button>
            );
          })}
        </div>
        <div className="flex justify-start mt-8">
          <button onClick={onBack} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900">
            &larr; BACK TO VEHICLE
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // STEP 2: Specific Service Selection
  // ============================================================
  const Icon = activeCategory === ServiceCategory.GROOMING && vehicleType === 'Motorcycle'
    ? Bike // Use Bike icon for motorcycle grooming
    : SERVICE_ICONS[activeCategory];

  const categoryTitle = activeCategory === 'LUBE'
    ? 'LUBE & GO'
    : activeCategory === 'GROOMING'
      ? (vehicleType === 'Motorcycle' ? 'MOTORCYCLE GROOMING' : 'AUTO GROOMING')
      : 'CERAMIC COATING';

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={handleBackCategory} className="text-sm text-gray-500 hover:text-orange-600 font-bold">
          &larr; BACK
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-gray-900 text-white p-2 rounded-lg"><Icon size={20} /></div>
          <h2 className="text-2xl font-black italic text-gray-900">{categoryTitle}</h2>
        </div>
      </div>

      <p className="text-gray-500 mb-8">Select a specific package.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subServices.map((service) => {
          const exactPrice = getExactPrice(service);

          return (
            <div key={service.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 border-b-2 border-orange-500 pb-2 inline-block">
                  {service.name.toUpperCase()}
                </h3>
                <p className="text-gray-600 text-sm mt-2 mb-4 leading-relaxed">
                  {service.description}
                </p>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                  Est. Duration: {service.durationHours} hrs
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm text-gray-500">Price for your vehicle</span>
                  <span className="text-2xl font-bold text-gray-900">₱{exactPrice.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => onSelect(service)}
                  className="w-full py-3 bg-gray-900 hover:bg-orange-600 text-white rounded-lg font-bold transition-colors"
                >
                  SELECT PACKAGE
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}