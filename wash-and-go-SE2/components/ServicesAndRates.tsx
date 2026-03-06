import React from 'react';
import { CheckCircle2, Droplets, Car, ShieldCheck, ArrowRight } from 'lucide-react';

interface ServicesAndRatesProps {
  onBookNow?: () => void;
}

export default function ServicesAndRates({ onBookNow }: ServicesAndRatesProps) {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-12 pb-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-gray-900 italic uppercase mb-4">Services Offered</h2>
        <p className="text-gray-500 max-w-2xl mx-auto mb-6">
          Explore our premium auto detailing packages designed to protect and enhance your vehicle.
        </p>
      </div>

      {/* LUBE & GO Section */}
      <section className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 flex items-center justify-center gap-3" style={{ backgroundImage: 'linear-gradient(to right, #ee4923, #F4921F)' }}>
          <Droplets className="text-white w-8 h-8" />
          <h3 className="text-3xl font-black text-white italic tracking-wider">LUBE & GO</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          
          {/* EXPRESS */}
          <div className="p-8">
            <div className="bg-gray-800 text-white text-center py-2 font-bold text-xl uppercase tracking-widest mb-6 rounded">
              EXPRESS
            </div>
            <p className="text-sm text-gray-500 text-center italic mb-6 px-4">
              INCLUSIONS: Engine Oil, Oil Filter, Labor, FREE Standard Car Wash
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center hover:border-orange-500 transition-colors">
                <div className="font-black text-gray-900 text-xl mb-1">GAS</div>
                <div className="text-xs text-gray-500 font-bold mb-4">4 LITERS</div>
                <div className="text-sm text-gray-400">PHP</div>
                <div className="text-4xl font-black text-gray-900">1,400</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center hover:border-orange-500 transition-colors">
                <div className="font-black text-gray-900 text-xl mb-1">DIESEL</div>
                <div className="text-xs text-gray-500 font-bold mb-4">7 LITERS</div>
                <div className="text-sm text-gray-400">PHP</div>
                <div className="text-4xl font-black text-gray-900">1,900</div>
              </div>
            </div>
          </div>

          {/* PREMIUM */}
          <div className="p-8">
            <div className="text-white text-center py-2 font-bold text-xl uppercase tracking-widest mb-6 rounded" style={{ backgroundColor: '#ee4923' }}>
              PREMIUM
            </div>
             <p className="text-sm text-gray-500 text-center italic mb-6 px-4">
              INCLUSIONS: Engine Oil, Oil Filter, Labor, Engine Flushing, FREE Standard Car Wash
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="p-3 text-left">TYPE</th>
                    <th className="p-3 text-center w-1/3">
                      <div>GAS</div>
                      <div className="text-[10px] font-normal opacity-75">4 LITERS</div>
                    </th>
                    <th className="p-3 text-center w-1/3">
                      <div>DIESEL</div>
                      <div className="text-[10px] font-normal opacity-75">7 LITERS</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 font-bold text-gray-700">REGULAR</td>
                    <td className="p-3 text-center font-bold text-gray-900">1,650</td>
                    <td className="p-3 text-center font-bold text-gray-900">2,250</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 font-bold text-gray-700">SEMI-SYNTHETIC</td>
                    <td className="p-3 text-center font-bold text-gray-900">2,250</td>
                    <td className="p-3 text-center font-bold text-gray-900">3,300</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-700">FULLY-SYNTHETIC</td>
                    <td className="p-3 text-center font-bold text-gray-900">2,650</td>
                    <td className="p-3 text-center font-bold text-gray-900">4,250</td>
                  </tr>
                </tbody>
              </table>
            </div>
             <p className="text-[10px] text-gray-400 text-center mt-4">
               Note: Less 10% discount applies for Club Wash & Go Member only. Additional fee applies for OEM Oil Filters.
            </p>
          </div>
        </div>
      </section>

      {/* AUTO GROOMING Section */}
      <section className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
         <div className="p-6 flex items-center justify-center gap-3" style={{ backgroundColor: '#383838' }}>
          <Car className="text-orange-500 w-8 h-8" />
          <h3 className="text-3xl font-black text-white italic tracking-wider uppercase">Auto Grooming</h3>
        </div>

        <div className="p-0 overflow-x-auto">
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
              <tr className="hover:bg-orange-50 transition-colors">
                <td className="p-4">Interior Detailing <span className="text-xs text-gray-400 font-normal">- Price starts at</span></td>
                <td className="p-4 text-center">2,700</td>
                <td className="p-4 text-center">3,700</td>
                <td className="p-4 text-center">4,500</td>
                <td className="p-4 text-center">5,200</td>
              </tr>
              <tr className="hover:bg-orange-50 transition-colors bg-gray-50">
                <td className="p-4">Exterior Detailing</td>
                <td className="p-4 text-center">3,800</td>
                <td className="p-4 text-center">4,800</td>
                <td className="p-4 text-center">5,800</td>
                <td className="p-4 text-center">6,800</td>
              </tr>
               <tr className="hover:bg-orange-50 transition-colors">
                <td className="p-4">Full Detailing</td>
                <td className="p-4 text-center font-bold text-orange-600">5,500</td>
                <td className="p-4 text-center font-bold text-orange-600">7,300</td>
                <td className="p-4 text-center font-bold text-orange-600">8,800</td>
                <td className="p-4 text-center font-bold text-orange-600">9,500</td>
              </tr>
               <tr className="hover:bg-orange-50 transition-colors bg-gray-50">
                <td className="p-4">Engine Detailing</td>
                <td className="p-4 text-center">1,000</td>
                <td className="p-4 text-center">1,250</td>
                <td className="p-4 text-center">1,500</td>
                <td className="p-4 text-center">1,700</td>
              </tr>
               <tr className="hover:bg-orange-50 transition-colors">
                <td className="p-4">Glass Detailing</td>
                <td className="p-4 text-center">2,000</td>
                <td className="p-4 text-center">2,100</td>
                <td className="p-4 text-center">2,300</td>
                <td className="p-4 text-center">2,500</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CERAMIC COATING Section */}
      <section className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
         <div className="p-6 flex items-center justify-center gap-3" style={{ backgroundColor: '#ee4923' }}>
          <ShieldCheck className="text-white w-8 h-8" />
          <h3 className="text-3xl font-black text-white italic tracking-wider uppercase">Ceramic Coating</h3>
        </div>
        
        <div className="bg-gray-100 p-4 text-center text-xs md:text-sm text-gray-600 border-b border-gray-200">
          <span className="font-bold">INCLUSIONS:</span> Standard Car Wash, Asphalt Removal, Exterior Detailing, Watermarks/ Acid Rain Removal, Paint Correction (Double Step Buffing)
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm lg:text-base">
            <thead>
              <tr className="bg-gray-800 text-white text-xs md:text-sm">
                <th className="p-3 text-left w-1/5">PROTECTION</th>
                <th className="p-3 text-center border-l border-gray-700 bg-gray-900" colSpan={4}>VEHICLE</th>
                <th className="p-3 text-center border-l border-gray-700 bg-gray-900" colSpan={4}>MOTORCYCLE</th>
              </tr>
              <tr className="bg-gray-200 text-gray-800 text-xs font-bold">
                <th className="p-3"></th>
                <th className="p-3 text-center w-[10%]">S</th>
                <th className="p-3 text-center w-[10%]">M</th>
                <th className="p-3 text-center w-[10%]">L</th>
                <th className="p-3 text-center w-[10%] border-r border-gray-300">XL</th>
                <th className="p-3 text-center w-[10%]">S</th>
                <th className="p-3 text-center w-[10%]">M</th>
                <th className="p-3 text-center w-[10%]">L</th>
                <th className="p-3 text-center w-[10%]">XL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium text-gray-700">
              <tr className="hover:bg-orange-50 transition-colors">
                <td className="p-4 font-bold bg-gray-50">1 YEAR</td>
                <td className="p-4 text-center">9,500</td>
                <td className="p-4 text-center">10,500</td>
                <td className="p-4 text-center">11,500</td>
                <td className="p-4 text-center border-r border-gray-100">12,500</td>
                <td className="p-4 text-center">2,750</td>
                <td className="p-4 text-center">2,850</td>
                <td className="p-4 text-center">3,000</td>
                <td className="p-4 text-center">3,250</td>
              </tr>
              <tr className="hover:bg-orange-50 transition-colors">
                <td className="p-4 font-bold bg-gray-50">3 YEARS</td>
                <td className="p-4 text-center">11,000</td>
                <td className="p-4 text-center">12,000</td>
                <td className="p-4 text-center">13,000</td>
                <td className="p-4 text-center border-r border-gray-100">15,000</td>
                <td className="p-4 text-center">3,000</td>
                <td className="p-4 text-center">3,200</td>
                <td className="p-4 text-center">3,350</td>
                <td className="p-4 text-center">3,600</td>
              </tr>
              <tr className="hover:bg-orange-50 transition-colors">
                <td className="p-4 font-bold bg-gray-50">5 YEARS</td>
                <td className="p-4 text-center font-bold text-orange-600">14,000</td>
                <td className="p-4 text-center font-bold text-orange-600">15,000</td>
                <td className="p-4 text-center font-bold text-orange-600">16,000</td>
                <td className="p-4 text-center font-bold text-orange-600 border-r border-gray-100">18,000</td>
                <td className="p-4 text-center">3,300</td>
                <td className="p-4 text-center">3,500</td>
                <td className="p-4 text-center">3,700</td>
                <td className="p-4 text-center">3,900</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-white text-[10px] md:text-xs p-3 text-center" style={{ backgroundColor: '#383838' }}>
             Note: Less 10% discount applies for Club Wash & Go Member only.
        </div>
      </section>

      {/* CTA Section */}
      {onBookNow && (
        <section className="rounded-2xl p-10 text-center shadow-lg" style={{ backgroundImage: 'linear-gradient(to right, #ee4923, #F4921F)' }}>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Ready to Book?</h3>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Give your car the premium care it deserves. Book your service now and experience the Wash & Go difference.
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