import React, { useState } from 'react';
import { Booking, ServicePackage, VehicleSize, FuelType } from '../types';
import ServiceSelection from './ServiceSelection';
import VehicleSelection from './VehicleSelection';
import ScheduleSelection from './ScheduleSelection';
import PaymentForm from './PaymentForm';
import { api } from '../lib/api';
import { SERVICES } from '../constants';
import { AppUser } from '../App';
import { Check } from 'lucide-react';

interface BookingWizardProps {
  onSubmit: (booking: Booking) => void;
  token: string | null;
  services?: ServicePackage[];
  user?: AppUser | null;
}

type Step = 1 | 2 | 3 | 4;

export default function BookingWizard({ onSubmit, token, services = SERVICES, user }: BookingWizardProps) {
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

  const STEPS = [
    { num: 1 as Step, label: 'Vehicle',  sub: 'Type & size'     },
    { num: 2 as Step, label: 'Service',  sub: 'Choose package'  },
    { num: 3 as Step, label: 'Schedule', sub: 'Date & time'     },
    { num: 4 as Step, label: 'Payment',  sub: 'Confirm & pay'   },
  ];

  const currentStepMeta = STEPS[step - 1];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>

      {/* ── Branded stepper header ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #383838 0%, #1a1a1a 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #ee4923 0, #ee4923 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative max-w-2xl mx-auto px-6 py-8">

          {/* Step label above */}
          <div className="text-center mb-6">
            <p className="font-lovelo text-[10px] font-black tracking-[0.3em] uppercase mb-1" style={{ color: '#ee4923' }}>
              Step {step} of 4
            </p>
            <h2 className="font-lovelo font-black text-lg text-white">{currentStepMeta.label}</h2>
            <p className="font-lovelo text-gray-400 text-xs mt-0.5" style={{ fontWeight: 300 }}>{currentStepMeta.sub}</p>
          </div>

          {/* Steps row */}
          <div className="relative">
            {/* Background track */}
            <div
              className="absolute top-5 left-0 right-0 h-px"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
            {/* Progress fill */}
            <div
              className="absolute top-5 left-0 h-px transition-all duration-500 ease-out"
              style={{
                width: `${((step - 1) / 3) * 100}%`,
                background: 'linear-gradient(90deg, #ee4923, #F4921F)',
              }}
            />

            <div className="flex justify-between relative">
              {STEPS.map((s) => {
                const done    = step > s.num;
                const current = step === s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-lovelo font-black text-sm transition-all duration-300 relative"
                      style={
                        done
                          ? { background: 'linear-gradient(135deg, #ee4923, #F4921F)', color: '#fff' }
                          : current
                          ? { background: '#fff', color: '#ee4923', boxShadow: '0 0 0 4px rgba(238,73,35,0.25)' }
                          : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.12)' }
                      }
                    >
                      {done ? <Check className="w-4 h-4" /> : s.num}
                    </div>

                    {/* Label */}
                    <p
                      className="font-lovelo font-black text-[9px] tracking-[0.15em] uppercase mt-2 transition-colors duration-300"
                      style={{ color: done || current ? '#ee4923' : 'rgba(255,255,255,0.25)' }}
                    >
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content card ── */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
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
              user={user}
            />
          )}
        </div>
      </div>
    </div>
  );
}