import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { Search, Calendar, Clock, Car, User, AlertCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../lib/api';

export default function CheckStatus() {
    const [searchId, setSearchId] = useState('');
    const [result, setResult] = useState<Booking | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId.trim()) return;
        setLoading(true);
        try {
            const booking = await api.getBookingById(searchId.trim());
            setResult(booking);
        } catch {
            setResult(null);
        } finally {
            setHasSearched(true);
            setLoading(false);
        }
    };

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case BookingStatus.CONFIRMED: return 'bg-green-100 text-green-800 border-green-200';
            case BookingStatus.CANCELLED: return 'bg-red-100 text-red-800 border-red-200';
            case BookingStatus.COMPLETED: return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-xl mx-auto animate-fade-in pt-10">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-gray-900 italic uppercase mb-2">Track Booking</h2>
                    <p className="text-gray-500">Enter your Reference ID to check the status of your appointment.</p>
                </div>

                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="e.g. BK-170752"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all uppercase placeholder:normal-case"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-orange-600 disabled:opacity-60 transition-colors"
                    >
                        {loading ? 'Searching...' : 'CHECK STATUS'}
                    </button>
                </form>
            </div>

            {hasSearched && !result && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-center gap-4 text-red-800 animate-fade-in">
                    <AlertCircle />
                    <div>
                        <p className="font-bold">Booking Not Found</p>
                        <p className="text-sm">Please check the Reference ID and try again.</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="bg-white rounded-2xl shadow-lg border-t-4 border-orange-500 overflow-hidden animate-fade-in">
                    <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reference ID</p>
                            <p className="text-2xl font-mono font-black text-gray-900">{result.id}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(result.status)}`}>
                            {result.status}
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Car size={20} /></div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Service</p>
                                <p className="font-bold text-gray-900 text-lg">{result.serviceName}</p>
                                <p className="text-sm text-gray-500">{result.vehicleSize} {result.fuelType ? `• ${result.fuelType}` : ''}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Calendar size={20} /></div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Schedule</p>
                                <p className="font-bold text-gray-900">{result.date}</p>
                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <Clock size={14} /><span>{result.timeSlot}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-gray-100 p-3 rounded-full text-gray-600"><User size={20} /></div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Customer</p>
                                <p className="font-bold text-gray-900">{result.customerName}</p>
                                <p className="text-sm text-gray-500">{result.customerPhone}</p>
                            </div>
                        </div>
                    </div>

                    {result.updates && result.updates.length > 0 && (
                        <div className="p-6 border-t border-gray-100 bg-white">
                            <h3 className="text-lg font-black italic text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare size={20} className="text-orange-500" />PROGRESS UPDATES
                            </h3>
                            <div className="space-y-6">
                                {result.updates.map((update) => (
                                    <div key={update.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative">
                                        <div className="absolute -left-2 top-6 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow-sm" />
                                        <div className="mb-2 text-xs font-bold text-gray-400">
                                            {format(new Date(update.timestamp), 'MMM d, h:mm a')}
                                        </div>
                                        <p className="text-gray-800 font-medium mb-3">{update.message}</p>
                                        {update.imageUrl && (
                                            <div className="rounded-lg overflow-hidden border border-gray-200">
                                                <img src={update.imageUrl} alt="Update" className="w-full h-auto max-h-64 object-cover" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="px-6 py-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
                        Booked on {new Date(result.createdAt).toLocaleDateString()}
                    </div>
                </div>
            )}
        </div>
    );
}
