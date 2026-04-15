import React from 'react';
import { Droplets, Car, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SERVICES } from '../constants';
import { ServicePackage } from '../types';

interface ServicesAndRatesProps {
  onBookNow?: () => void;
  services?: ServicePackage[];
}

export default function ServicesAndRates({ onBookNow, services = SERVICES }: ServicesAndRatesProps) {
  const svc = (id: string): ServicePackage =>
    services.find(s => s.id === id) ?? (SERVICES.find(s => s.id === id) as ServicePackage);

  const fmt = (n: number | undefined) =>
    n !== undefined ? `₱${n.toLocaleString()}` : '—';

  const lubeExpressGas    = svc('lube-express-gas');
  const lubeExpressDiesel = svc('lube-express-diesel');
  const lubePremRegular   = svc('lube-premium-regular');
  const lubePremSemi      = svc('lube-premium-semi-synthetic');
  const lubePremFull      = svc('lube-premium-fully-synthetic');

  const groomInterior = svc('grooming-interior');
  const groomExterior = svc('grooming-exterior');
  const groomFull     = svc('grooming-full');
  const groomEngine   = svc('grooming-engine');
  const groomGlass    = svc('grooming-glass');

  const c1V = svc('ceramic-1yr-vehicle');
  const c3V = svc('ceramic-3yr-vehicle');
  const c5V = svc('ceramic-5yr-vehicle');
  const c1M = svc('ceramic-1yr-motorcycle');
  const c3M = svc('ceramic-3yr-motorcycle');
  const c5M = svc('ceramic-5yr-motorcycle');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>

      {/* ── Page Header ── */}
      <div className="relative overflow-hidden py-14 px-4" style={{ background: 'linear-gradient(135deg, #383838 0%, #1a1a1a 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ee4923 0, #ee4923 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-xs font-lovelo font-bold tracking-[0.35em] uppercase mb-3" style={{ color: '#ee4923' }}>
            Wash &amp; Go Auto Salon
          </p>
          <h1 className="font-lovelo text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Services &amp; Rates
          </h1>
          <p className="font-lovelo text-gray-400 max-w-xl mx-auto text-sm leading-relaxed" style={{ fontWeight: 300 }}>
            Premium auto care packages designed to protect, restore, and enhance your vehicle.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

        {/* ══ LUBE & GO ══ */}
        <section className="rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-white">
          {/* Section header */}
          <div className="flex items-center gap-3 px-8 py-5" style={{ background: 'linear-gradient(135deg, #ee4923 0%, #F4921F 100%)' }}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Droplets className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="font-lovelo text-2xl font-black text-white tracking-wide">LUBE &amp; GO</h2>
              <p className="font-lovelo text-orange-100 text-xs" style={{ fontWeight: 300 }}>Oil change &amp; maintenance services</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {/* Express */}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-5 rounded-full" style={{ backgroundColor: '#383838' }} />
                <h3 className="font-lovelo font-black text-base tracking-widest uppercase" style={{ color: '#383838' }}>Express</h3>
              </div>
              <p className="font-lovelo text-gray-400 text-xs mb-6 leading-relaxed" style={{ fontWeight: 300 }}>
                Includes: Engine Oil · Oil Filter · Labor · <span className="font-bold text-gray-500">Free Standard Car Wash</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'GAS', sub: '4 Liters', price: fmt(lubeExpressGas?.lubePrices?.GAS ?? lubeExpressGas?.prices?.SMALL) },
                  { label: 'DIESEL', sub: '7 Liters', price: fmt(lubeExpressDiesel?.lubePrices?.DIESEL ?? lubeExpressDiesel?.prices?.SMALL) },
                ].map(({ label, sub, price }) => (
                  <div key={label} className="relative group rounded-2xl border-2 border-gray-100 hover:border-orange-300 p-5 text-center transition-all duration-200 hover:shadow-md">
                    <p className="font-lovelo font-black text-sm tracking-widest mb-0.5" style={{ color: '#383838' }}>{label}</p>
                    <p className="font-lovelo text-gray-400 text-[10px] mb-3 uppercase tracking-wider">{sub}</p>
                    <p className="font-lovelo font-black text-3xl" style={{ color: '#ee4923' }}>{price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium */}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-5 rounded-full" style={{ backgroundColor: '#ee4923' }} />
                <h3 className="font-lovelo font-black text-base tracking-widest uppercase" style={{ color: '#383838' }}>Premium</h3>
              </div>
              <p className="font-lovelo text-gray-400 text-xs mb-6 leading-relaxed" style={{ fontWeight: 300 }}>
                Includes: Engine Oil · Oil Filter · Labor · Engine Flushing · <span className="font-bold text-gray-500">Free Standard Car Wash</span>
              </p>
              <div className="overflow-hidden rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: '#383838' }}>
                      <th className="font-lovelo p-3 text-left text-white text-xs tracking-wider font-black">Type</th>
                      <th className="font-lovelo p-3 text-center text-white text-xs font-black">
                        GAS<div className="text-[9px] font-normal opacity-60">4L</div>
                      </th>
                      <th className="font-lovelo p-3 text-center text-white text-xs font-black">
                        DIESEL<div className="text-[9px] font-normal opacity-60">7L</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { label: 'Regular',        gas: lubePremRegular?.lubePrices?.GAS, diesel: lubePremRegular?.lubePrices?.DIESEL },
                      { label: 'Semi-Synthetic',  gas: lubePremSemi?.lubePrices?.GAS,    diesel: lubePremSemi?.lubePrices?.DIESEL },
                      { label: 'Fully-Synthetic', gas: lubePremFull?.lubePrices?.GAS,    diesel: lubePremFull?.lubePrices?.DIESEL },
                    ].map(({ label, gas, diesel }, i) => (
                      <tr key={label} className={i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="font-lovelo p-3 font-bold text-xs" style={{ color: '#383838' }}>{label}</td>
                        <td className="font-lovelo p-3 text-center font-black text-sm" style={{ color: '#ee4923' }}>{fmt(gas)}</td>
                        <td className="font-lovelo p-3 text-center font-black text-sm" style={{ color: '#ee4923' }}>{fmt(diesel)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-lovelo text-gray-400 text-[10px] mt-3 text-center" style={{ fontWeight: 300 }}>
                ✦ Less 10% for Club Wash &amp; Go Members · Additional fee for OEM Filters
              </p>
            </div>
          </div>
        </section>

        {/* ══ AUTO GROOMING ══ */}
        <section className="rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-3 px-8 py-5" style={{ backgroundColor: '#383838' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(238,73,35,0.2)' }}>
              <Car className="w-5 h-5" style={{ color: '#ee4923' }} />
            </div>
            <div>
              <h2 className="font-lovelo text-2xl font-black text-white tracking-wide">AUTO GROOMING</h2>
              <p className="font-lovelo text-gray-400 text-xs" style={{ fontWeight: 300 }}>Interior · Exterior · Full · Engine · Glass detailing</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#ee4923' }}>
                  <th className="font-lovelo p-4 text-left text-white font-black text-xs tracking-widest uppercase">Service</th>
                  {['S', 'M', 'L', 'XL'].map(s => (
                    <th key={s} className="font-lovelo p-4 text-center text-white font-black text-sm w-24">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: 'Interior Detailing',  svc: groomInterior, note: true  },
                  { label: 'Exterior Detailing',  svc: groomExterior              },
                  { label: 'Full Detailing',       svc: groomFull,    best: true  },
                  { label: 'Engine Detailing',     svc: groomEngine               },
                  { label: 'Glass Detailing',      svc: groomGlass                },
                ].map(({ label, svc: s, note, best }, i) => (
                  <tr
                    key={label}
                    className={`transition-colors hover:bg-orange-50 ${i % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}`}
                  >
                    <td className="p-4">
                      <span className="font-lovelo font-bold text-xs" style={{ color: '#383838' }}>{label}</span>
                      {note && <span className="font-lovelo text-gray-400 text-[10px] ml-1.5" style={{ fontWeight: 300 }}>— price starts at</span>}
                      {best && (
                        <span className="ml-2 font-lovelo text-[9px] font-black text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ee4923' }}>
                          BEST VALUE
                        </span>
                      )}
                    </td>
                    {['SMALL','MEDIUM','LARGE','EXTRA_LARGE'].map(size => (
                      <td
                        key={size}
                        className={`p-4 text-center font-lovelo font-black text-sm ${best ? '' : 'text-gray-700'}`}
                        style={best ? { color: '#ee4923' } : {}}
                      >
                        {fmt(s?.prices?.[size as keyof typeof s.prices])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══ CERAMIC COATING ══ */}
        <section className="rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-3 px-8 py-5" style={{ background: 'linear-gradient(135deg, #ee4923 0%, #F4921F 100%)' }}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="font-lovelo text-2xl font-black text-white tracking-wide">CERAMIC COATING</h2>
              <p className="font-lovelo text-orange-100 text-xs" style={{ fontWeight: 300 }}>Long-term paint protection</p>
            </div>
          </div>

          {/* Inclusions banner */}
          <div className="px-6 py-3 border-b border-gray-100" style={{ backgroundColor: '#fafafa' }}>
            <p className="font-lovelo text-gray-500 text-xs text-center" style={{ fontWeight: 300 }}>
              <span className="font-black" style={{ color: '#383838' }}>Includes:</span> Standard Car Wash · Asphalt Removal · Exterior Detailing · Watermarks/Acid Rain Removal · Paint Correction
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr style={{ backgroundColor: '#383838' }}>
                  <th className="font-lovelo p-3 text-left text-white font-black tracking-wider">Protection</th>
                  <th className="font-lovelo p-3 text-center text-white font-black tracking-wider border-l border-white/10" colSpan={4}>
                    Vehicle
                  </th>
                  <th className="font-lovelo p-3 text-center text-white font-black tracking-wider border-l border-white/10" colSpan={4}>
                    Motorcycle
                  </th>
                </tr>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th className="p-3" />
                  {['S','M','L','XL','S','M','L','XL'].map((s, i) => (
                    <th key={i} className="font-lovelo p-3 text-center font-black text-xs" style={{ color: '#383838', borderLeft: i === 4 ? '1px solid #e0e0e0' : undefined }}>
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: '1 YEAR',  v: c1V, m: c1M },
                  { label: '3 YEARS', v: c3V, m: c3M },
                  { label: '5 YEARS', v: c5V, m: c5M, best: true },
                ].map(({ label, v, m, best }) => (
                  <tr key={label} className="hover:bg-orange-50 transition-colors">
                    <td className="p-4" style={{ backgroundColor: best ? '#fff5f0' : '#fafafa' }}>
                      <div className="flex items-center gap-2">
                        {best && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ee4923' }} />}
                        <span className="font-lovelo font-black text-xs" style={{ color: best ? '#ee4923' : '#383838' }}>{label}</span>
                      </div>
                    </td>
                    {[v?.prices?.SMALL, v?.prices?.MEDIUM, v?.prices?.LARGE, v?.prices?.EXTRA_LARGE,
                      m?.prices?.SMALL, m?.prices?.MEDIUM, m?.prices?.LARGE, m?.prices?.EXTRA_LARGE].map((price, i) => (
                      <td
                        key={i}
                        className="font-lovelo p-4 text-center font-black text-sm"
                        style={{
                          color: best ? '#ee4923' : '#383838',
                          borderLeft: i === 4 ? '1px solid #e5e7eb' : undefined,
                        }}
                      >
                        {fmt(price)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 text-center" style={{ backgroundColor: '#383838' }}>
            <p className="font-lovelo text-gray-400 text-[10px]" style={{ fontWeight: 300 }}>
              ✦ Less 10% discount for Club Wash &amp; Go Members only
            </p>
          </div>
        </section>

        {/* ══ CTA ══ */}
        {onBookNow && (
          <section
            className="relative overflow-hidden rounded-3xl p-12 text-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #ee4923 0%, #F4921F 100%)' }}
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/8" />
            <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full bg-black/10" />
            <div className="relative z-10">
              <h3 className="font-lovelo text-3xl font-black text-white mb-2">Ready to Book?</h3>
              <p className="font-lovelo text-orange-100 text-sm mb-8 max-w-md mx-auto" style={{ fontWeight: 300 }}>
                Give your car the premium care it deserves. Book your service now.
              </p>
              <button
                onClick={onBookNow}
                className="group inline-flex items-center gap-2.5 bg-white font-lovelo font-black text-base py-4 px-10 rounded-2xl hover:bg-gray-900 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                style={{ color: '#ee4923' }}
              >
                Book a Service Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
