"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ServiceLevels from "@/components/home/ServiceLevels";
import ReviewsSection from "@/components/home/ReviewsSection";
import { Check, ArrowRight, ShieldCheck, Clock, Award, Plane } from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header className="relative w-full min-h-[50vh] flex items-center justify-center bg-gray-900 py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2600&auto=format&fit=crop" 
            alt="VIP Services" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/80"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-12 text-center text-white mt-12">
          <span className="inline-block px-4 py-1.5 bg-[#ea580c]/20 border border-[#ea580c]/40 rounded-full text-xs font-bold tracking-widest text-[#ea580c] mb-6 uppercase">
            Signature Concierge Solutions
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Our Elite <span className="text-[#ea580c]">Services</span>
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            From seamless fast-track escorts to standalone VIP private terminals and bespoke charters, explore our full suite of luxury travel experiences.
          </p>
        </div>
      </header>

      {/* Services Grid Component */}
      <ServiceLevels />

      {/* Supplemental Charter Banner */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 text-white p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="max-w-xl space-y-4">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-[#ea580c] uppercase tracking-wider">
                Private Aviation
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Private Jet & Aircraft Charters
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Connect seamlessly between Caribbean islands and global hubs. Customized schedules, discrete boarding, and rapid quotation.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/charter"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#ea580c] hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/25 transition-all text-sm uppercase tracking-wider"
              >
                <span>Explore Charters</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSection />

      <Footer />
    </div>
  );
}
