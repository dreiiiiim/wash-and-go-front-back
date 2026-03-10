import React, { useState } from 'react';
import { Booking, ServicePackage, VehicleSize, FuelType } from '../types';
import ServiceSelection from './ServiceSelection';
import VehicleSelection from './VehicleSelection';
import ScheduleSelection from './ScheduleSelection';
import PaymentForm from './PaymentForm';
import { api } from '../lib/api';
import { SERVICES } from '../constants';

interface BookingWizardProps {
  onSubmit: (booking: Booking) => void;
  token: string | null;
  services?: ServicePackage[];
}

type Step = 1 | 2 | 3 | 4;

export default function BookingWizard({ onSubmit, token, services = SERVICES }: BookingWizardProps) {
  const [step, setStep] = useState<Step>(1);

  // Form State
  const [vehicleType, setVehicleType] = useState<'Car' | 'Motorcycle' | null>(null);
  const [vehicleSize, setVehicleSize] = useState<VehicleSize | null>(null);
  const [fuelType, setFuelType] = useState<FuelType | null>(null);

  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);

  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [plateNumber, setPlateNumber] = useState('');

  const handleVehicleSelect = (type: 'Car' | 'Motorcycle', size: VehicleSize, fuel: FuelType) => {
    setVehicleType(type);
    setVehicleSize(size);
    setFuelType(fuel);
    setStep(2);
  };

  const handleServiceSelect = (service: ServicePackage) => {
    setSelectedService(service);
    setStep(3);
  };

  const handleScheduleSelect = (dateStr: string, timeStr: string, plate: string) => {
    setDate(dateStr);
    setTimeSlot(timeStr);
    setPlateNumber(plate);
    setStep(4);
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => (prev - 1) as Step);
  };

  // Calculate the correct price based on service type
  const calculatePrice = (): number => {
    if (!selectedService || !vehicleSize) return 0;

    // Lube flat pricing — use lubePrices if available and fuel type is selected
    if (selectedService.isLubeFlat && selectedService.lubePrices && fuelType) {
      return selectedService.lubePrices[fuelType];
    }

    // Lube flat pricing — Express (no fuel type selected, use first price)
    if (selectedService.isLubeFlat) {
      return (Object.values(selectedService.prices)[0] as number);
    }

    // Standard pricing — by vehicle size
    return selectedService.prices[vehicleSize];
  };

  const [submitting, setSubmitting] = useState(false);

  const handleFinalSubmit = async (customerDetails: { name: string, phone: string, proof: string }) => {
    if (!selectedService || !vehicleSize || !date || !timeSlot) return;
    setSubmitting(true);
    try {
      const booking = await api.createBooking({
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        serviceId: selectedService.id,
        vehicleSize,
        vehicleType: vehicleType === 'Car' ? 'VEHICLE' : 'MOTORCYCLE',
        fuelType: fuelType || undefined,
        oilType: (selectedService as any).oilType || undefined,
        date,
        timeSlot,
        plateNumber,
        paymentProofUrl: customerDetails.proof,
        paymentMethod: (customerDetails as any).paymentMethod,
      }, token || undefined);

      onSubmit(booking);
      // Reset form
      setStep(1);
      setVehicleType(null);
      setVehicleSize(null);
      setFuelType(null);
      setSelectedService(null);
      setDate('');
      setTimeSlot('');
      setPlateNumber('');
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
          {[
            { num: 1, label: 'VEHICLE' },
            { num: 2, label: 'SERVICE' },
            { num: 3, label: 'SCHEDULE' },
            { num: 4, label: 'PAYMENT' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center bg-gray-50 px-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s.num ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
              >
                {s.num}
              </div>
              <span className={`mt-2 text-xs font-bold tracking-wider ${step >= s.num ? 'text-orange-600' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 min-h-[400px]">
        {step === 1 && (
          <VehicleSelection onSelect={handleVehicleSelect} />
        )}

        {step === 2 && vehicleType && vehicleSize && (
          <ServiceSelection
            vehicleType={vehicleType}
            vehicleSize={vehicleSize}
            fuelType={fuelType}
            onSelect={handleServiceSelect}
            onBack={handleBack}
            services={services}
          />
        )}

        {step === 3 && (
          <ScheduleSelection
            onSelect={handleScheduleSelect}
            onBack={handleBack}
            serviceDuration={selectedService?.durationHours || 1}
            serviceCategory={selectedService?.category}
          />
        )}

        {step === 4 && selectedService && vehicleSize && (
          <PaymentForm
            service={selectedService}
            vehicleSize={vehicleSize}
            fuelType={fuelType}
            date={date}
            timeSlot={timeSlot}
            onBack={handleBack}
            onSubmit={handleFinalSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}