"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, Loader2, Sparkles } from "lucide-react";

export default function ContactPage() {
  const [phoneNumber, setPhoneNumber] = useState('590690695079');
  const [displayNumber, setDisplayNumber] = useState('+590 690 69 50 79');
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "VIP Meet & Greet",
    airport: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      } catch (e) {}
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const waLink = phoneNumber ? `https://wa.me/${phoneNumber.replace('+', '')}` : '#';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header className="relative w-full min-h-[50vh] flex items-center justify-center bg-gray-900 py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2600&auto=format&fit=crop" 
            alt="VIP Travel" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#0f172a]"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-12 text-center text-white mt-12">
          <span className="inline-block px-4 py-1.5 bg-[#ea580c]/20 border border-[#ea580c]/40 rounded-full text-xs font-bold tracking-widest text-[#ea580c] mb-6 uppercase">
            24/7 Dedicated Concierge
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Contact <span className="text-[#ea580c]">D'LUXE</span>
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-xl mx-auto">
            Our luxury travel specialists are ready to tailor your airport transitions, private suites, and aircraft charters worldwide.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-12 -mt-12 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Direct Assistance</h3>
                <p className="text-sm text-gray-500 mt-1">Connect with our personal concierge team at any time.</p>
              </div>

              <div className="space-y-6">
                <a 
                  href={waLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-green-50/50 hover:bg-green-100/50 border border-green-200/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md shadow-green-500/20">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">Instant WhatsApp</span>
                    <h4 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors">{displayNumber}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Average response: Under 5 minutes</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#ea580c] flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email Inquiries</span>
                    <h4 className="text-base font-bold text-gray-900">reservations@usvipservices.com</h4>
                    <p className="text-xs text-gray-500 mt-0.5">For formal quotes and corporate itineraries</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Primary Hubs</span>
                    <h4 className="text-sm font-bold text-gray-900">SXM (Sint Maarten) & SBH (Saint Barthélemy)</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Serving 150+ international gateways</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Operating Hours</span>
                    <h4 className="text-sm font-bold text-gray-900">24 Hours / 7 Days a Week</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Continuous flight watch & support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
              {isSubmitted ? (
                <div className="py-16 text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">Message Delivered</h3>
                  <p className="text-gray-600 max-w-sm mx-auto text-sm leading-relaxed">
                    Thank you for contacting D'LUXE Concierge. A travel specialist will review your request and get in touch with you shortly.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        service: "VIP Meet & Greet",
                        airport: "",
                        message: ""
                      });
                    }}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-[#ea580c] transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Send an Inquiry</h3>
                    <p className="text-sm text-gray-500 mt-1">Fill out the form below and we will respond promptly.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Johnathan Smith"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Service of Interest
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({...formData, service: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                      >
                        <option value="VIP Meet & Greet">VIP Meet & Greet</option>
                        <option value="VIP Terminal">VIP Terminal</option>
                        <option value="VIP Private Suite">VIP Private Suite</option>
                        <option value="Private Jet Charter">Private Jet Charter</option>
                        <option value="Airport VIP Transfers">Airport VIP Transfers</option>
                        <option value="Other Inquiries">Other Inquiries</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Target Airport or Route
                    </label>
                    <input
                      type="text"
                      value={formData.airport}
                      onChange={(e) => setFormData({...formData, airport: e.target.value})}
                      placeholder="e.g. Princess Juliana (SXM), Saint Barths (SBH), London (LHR)..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Message / Special Requirements *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Please let us know your travel dates, flight numbers, passenger count, or any specific requests..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#ea580c] outline-none resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#ea580c] hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
