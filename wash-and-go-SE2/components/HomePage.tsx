import React from 'react';
import { Star, CheckCircle2, ChevronRight, Sparkles, Droplets, Car, Shield, PaintBucket, SprayCan, ArrowRight } from 'lucide-react';

// Import logo paths
import wurthLogo from '../assets/wurth-logo.png';
import hpureLogo from '../assets/hpure_logo.png';
import iglLogo from '../assets/unnamed.png';
import ppfLogo from '../assets/241752745_534617887876066_3022425563898577722_n-Photoroom.png';

interface HomePageProps {
  onViewChange: (view: 'HOME' | 'CLIENT' | 'ADMIN' | 'SERVICES' | 'STATUS') => void;
}

const services = [
  { icon: <Car className="w-8 h-8" />, title: 'Car Wash', desc: 'Quick and efficient exterior washing to remove dirt, dust, and grime.' },
  { icon: <Sparkles className="w-8 h-8" />, title: 'Auto Detailing', desc: 'Deep interior and exterior cleaning that restores your car\'s original shine.' },
  { icon: <Droplets className="w-8 h-8" />, title: 'Oil Change', desc: 'Professional oil replacement to keep your engine running smoothly.' },
  { icon: <Shield className="w-8 h-8" />, title: 'Rust Proofing', desc: 'Protect your vehicle from corrosion and extend its lifespan.' },
  { icon: <PaintBucket className="w-8 h-8" />, title: 'Ceramic Coating', desc: 'Advanced coating that protects your car\'s paint and provides long-lasting shine.' },
  { icon: <SprayCan className="w-8 h-8" />, title: 'Interior Cleaning', desc: 'Complete vacuuming, dashboard cleaning, and upholstery care.' },
];

const whyChooseUs = [
  'Professional and experienced staff',
  'High-quality cleaning products',
  'Affordable service packages',
  'Fast and efficient service',
  'Customer satisfaction guaranteed',
];

const steps = [
  { num: '1', title: 'Bring Your Car', desc: 'Bring your car to our auto salon' },
  { num: '2', title: 'Choose a Service', desc: 'Choose your preferred service' },
  { num: '3', title: 'We Clean & Detail', desc: 'Our experts clean and detail your vehicle' },
  { num: '4', title: 'Drive Away Happy', desc: 'Drive away with a fresh, shiny car' },
];

const partnerLogos = [wurthLogo, hpureLogo, iglLogo, ppfLogo];

