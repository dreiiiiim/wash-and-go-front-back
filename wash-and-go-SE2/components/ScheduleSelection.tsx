import React, { useState, useEffect } from 'react';
import { TIME_SLOTS } from '../constants';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { api } from '../lib/api';

interface ScheduleSelectionProps {
  onSelect: (date: string, time: string, plateNumber: string) => void;
  onBack: () => void;
  serviceDuration: number;
  serviceCategory?: string;
}

export default function ScheduleSelection({ onSelect, onBack, serviceDuration, serviceCategory }: ScheduleSelectionProps) {
  const today = startOfToday();
  const [selectedDate, setSelectedDate] = useState<string>(format(addDays(today, 1), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [plateNumber, setPlateNumber] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime('');
    api.getBookedSlots(selectedDate, serviceCategory)
      .then(setBookedSlots)
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, serviceCategory]);

  // Returns true if the time slot is in the past for today (Philippine Standard Time, UTC+8)
  const isPastTime = (time: string): boolean => {
    const todayPH = format(
      new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })),
      'yyyy-MM-dd'
    );
    if (selectedDate !== todayPH) return false;

    // Parse the slot time (e.g. "03:00 PM") into today's PH DateTime
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const nowPH = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const slotPH = new Date(nowPH);
    slotPH.setHours(hours, minutes, 0, 0);

    return slotPH <= nowPH;
  };

  const isAvailable = (time: string) => !bookedSlots.includes(time);

  const handleContinue = () => {
    if (selectedDate && selectedTime && plateNumber.trim()) {
      onSelect(selectedDate, selectedTime, plateNumber.trim());
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h2 className="text-3xl italic font-black text-gray-900 mb-8 text-center">SELECT SCHEDULE</h2>

      <div className="mb-8">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          <CalendarIcon size={14} /> Preferred Date
        </label>
        <input
          type="date"
          min={format(today, 'yyyy-MM-dd')}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 appearance-none"
        />
      </div>

      <div className="mb-10">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          <Clock size={14} /> {loadingSlots ? 'Checking availability...' : 'Available Slots'}
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TIME_SLOTS.map((time) => {
            const available = isAvailable(time);
            const past = isPastTime(time);
            const disabled = !available || past || loadingSlots;
            return (
              <button
                key={time}
                disabled={disabled}
                onClick={(e) => {
                  if (disabled) {
                    e.preventDefault();
                    return;
                  }
                  setSelectedTime(time);
                }}
                className={`py-3 px-2 rounded-lg text-sm font-bold border transition-all ${
                  disabled
                    ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed opacity-70 pointer-events-none'
                    : selectedTime === time
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                {time}
                {past && <span className="block text-[10px] font-normal">Past</span>}
                {!past && !available && <span className="block text-[10px] font-normal">Fully Booked</span>}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">* Note: Service duration is approx {serviceDuration} hours.</p>
      </div>

      <div className="mb-10">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Vehicle Plate Number
        </label>
        <input
          type="text"
          required
          value={plateNumber}
          onChange={e => setPlateNumber(e.target.value)}
          placeholder="e.g. ABC 1234"
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 uppercase"
        />
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900">BACK</button>
        <button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime || !plateNumber.trim()}
          className={`px-8 py-3 rounded-lg font-bold text-white transition-colors ${
            selectedDate && selectedTime && plateNumber.trim() ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          PROCEED
        </button>
      </div>
    </div>
  );
}
