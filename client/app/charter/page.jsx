"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Plane, Calendar, Users, MapPin, Shield, Clock, Award, CheckCircle2, ArrowRight, Loader2, Sparkles } from "lucide-react";

const countryOptions = [
  "Sint Maarten (SXM)",
  "Saint Barthélemy (SBH)",
  "Anguilla (AXA)",
  "Antigua & Barbuda (ANU)",
  "Saint Kitts & Nevis (SKB)",
  "Puerto Rico (SJU)",
  "British Virgin Islands (EIS)",
  "United States",
  "United Kingdom",
  "France",
  "Other"
];

export default function CharterPage() {
  const [tripType, setTripType] = useState("one-way");
  const [departureCountry, setDepartureCountry] = useState("Sint Maarten (SXM)");
  const [otherDepartureCountry, setOtherDepartureCountry] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("Saint Barthélemy (SBH)");
  const [otherDestinationCountry, setOtherDestinationCountry] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [passengers, setPassengers] = useState(2);
  const [aircraftType, setAircraftType] = useState("Best Recommendation");
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fromCountryFinal = departureCountry === "Other" ? otherDepartureCountry : departureCountry;
    const toCountryFinal = destinationCountry === "Other" ? otherDestinationCountry : destinationCountry;

    const payload = {
      tripType,
      departureCountry: fromCountryFinal,
      destinationCountry: toCountryFinal,
      departureDate,
      departureTime,
      returnDate: tripType === "round-trip" ? returnDate : null,
      returnTime: tripType === "round-trip" ? returnTime : null,
      passengers,
      aircraftType,
      contact: {
        fullName,
        email,
        phone,
        notes
      }
    };

    console.log("Charter Request Submitted:", payload);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header className="relative w-full min-h-[70vh] flex items-center justify-center bg-gray-900 py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2600&auto=format&fit=crop" 
            alt="Private Jet Charter" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/80"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-12 text-center text-white mt-12">
          <span className="inline-block px-4 py-1.5 bg-[#ea580c]/20 border border-[#ea580c]/40 rounded-full text-xs font-bold tracking-widest text-[#ea580c] mb-6 uppercase">
            Bespoke Aviation & Private Charters
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Private Jet & Aircraft <span className="text-[#ea580c]">Charter</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Fly on your schedule with unmatched privacy, agility, and bespoke luxury across the Caribbean islands and international destinations.
          </p>
        </div>
      </header>

      {/* Main Charter Booking Container */}
      <section className="relative z-20 -mt-16 max-w-5xl mx-auto px-4 md:px-8 mb-24">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
          {isSubmitted ? (
            <div className="py-16 text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Charter Request Received</h2>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-bold text-gray-900">{fullName}</span>. Our private aviation concierge has received your itinerary from{" "}
                <span className="font-bold text-[#ea580c]">
                  {departureCountry === "Other" ? otherDepartureCountry : departureCountry}
                </span>{" "}
                to{" "}
                <span className="font-bold text-[#ea580c]">
                  {destinationCountry === "Other" ? otherDestinationCountry : destinationCountry}
                </span>. We are compiling available aircraft options and will contact you shortly at <span className="font-semibold text-gray-900">{email}</span>.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                >
                  Book Another Flight
                </button>
                <a
                  href="https://wa.me/590690695079"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 bg-[#25D366] text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  Chat with Charter Specialist
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Trip Type Selector */}
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">
                  1. Flight Type
                </label>
                <div className="inline-flex p-1.5 bg-gray-100 rounded-2xl gap-1">
                  <button
                    type="button"
                    onClick={() => setTripType("one-way")}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      tripType === "one-way"
                        ? "bg-white text-gray-900 shadow-md"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    One-Way
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType("round-trip")}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      tripType === "round-trip"
                        ? "bg-white text-gray-900 shadow-md"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Round-Trip
                  </button>
                </div>
              </div>

              {/* Itinerary Selection */}
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">
                  2. Route & Location Details
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Departure Country */}
                  <div className="space-y-2 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#ea580c]" />
                      Flying From (Country / Airport) *
                    </label>
                    <select
                      value={departureCountry}
                      onChange={(e) => setDepartureCountry(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                    >
                      {countryOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {/* Conditional text field when user selects 'Other' for departure */}
                    {departureCountry === "Other" && (
                      <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="text-xs font-bold text-[#ea580c] uppercase tracking-wider block mb-1">
                          Specify Departure Country / Airport *
                        </label>
                        <input
                          type="text"
                          required
                          value={otherDepartureCountry}
                          onChange={(e) => setOtherDepartureCountry(e.target.value)}
                          placeholder="e.g. Barbados, Saint Lucia, Martinique, Miami..."
                          className="w-full px-4 py-3 bg-white border-2 border-[#ea580c]/50 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#ea580c] outline-none"
                        />
                        <p className="text-[11px] text-gray-500 mt-1 italic">
                          Please enter the exact country or airport you wish to fly from.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Destination Country */}
                  <div className="space-y-2 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[#ea580c]" />
                      Flying To (Country / Airport) *
                    </label>
                    <select
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                    >
                      {countryOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {/* Conditional text field when user selects 'Other' for destination */}
                    {destinationCountry === "Other" && (
                      <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="text-xs font-bold text-[#ea580c] uppercase tracking-wider block mb-1">
                          Specify Destination Country / Airport *
                        </label>
                        <input
                          type="text"
                          required
                          value={otherDestinationCountry}
                          onChange={(e) => setOtherDestinationCountry(e.target.value)}
                          placeholder="e.g. Turks & Caicos, Bahamas, Monaco, Aspen..."
                          className="w-full px-4 py-3 bg-white border-2 border-[#ea580c]/50 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#ea580c] outline-none"
                        />
                        <p className="text-[11px] text-gray-500 mt-1 italic">
                          Please enter the exact country or airport you wish to fly to.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule and Passengers */}
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">
                  3. Flight Schedule & Group
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Departure Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      Passengers *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                    />
                  </div>

                  {tripType === "round-trip" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          Return Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          Return Time
                        </label>
                        <input
                          type="time"
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-gray-400" />
                          Aircraft Category
                        </label>
                        <select
                          value={aircraftType}
                          onChange={(e) => setAircraftType(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                        >
                          <option value="Best Recommendation">Best Recommendation</option>
                          <option value="Turboprop (Island Hopper)">Turboprop (Pilatus / Caravan)</option>
                          <option value="Light Jet">Light Jet (4-7 seats)</option>
                          <option value="Midsize Jet">Midsize Jet (7-9 seats)</option>
                          <option value="Heavy Jet">Heavy Jet (10-16 seats)</option>
                          <option value="Helicopter">VIP Helicopter</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">
                  4. Passenger / Coordinator Contact
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Johnathan Smith"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vip@domain.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Special Inquiries / Luggage Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Baggage volume, catering requests, villa transfers, or connecting commercial flight numbers..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-400 font-medium">
                  Direct inquiry • Rapid quotation within 30 minutes • 24/7 Dispatch
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-4 bg-[#ea580c] hover:bg-orange-700 text-white font-extrabold rounded-xl shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Request...
                    </>
                  ) : (
                    <>
                      <span>Request Charter Quote</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-[#ea580c] tracking-[0.2em] uppercase mb-3">Why Charter with D'LUXE</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Absolute Discretion & Uncompromising Comfort
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#ea580c] flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Highest Safety Standards</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every operator in our global network is rigorously vetted with Wyvern and ARG/US safety certifications for flawless execution.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#ea580c] flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Direct Tarmac & Gate Transfer</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Step seamlessly from private chauffeur or VIP lounge directly to aircraft steps with expedited customs clearance and luggage coordination.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#ea580c] flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Caribbean Island Specialist</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Specialized authorization and aircraft capability for short-runway landings such as Gustaf III Airport (SBH) in Saint Barthélemy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