export default function HomePage({ onViewChange }: HomePageProps) {
  return (
    <div className="w-full">

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden py-24 md:py-36 px-4" style={{ background: 'linear-gradient(135deg, #000000 0%, #383838 40%, #ee4923 100%)' }}>
        {/* Decorative blurred circles */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: '#ee4923' }}></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: '#F4921F' }}></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="inline-block font-semibold text-sm tracking-widest uppercase mb-4 rounded-full px-4 py-1.5 backdrop-blur-sm" style={{ color: '#F4921F', border: '1px solid rgba(238,73,35,0.3)', backgroundColor: 'rgba(238,73,35,0.1)' }}>
            Premium Car Care
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
            Premium Car Care<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #ee4923, #F4921F)' }}>Starts Here</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            At Wash & Go Auto Salon, we provide professional car cleaning, detailing, and maintenance services designed to keep your vehicle looking brand new. From quick washes to full detailing and protective treatments, we deliver quality care for every car.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onViewChange('CLIENT')}
              className="group text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#ee4923', boxShadow: '0 10px 25px rgba(238,73,35,0.3)' }}
            >
              Book a Service
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onViewChange('SERVICES')}
              className="group bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              View Our Services
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(to top, #f5f5f5, transparent)' }}></div>
      </section>

      {/* ==================== PARTNER LOGOS ==================== */}
      <section className="py-10 border-b border-gray-200" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <p className="text-center text-xs font-semibold uppercase tracking-widest" style={{ color: '#383838' }}>Trusted by leading brands</p>
        </div>
        <div className="relative overflow-hidden w-full"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
        >
          <div
            className="flex items-center w-max"
            style={{ animation: 'scroll-logos 20s linear infinite' }}
          >
            {[...Array(6)].map((_, setIdx) =>
              partnerLogos.map((logo, i) => (
                <img
                  key={`${setIdx}-${i}`}
                  src={logo}
                  alt="Partner logo"
                  className="h-10 md:h-14 mx-8 md:mx-12 object-contain"
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ==================== ABOUT US ==================== */}
      <section className="py-20 md:py-28 px-4" style={{ background: 'linear-gradient(180deg, #f5f5f5 0%, #ffffff 50%, #f5f5f5 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-semibold text-sm uppercase tracking-widest mb-3" style={{ color: '#ee4923' }}>Who We Are</p>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#383838' }}>About Wash & Go Auto Salon</h2>
          <div className="w-16 h-1 rounded-full mx-auto mb-8" style={{ backgroundImage: 'linear-gradient(to right, #ee4923, #F4921F)' }}></div>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Wash & Go Auto Salon is your trusted destination for professional car care services. Our goal is to provide high-quality cleaning, detailing, and maintenance solutions that keep your vehicle looking its best.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            With a team of experienced professionals and modern equipment, we ensure every vehicle receives detailed attention and premium treatment. Our services are designed to restore shine, protect surfaces, and maintain your car's value.
          </p>
        </div>
      </section>

      {/* ==================== OUR SERVICES ==================== */}
      <section className="py-20 md:py-28 px-4" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-semibold text-sm uppercase tracking-widest mb-3" style={{ color: '#ee4923' }}>What We Offer</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#383838' }}>Our Services</h2>
            <div className="w-16 h-1 rounded-full mx-auto" style={{ backgroundImage: 'linear-gradient(to right, #ee4923, #F4921F)' }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc, idx) => (
              <div
                key={idx}
                className="group rounded-2xl p-8 border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-default"
                style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundColor: 'rgba(238,73,35,0.08)',
                    color: '#ee4923',
                  }}
                >
                  <div className="group-hover:text-white transition-colors duration-300" style={{ color: 'inherit' }}>
                    {svc.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#383838' }}>{svc.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{svc.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onViewChange('SERVICES')}
              className="group inline-flex items-center gap-2 font-bold transition-colors text-lg"
              style={{ color: '#ee4923' }}
            >
              View Full Pricing & Rates
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section className="py-20 md:py-28 px-4" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-semibold text-sm uppercase tracking-widest mb-3" style={{ color: '#ee4923' }}>Our Promise</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#383838' }}>Why Choose Wash & Go Auto Salon?</h2>
            <div className="w-16 h-1 rounded-full mx-auto" style={{ backgroundImage: 'linear-gradient(to right, #ee4923, #F4921F)' }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-2xl mx-auto">
            {whyChooseUs.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'rgba(238,73,35,0.1)' }}>
                  <CheckCircle2 className="w-5 h-5 transition-colors duration-300" style={{ color: '#ee4923' }} />
                </div>
                <p className="font-medium pt-1" style={{ color: '#383838' }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-20 md:py-28 px-4" style={{ background: 'linear-gradient(135deg, #000000, #383838)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-semibold text-sm uppercase tracking-widest mb-3" style={{ color: '#F4921F' }}>Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">How It Works</h2>
            <div className="w-16 h-1 rounded-full mx-auto" style={{ backgroundImage: 'linear-gradient(to right, #ee4923, #F4921F)' }}></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center relative">
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5" style={{ backgroundImage: 'linear-gradient(to right, rgba(238,73,35,0.5), transparent)' }}></div>
                )}
                <div
                  className="w-16 h-16 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-5 shadow-lg hover:scale-110 transition-transform duration-300 rotate-3 hover:rotate-0"
                  style={{ backgroundImage: 'linear-gradient(135deg, #ee4923, #F4921F)', boxShadow: '0 10px 25px rgba(238,73,35,0.3)' }}
                >
                  {step.num}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CALL TO ACTION ==================== */}
      <section className="relative overflow-hidden py-20 md:py-28 px-4" style={{ background: 'linear-gradient(135deg, #ee4923, #F4921F)' }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full opacity-5 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            Give Your Car the Care<br />It Deserves
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-10 leading-relaxed max-w-xl mx-auto">
            Visit Wash & Go Auto Salon today and experience premium car care services designed to keep your vehicle clean, protected, and shining.
          </p>
          <button
            onClick={() => onViewChange('CLIENT')}
            className="group bg-white font-bold py-4 px-10 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-xl shadow-black/10 hover:-translate-y-1 hover:shadow-2xl text-lg flex items-center gap-2 mx-auto"
            style={{ color: '#ee4923' }}
          >
            Book Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

    </div>
  );
}
