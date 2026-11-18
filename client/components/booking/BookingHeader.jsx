"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Shield, Crown, Sparkles, Plane, ArrowRight } from 'lucide-react';

export default function BookingHeader() {
  const [phoneNumber, setPhoneNumber] = useState('590690695079');
  const [displayNumber, setDisplayNumber] = useState('+590 690 69 50 79');
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.whatsapp_number) {
            setPhoneNumber(data.whatsapp_number.replace(/[^\d+]/g, ''));
            setDisplayNumber(data.whatsapp_number);
          }
        }
      } catch (e) {
        console.error("Failed to load WhatsApp setting:", e);
      }
    };
    fetchSettings();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
      desc: "Fast-track escort & luggage porterage",
      href: "/booking?service=VIP+Meet+%26+Greet",
      icon: <Shield className="w-4 h-4 text-[#ea580c]" />
    },
    {
      title: "VIP Terminal",
      desc: "Private terminal & tarmac transfer",
      href: "/booking?service=VIP+Terminal",
      icon: <Crown className="w-4 h-4 text-[#ea580c]" />
    },
    {
      title: "VIP Private Suite",
      desc: "Soundproof secluded luxury suites",
      href: "/booking?service=VIP+Private+Suite",
      icon: <Sparkles className="w-4 h-4 text-[#ea580c]" />
    },
    {
      title: "Private Jet Charter",
      desc: "Tailored aircraft flights across the Caribbean",
      href: "/charter",
      icon: <Plane className="w-4 h-4 text-[#ea580c]" />
    }
  ];

  return (
    <div className="flex justify-between items-center py-4 px-6 md:px-12 bg-[#0f172a] text-white text-sm font-medium h-20 border-b border-gray-800">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white font-bold transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          <span className="hidden sm:inline">Back</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/dluxe-logo.jpg" alt="D'LUXE Logo" className="h-14 w-auto object-contain rounded-lg shadow-sm" />
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-7 text-gray-300 font-semibold">
        {/* Services Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsServicesOpen(!isServicesOpen)}
            onMouseEnter={() => setIsServicesOpen(true)}
            className="hover:text-[#ea580c] flex items-center gap-1 transition-colors focus:outline-none"
          >
            <span>Our services</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? "rotate-180 text-[#ea580c]" : ""}`} />
          </button>

          {isServicesOpen && (
            <div
              onMouseLeave={() => setIsServicesOpen(false)}
              className="absolute top-full left-0 w-72 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-100 py-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
            >
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Services & Packages</span>
                <Link href="/services" onClick={() => setIsServicesOpen(false)} className="text-[11px] font-bold text-[#ea580c] hover:underline">
                  All
                </Link>
              </div>

              <div className="py-1">
                {servicesList.map((srv, idx) => (
                  <Link
                    key={idx}
                    href={srv.href}
                    onClick={() => setIsServicesOpen(false)}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-orange-50/70 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-100/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      {srv.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-[#ea580c] transition-colors">
                        {srv.title}
                      </p>
                      <p className="text-[10px] text-gray-500 line-clamp-1">
                        {srv.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="p-2.5 bg-gray-50 border-t border-gray-100 mx-2 rounded-xl mt-1">
                <Link
                  href="/#services"
                  onClick={() => setIsServicesOpen(false)}
                  className="flex items-center justify-between text-[11px] font-bold text-gray-700 hover:text-[#ea580c] transition-colors"
                >
                  <span>Compare Services</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Airport VIP (Renamed from Locations) */}
        <Link href="/locations" className="hover:text-[#ea580c] transition-colors">
          Airport VIP
        </Link>

        {/* Charter */}
        <Link href="/charter" className="hover:text-[#ea580c] transition-colors">
          Charter
        </Link>

        {/* Reviews */}
        <Link href="/#reviews" className="hover:text-[#ea580c] transition-colors">
          Reviews
        </Link>

        {/* Contact Us */}
        <Link href="/contact" className="hover:text-[#ea580c] transition-colors">
          Contact us
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden xl:flex items-center gap-6 text-xs text-gray-400 font-semibold">
          <span className="flex items-center gap-1.5"><svg className="w-4 h-4 bg-gray-800 text-gray-300 rounded p-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M12 2H8a2 2 0 00-2 2v12a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2zM8 4h4v1H8V4zm0 2h4v10H8V6zm4 11H8v-1h4v1z" /></svg> {displayNumber}</span>
          <span className="flex items-center gap-1.5"><svg className="w-4 h-4 bg-gray-800 text-gray-300 rounded p-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg> reservations@usvipservices.com</span>
        </div>
        
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 bg-[#ea580c] text-white px-5 py-2.5 rounded-full font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/20 text-xs">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          Book via WhatsApp
        </a>

        <div className="hidden lg:flex items-center gap-1 font-bold text-gray-300 border-l border-gray-700 pl-6">
          USD
        </div>
      </div>
    </div>
  );
}
