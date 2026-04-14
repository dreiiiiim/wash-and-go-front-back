import React from 'react';
import { Droplets, Car, ShieldCheck, ArrowRight } from 'lucide-react';
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
    n !== undefined ? `₱${n.toLocaleString()}` : '-';

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
    <div className="max-w-6xl mx-auto animate-fade-in space-y-12 pb-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-gray-900 italic uppercase mb-4">Services Offered</h2>
        <p className="text-gray-500 max-w-2xl mx-auto mb-6">
          Explore our premium auto detailing packages designed to protect and enhance your vehicle.
        </p>
      </div>

      {/* LUBE & GO */}
      <section className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 flex items-center justify-center gap-3" style={{ backgroundImage: 'linear-gradient(to right, #ee4923, #F4921F)' }}>
          <Droplets className="text-white w-8 h-8" />
          <h3 className="text-3xl font-black text-white italic tracking-wider">LUBE &amp; GO</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {/* Express */}
          <div className="p-8">
            <div className="bg-gray-800 text-white text-center py-2 font-bold text-xl uppercase tracking-widest mb-6 rounded">EXPRESS</div>
            <p className="text-sm text-gray-500 text-center italic mb-6 px-4">
              INCLUSIONS: Engine Oil, Oil Filter, Labor, FREE Standard Car Wash
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center hover:border-orange-500 transition-colors">
                <div className="font-black text-gray-900 text-xl mb-1">GAS</div>
                <div className="text-xs text-gray-500 font-bold mb-4">4 LITERS</div>
                <div className="text-4xl font-black text-gray-900">{fmt(lubeExpressGas?.lubePrices?.GAS ?? lubeExpressGas?.prices?.SMALL)}</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center hover:border-orange-500 transition-colors">
                <div className="font-black text-gray-900 text-xl mb-1">DIESEL</div>
                <div className="text-xs text-gray-500 font-bold mb-4">7 LITERS</div>
                <div className="text-4xl font-black text-gray-900">{fmt(lubeExpressDiesel?.lubePrices?.DIESEL ?? lubeExpressDiesel?.prices?.SMALL)}</div>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div className="p-8">
            <div className="text-white text-center py-2 font-bold text-xl uppercase tracking-widest mb-6 rounded" style={{ backgroundColor: '#ee4923' }}>PREMIUM</div>
            <p className="text-sm text-gray-500 text-center italic mb-6 px-4">
              INCLUSIONS: Engine Oil, Oil Filter, Labor, Engine Flushing, FREE Standard Car Wash
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="p-3 text-left">TYPE</th>
                    <th className="p-3 text-center w-1/3"><div>GAS</div><div className="text-[10px] font-normal opacity-75">4 LITERS</div></th>
                    <th className="p-3 text-center w-1/3"><div>DIESEL</div><div className="text-[10px] font-normal opacity-75">7 LITERS</div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 font-bold text-gray-700">REGULAR</td>
                    <td className="p-3 text-center font-bold text-gray-900">{fmt(lubePremRegular?.lubePrices?.GAS)}</td>
                    <td className="p-3 text-center font-bold text-gray-900">{fmt(lubePremRegular?.lubePrices?.DIESEL)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 font-bold text-gray-700">SEMI-SYNTHETIC</td>
                    <td className="p-3 text-center font-bold text-gray-900">{fmt(lubePremSemi?.lubePrices?.GAS)}</td>
                    <td className="p-3 text-center font-bold text-gray-900">{fmt(lubePremSemi?.lubePrices?.DIESEL)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-700">FULLY-SYNTHETIC</td>
                    <td className="p-3 text-center font-bold text-gray-900">{fmt(lubePremFull?.lubePrices?.GAS)}</td>
                    <td className="p-3 text-center font-bold text-gray-900">{fmt(lubePremFull?.lubePrices?.DIESEL)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-4">
              Note: Less 10% discount for Club Wash &amp; Go Members. Additional fee for OEM Oil Filters.
            </p>
          </div>
        </div>
      </section>

      {/* AUTO GROOMING */}
      <section className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 flex items-center justify-center gap-3" style={{ backgroundColor: '#383838' }}>
          <Car className="text-orange-500 w-8 h-8" />
          <h3 className="text-3xl font-black text-white italic tracking-wider uppercase">Auto Grooming</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm lg:text-base">
            <thead>
              <tr style={{ backgroundColor: '#ee4923' }} className="text-white">
                <th className="p-4 text-left font-bold italic uppercase tracking-wider w-1/3">Services</th>
                <th className="p-4 text-center font-bold w-1/6">S</th>
                <th className="p-4 text-center font-bold w-1/6">M</th>
                <th className="p-4 text-center font-bold w-1/6">L</th>
                <th className="p-4 text-center font-bold w-1/6">XL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium text-gray-700">
              {[
                { label: 'Interior Detailing', svc: groomInterior, note: true },
                { label: 'Exterior Detailing', svc: groomExterior },
                { label: 'Full Detailing', svc: groomFull, highlight: true },
                { label: 'Engine Detailing', svc: groomEngine },
                { label: 'Glass Detailing', svc: groomGlass },
              ].map(({ label, svc: s, note, highlight }, i) => (
                <tr key={label} className={`hover:bg-orange-50 transition-colors${i % 2 === 1 ? ' bg-gray-50' : ''}`}>
                  <td className="p-4">{label}{note && <span className="text-xs text-gray-400 font-normal"> - Price starts at</span>}</td>
                  <td className={`p-4 text-center${highlight ? ' font-bold text-orange-600' : ''}`}>{fmt(s?.prices?.SMALL)}</td>
                  <td className={`p-4 text-center${highlight ? ' font-bold text-orange-600' : ''}`}>{fmt(s?.prices?.MEDIUM)}</td>
                  <td className={`p-4 text-center${highlight ? ' font-bold text-orange-600' : ''}`}>{fmt(s?.prices?.LARGE)}</td>
                  <td className={`p-4 text-center${highlight ? ' font-bold text-orange-600' : ''}`}>{fmt(s?.prices?.EXTRA_LARGE)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CERAMIC COATING */}
      <section className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 flex items-center justify-center gap-3" style={{ backgroundColor: '#ee4923' }}>
          <ShieldCheck className="text-white w-8 h-8" />
          <h3 className="text-3xl font-black text-white italic tracking-wider uppercase">Ceramic Coating</h3>
        </div>
        <div className="bg-gray-100 p-4 text-center text-xs md:text-sm text-gray-600 border-b border-gray-200">
          <span className="font-bold">INCLUSIONS:</span> Standard Car Wash, Asphalt Removal, Exterior Detailing, Watermarks/Acid Rain Removal, Paint Correction
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm lg:text-base">
            <thead>
              <tr className="bg-gray-800 text-white text-xs md:text-sm">
                <th className="p-3 text-left w-1/5">PROTECTION</th>
                <th className="p-3 text-center border-l border-gray-700 bg-gray-900" colSpan={4}>VEHICLE</th>
                <th className="p-3 text-center border-l border-gray-700 bg-gray-900" colSpan={4}>MOTORCYCLE</th>
              </tr>
              <tr className="bg-gray-200 text-gray-800 text-xs font-bold">
                <th className="p-3"></th>
                <th className="p-3 text-center">S</th><th className="p-3 text-center">M</th><th className="p-3 text-center">L</th><th className="p-3 text-center border-r border-gray-300">XL</th>
                <th className="p-3 text-center">S</th><th className="p-3 text-center">M</th><th className="p-3 text-center">L</th><th className="p-3 text-center">XL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium text-gray-700">
              {[
                { label: '1 YEAR', v: c1V, m: c1M },
                { label: '3 YEARS', v: c3V, m: c3M },
                { label: '5 YEARS', v: c5V, m: c5M, highlight: true },
              ].map(({ label, v, m, highlight }) => (
                <tr key={label} className="hover:bg-orange-50 transition-colors">
                  <td className="p-4 font-bold bg-gray-50">{label}</td>
                  <td className={`p-4 text-center${highlight ? ' font-bold text-orange-600' : ''}`}>{fmt(v?.prices?.SMALL)}</td>
                  <td className={`p-4 text-center${highlight ? ' font-bold text-orange-600' : ''}`}>{fmt(v?.prices?.MEDIUM)}</td>
                  <td className={`p-4 text-center${highlight ? ' font-bold text-orange-600' : ''}`}>{fmt(v?.prices?.LARGE)}</td>
                  <td className={`p-4 text-center border-r border-gray-100${highlight ? ' font-bold text-orange-600' : ''}`}>{fmt(v?.prices?.EXTRA_LARGE)}</td>
                  <td className="p-4 text-center">{fmt(m?.prices?.SMALL)}</td>
                  <td className="p-4 text-center">{fmt(m?.prices?.MEDIUM)}</td>
                  <td className="p-4 text-center">{fmt(m?.prices?.LARGE)}</td>
                  <td className="p-4 text-center">{fmt(m?.prices?.EXTRA_LARGE)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-white text-[10px] md:text-xs p-3 text-center" style={{ backgroundColor: '#383838' }}>
          Note: Less 10% discount applies for Club Wash &amp; Go Members only.
        </div>
      </section>

      {/* CTA */}
      {onBookNow && (
        <section className="rounded-2xl p-10 text-center shadow-lg" style={{ backgroundImage: 'linear-gradient(to right, #ee4923, #F4921F)' }}>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Ready to Book?</h3>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Give your car the premium care it deserves. Book your service now.
          </p>
          <button
            onClick={onBookNow}
            className="group inline-flex items-center gap-2 bg-white font-bold py-3 px-10 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:-translate-y-0.5 text-lg"
            style={{ color: '#ee4923' }}
          >
            Book a Service Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>
      )}
    </div>
  );
}