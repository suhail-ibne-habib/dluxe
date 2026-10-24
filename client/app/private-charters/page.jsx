"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const airports = [
  "St. Maarten – SXM",
  "Saint Barths – SBH",
  "Anguilla – AXA",
  "Antigua – ANU",
  "St. Kitts – SKB",
  "Nevis – NEV",
  "Tortola – EIS",
  "Virgin Gorda – VIJ",
  "Barbuda – BBQ",
  "Other",
];

const passengerOptions = Array.from({ length: 10 }, (_, index) => index + 1);

const emptyForm = {
  tripType: "One Way",
  fromAirport: "St. Maarten – SXM",
  toAirport: "Saint Barths – SBH",
  departureDate: "",
  departureTime: "10:00",
  returnDate: "",
  returnTime: "16:00",
  passengers: "1",
  hasConnection: false,
  connectionFlight: "",
  notes: "",
  name: "",
  email: "",
  phone: "",
};

function FieldLabel({ children }) {
  return <span className="text-sm font-semibold text-[#0f172a]">{children}</span>;
}

function SelectBox({ value, onChange, children, required }) {
  return (
    <select required={required} value={value} onChange={onChange} className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700">
      {children}
    </select>
  );
}

export default function PrivateChartersPage() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    try {
      const res = await fetch("/api/charter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          passengers: Number(form.passengers),
          hasConnection: Boolean(form.hasConnection),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not send the request");
      setMessage("Request received. Our team will confirm your private charter.");
      setForm(emptyForm);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f6f5] text-[#0f172a]">
      <Navbar />
      <header className="relative h-[460px] overflow-hidden md:h-[520px]">
        <img
          src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=2400&q=80"
          alt="Private aircraft"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/50" />
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 pt-24 text-center text-white">
          <h1 className="text-balance text-4xl font-extrabold leading-tight drop-shadow-md md:text-5xl">
            Private Charters
          </h1>
          <p className="mt-4 max-w-2xl text-balance text-sm leading-relaxed text-white/95 md:text-lg">
            Discover the Caribbean on your own schedule. Every flight is tailored to your time, route, and guest list.
          </p>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-16 max-w-4xl px-4 pb-16">
        <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-extrabold">Request a Private Charter</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 md:text-base">
            Fly on your terms. Choose the airports, date, and passenger count. Our team confirms availability and sends a quote. This request is separate from airport VIP booking.
          </p>

          <form onSubmit={submit} className="mt-8 grid gap-5">
            <div className="grid gap-2">
              <FieldLabel>Trip Type *</FieldLabel>
              <div className="flex flex-wrap gap-4">
                {["One Way", "Round Trip"].map((type) => (
                  <label key={type} className="inline-flex items-center gap-2 text-sm font-medium">
                    <input
                      type="radio"
                      name="tripType"
                      checked={form.tripType === type}
                      onChange={() => setField("tripType", type)}
                      className="accent-[#ea580c]"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <FieldLabel>From (Departure Airport) *</FieldLabel>
                <SelectBox required value={form.fromAirport} onChange={(event) => setField("fromAirport", event.target.value)}>
                  {airports.map((airport) => <option key={airport}>{airport}</option>)}
                </SelectBox>
              </label>
              <label className="grid gap-2">
                <FieldLabel>To (Destination Airport) *</FieldLabel>
                <SelectBox required value={form.toAirport} onChange={(event) => setField("toAirport", event.target.value)}>
                  {airports.map((airport) => <option key={airport}>{airport}</option>)}
                </SelectBox>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <FieldLabel>Departure Date & Time *</FieldLabel>
                <div className="grid grid-cols-[1fr_110px] gap-2">
                  <input required type="date" value={form.departureDate} onChange={(event) => setField("departureDate", event.target.value)} className="h-12 rounded-xl border border-gray-200 px-3 text-sm" />
                  <input required type="time" value={form.departureTime} onChange={(event) => setField("departureTime", event.target.value)} className="h-12 rounded-xl border border-gray-200 px-3 text-sm" />
                </div>
              </div>
              <label className="grid gap-2">
                <FieldLabel>Number of Passengers *</FieldLabel>
                <SelectBox required value={form.passengers} onChange={(event) => setField("passengers", event.target.value)}>
                  {passengerOptions.map((count) => (
                    <option key={count} value={count}>{count} {count === 1 ? "Passenger" : "Passengers"}</option>
                  ))}
                </SelectBox>
              </label>
            </div>

            {form.tripType === "Round Trip" ? (
              <div className="grid gap-2">
                <FieldLabel>Return Date & Time *</FieldLabel>
                <div className="grid max-w-md grid-cols-[1fr_110px] gap-2">
                  <input required type="date" value={form.returnDate} onChange={(event) => setField("returnDate", event.target.value)} className="h-12 rounded-xl border border-gray-200 px-3 text-sm" />
                  <input required type="time" value={form.returnTime} onChange={(event) => setField("returnTime", event.target.value)} className="h-12 rounded-xl border border-gray-200 px-3 text-sm" />
                </div>
              </div>
            ) : null}

            <div className="grid gap-2">
              <FieldLabel>Inbound / Outbound Connection</FieldLabel>
              <div className="flex flex-wrap gap-4">
                {[false, true].map((value) => (
                  <label key={String(value)} className="inline-flex items-center gap-2 text-sm font-medium">
                    <input
                      type="radio"
                      name="hasConnection"
                      checked={form.hasConnection === value}
                      onChange={() => setField("hasConnection", value)}
                      className="accent-[#ea580c]"
                    />
                    {value ? "Yes" : "No"}
                  </label>
                ))}
              </div>
              {form.hasConnection ? (
                <input
                  value={form.connectionFlight}
                  onChange={(event) => setField("connectionFlight", event.target.value)}
                  placeholder="Connecting flight number"
                  className="mt-1 h-12 rounded-xl border border-gray-200 px-3 text-sm"
                />
              ) : null}
            </div>

            <label className="grid gap-2">
              <FieldLabel>Notes / Special Requests</FieldLabel>
              <textarea
                value={form.notes}
                onChange={(event) => setField("notes", event.target.value)}
                rows={3}
                placeholder="Luggage, pets, preferred aircraft, or other details"
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </label>

            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-lg font-extrabold">Contact Details</h3>
              <div className="mt-4 grid gap-5 md:grid-cols-3">
                <label className="grid gap-2">
                  <FieldLabel>Name *</FieldLabel>
                  <input required value={form.name} onChange={(event) => setField("name", event.target.value)} className="h-12 rounded-xl border border-gray-200 px-3 text-sm" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>Email *</FieldLabel>
                  <input required type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} className="h-12 rounded-xl border border-gray-200 px-3 text-sm" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>Phone</FieldLabel>
                  <input value={form.phone} onChange={(event) => setField("phone", event.target.value)} className="h-12 rounded-xl border border-gray-200 px-3 text-sm" />
                </label>
              </div>
            </div>

            <button disabled={sending} type="submit" className="mt-2 h-12 rounded-xl bg-[#ea580c] px-6 font-bold text-white md:w-fit">
              {sending ? "Sending..." : "Send charter request"}
            </button>
            {message ? <p className="text-sm text-gray-600">{message}</p> : null}
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
