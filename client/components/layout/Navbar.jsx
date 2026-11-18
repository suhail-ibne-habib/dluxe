"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Plane, Shield, Crown, Sparkles, Phone, MessageSquare, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('590690695079');
  const [displayNumber, setDisplayNumber] = useState('+590 690 69 50 79');
  const servicesDropdownRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.whatsapp) {
            setPhoneNumber(data.whatsapp.replace(/[^\d+]/g, ''));
            setDisplayNumber(data.whatsapp);
          }
        }
      } catch (e) { }
    };
    fetchSettings();

    const handleClickOutside = (event) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const waLink = phoneNumber ? `https://wa.me/${phoneNumber.replace('+', '')}` : '#';

  const servicesList = [
    {
      title: "VIP Meet & Greet",
      desc: "Fast-track escort, luggage porterage & immigration assistance",
      href: "/booking?service=VIP+Meet+%26+Greet",
      icon: <Shield className="w-5 h-5 text-[#ea580c]" />
    },
    {
      title: "VIP Terminal",
      desc: "Private standalone terminal with discrete tarmac transfers",
      href: "/booking?service=VIP+Terminal",
      icon: <Crown className="w-5 h-5 text-[#ea580c]" />
    },
    {
      title: "VIP Private Suite",
      desc: "Soundproof secluded luxury suites before takeoff",
      href: "/booking?service=VIP+Private+Suite",
      icon: <Sparkles className="w-5 h-5 text-[#ea580c]" />
    },
    {
      title: "Private Jet Charter",
      desc: "Custom private aircraft charters throughout the Caribbean & worldwide",
      href: "/charter",
      icon: <Plane className="w-5 h-5 text-[#ea580c]" />
    }
  ];

  return (
    <>
      <nav className="absolute top-0 w-full z-50 flex justify-between items-center py-5 px-4 md:px-12 text-white">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src="/dluxe-logo.jpg" alt="D'LUXE Logo" className="h-16 md:h-20 w-auto object-contain rounded-xl shadow-md" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-7 font-medium text-sm tracking-wide">
          {/* Services Dropdown */}
          <div className="relative" ref={servicesDropdownRef}>
            <button
              onClick={() => setIsServicesOpen(!isServicesOpen)}
              onMouseEnter={() => setIsServicesOpen(true)}
              className="flex items-center gap-1.5 py-2 uppercase tracking-wider font-bold text-gray-200 hover:text-[#ea580c] transition-colors focus:outline-none"
            >
              <span>Our Services</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? "rotate-180 text-[#ea580c]" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isServicesOpen && (
              <div 
                onMouseLeave={() => setIsServicesOpen(false)}
                className="absolute top-full left-0 w-80 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-100 py-3 mt-1 animate-in fade-in slide-in-from-top-2 duration-200 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available Packages</span>
                  <Link href="/services" onClick={() => setIsServicesOpen(false)} className="text-[11px] font-bold text-[#ea580c] hover:underline">
                    View All
                  </Link>
                </div>
                
                <div className="py-1">
                  {servicesList.map((srv, idx) => (
                    <Link
                      key={idx}
                      href={srv.href}
                      onClick={() => setIsServicesOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-orange-50/60 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-100/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        {srv.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-[#ea580c] transition-colors">
                          {srv.title}
                        </p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">
                          {srv.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="p-3 bg-gray-50/80 border-t border-gray-100 mx-2 rounded-xl mt-1">
                  <Link
                    href="/#services"
                    onClick={() => setIsServicesOpen(false)}
                    className="flex items-center justify-between text-xs font-bold text-gray-700 hover:text-[#ea580c] transition-colors"
                  >
                    <span>Browse Service Comparison</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Airport VIP (Renamed from Locations) */}
          <Link href="/locations" className="hover:text-[#ea580c] transition-colors py-2 uppercase tracking-wider font-bold text-gray-200">
            Airport VIP
          </Link>

          {/* Charter Page Link */}
          <Link href="/charter" className="hover:text-[#ea580c] transition-colors py-2 uppercase tracking-wider font-bold text-gray-200">
            Charter
          </Link>

          {/* Reviews Link */}
          <Link href="/#reviews" className="hover:text-[#ea580c] transition-colors py-2 uppercase tracking-wider font-bold text-gray-200">
            Reviews
          </Link>

          {/* Contact Us Link */}
          <Link href="/contact" className="hover:text-[#ea580c] transition-colors py-2 uppercase tracking-wider font-bold text-gray-200">
            Contact Us
          </Link>

          {/* WhatsApp CTA */}
          <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-[#25D366] hover:bg-green-600 flex items-center gap-2 text-white px-5 py-2.5 rounded-full border border-[#25D366] hover:border-green-600 font-bold transition-all shadow-lg shadow-[#25D366]/20 ml-2"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            <span className="tracking-wide text-xs">{displayNumber}</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-white hover:text-[#ea580c] transition-colors p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0f172a]/98 backdrop-blur-md flex flex-col justify-between p-6 pt-28 text-white lg:hidden animate-in fade-in duration-200 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {/* Services Accordion */}
            <div className="border-b border-gray-800 pb-3">
              <button
                onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                className="flex items-center justify-between w-full text-xl font-bold hover:text-[#ea580c] transition-colors py-2"
              >
                <span>Our Services</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${isMobileServicesOpen ? "rotate-180 text-[#ea580c]" : ""}`} />
              </button>

              {isMobileServicesOpen && (
                <div className="pl-4 mt-2 space-y-3 animate-in fade-in slide-in-from-top-1">
                  {servicesList.map((srv, idx) => (
                    <Link
                      key={idx}
                      href={srv.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-gray-300 hover:text-[#ea580c] text-base py-1"
                    >
                      {srv.title}
                    </Link>
                  ))}
                  <Link
                    href="/services"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-[#ea580c] font-semibold text-sm pt-1"
                  >
                    View All Services →
                  </Link>
                </div>
              )}
            </div>

            {/* Airport VIP */}
            <Link
              href="/locations"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold hover:text-[#ea580c] transition-colors py-2 border-b border-gray-800"
            >
              Airport VIP
            </Link>

            {/* Charter */}
            <Link
              href="/charter"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold hover:text-[#ea580c] transition-colors py-2 border-b border-gray-800"
            >
              Charter
            </Link>

            {/* Reviews */}
            <Link
              href="/#reviews"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold hover:text-[#ea580c] transition-colors py-2 border-b border-gray-800"
            >
              Reviews
            </Link>

            {/* Contact Us */}
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold hover:text-[#ea580c] transition-colors py-2 border-b border-gray-800"
            >
              Contact Us
            </Link>
          </div>

          <div className="pt-6">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-green-600 flex items-center justify-center gap-3 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors w-full shadow-lg shadow-green-500/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              <span>{displayNumber}</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
