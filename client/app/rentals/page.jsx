"use client";

import { useEffect, useState } from "react";
import { Cog, MapPin, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const hours = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];

const placeholderCars = [
  { name: "Mini Car", pricePerDay: 35.2, transmission: "Manual", seats: 5, imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80" },
  { name: "Economy", pricePerDay: 40, transmission: "Automatic", seats: 5, imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80" },
  { name: "Compact", pricePerDay: 44.8, transmission: "Automatic", seats: 5, imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80" },
];

const emptySearch = {
  pickupLocation: "",
  returnLocation: "",
  pickupDate: "",
  pickupHour: "12",
  pickupMinute: "00",
  returnDate: "",
  returnHour: "12",
  returnMinute: "00",
  flightOrStay: "",
};

function FieldLabel({ children }) {
  return <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f172a]">{children}</span>;
}

function SelectBox({ value, onChange, children, required }) {
  return (
    <select required={required} value={value} onChange={onChange} className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700">
      {children}
    </select>
  );
}

export default function RentalsPage() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState(emptySearch);
  const [results, setResults] = useState(placeholderCars);
  const [selected, setSelected] = useState(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/rental-locations")
      .then((res) => res.json())
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]));
  }, []);

  function setField(key, value) {
    setSearch((current) => ({ ...current, [key]: value }));
  }

  function showCars(event) {
    event.preventDefault();
    setSelected(null);
    setMessage("");
    setResults(placeholderCars);
    document.getElementById("vehicles")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submitRequest(event) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    try {
      const res = await fetch("/api/rental-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carName: selected.name,
          pickupLocation: search.pickupLocation,
          returnLocation: search.returnLocation,
          pickupDate: search.pickupDate,
          pickupTime: `${search.pickupHour}:${search.pickupMinute}`,
          returnDate: search.returnDate,
          returnTime: `${search.returnHour}:${search.returnMinute}`,
          flightOrStay: search.flightOrStay,
          ...contact,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not send the request");
      setMessage("Request received. Our team will confirm the car.");
      setContact({ name: "", email: "", phone: "" });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f6f5] text-[#0f172a]">
      <Navbar />
      <header className="relative h-[520px] overflow-hidden md:h-[560px]">
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Philipsburg,_St._Maarten,_Netherlands_Antilles_(32741901691).jpg?width=2000"
          alt="Philipsburg, St. Maarten"
          className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/50" />
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 pb-36 pt-24 text-center text-white">
          <h1 className="text-balance text-4xl font-extrabold leading-tight drop-shadow-md md:text-5xl">
            Affordable &amp; Reliable Car Rental in St.&nbsp;Maarten
          </h1>
          <p className="mt-4 max-w-2xl text-balance text-sm leading-relaxed text-white/95 md:text-lg">
            Explore the island with confidence. Modern vehicles, transparent pricing, and friendly, hassle-free service from pickup to drop-off.
          </p>
        </div>
      </header>
      <main className="relative z-10 mx-auto -mt-28 max-w-6xl px-4 pb-16">
        <form onSubmit={showCars} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold">Find Your Rental Car</h2>
          <p className="mt-1 text-sm text-gray-500">Select your pickup and return details to see available vehicles.</p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <FieldLabel><MapPin className="inline h-4 w-4 text-[#16a34a]" /> Pickup Location</FieldLabel>
              <SelectBox required value={search.pickupLocation} onChange={(event) => setField("pickupLocation", event.target.value)}>
                <option value="">Select pickup location</option>
                {locations.map((location) => <option key={location.id} value={location.name}>{location.name}</option>)}
              </SelectBox>
            </label>
            <label className="grid gap-2">
              <FieldLabel><MapPin className="inline h-4 w-4 text-[#16a34a]" /> Return Location</FieldLabel>
              <SelectBox required value={search.returnLocation} onChange={(event) => setField("returnLocation", event.target.value)}>
                <option value="">Select return location</option>
                {locations.map((location) => <option key={location.id} value={location.name}>{location.name}</option>)}
              </SelectBox>
            </label>

            <div className="grid gap-2">
              <FieldLabel>Pickup Date & Time *</FieldLabel>
              <div className="grid grid-cols-[1fr_72px_72px] gap-2">
                <input required type="date" value={search.pickupDate} onChange={(event) => setField("pickupDate", event.target.value)} className="h-12 rounded-xl border border-gray-200 px-3 text-sm" />
                <SelectBox value={search.pickupHour} onChange={(event) => setField("pickupHour", event.target.value)}>{hours.map((hour) => <option key={hour}>{hour}</option>)}</SelectBox>
                <SelectBox value={search.pickupMinute} onChange={(event) => setField("pickupMinute", event.target.value)}>{minutes.map((minute) => <option key={minute}>{minute}</option>)}</SelectBox>
              </div>
            </div>
            <div className="grid gap-2">
              <FieldLabel>Return Date & Time *</FieldLabel>
              <div className="grid grid-cols-[1fr_72px_72px] gap-2">
                <input required type="date" value={search.returnDate} onChange={(event) => setField("returnDate", event.target.value)} className="h-12 rounded-xl border border-gray-200 px-3 text-sm" />
                <SelectBox value={search.returnHour} onChange={(event) => setField("returnHour", event.target.value)}>{hours.map((hour) => <option key={hour}>{hour}</option>)}</SelectBox>
                <SelectBox value={search.returnMinute} onChange={(event) => setField("returnMinute", event.target.value)}>{minutes.map((minute) => <option key={minute}>{minute}</option>)}</SelectBox>
              </div>
            </div>

            <label className="grid gap-2 md:col-span-2">
              <FieldLabel>Flight Number or Place of Stay *</FieldLabel>
              <input required value={search.flightOrStay} onChange={(event) => setField("flightOrStay", event.target.value)} placeholder="e.g. WM 301 or hotel name" className="h-12 rounded-xl border border-gray-200 px-3 text-sm" />
              <span className="text-xs text-gray-400">Enter your incoming flight number or where you&apos;re staying so we can coordinate your pickup.</span>
            </label>
          </div>
          <button type="submit" className="mt-6 h-11 rounded-xl bg-[#ea580c] px-6 font-bold text-white">Show cars</button>
        </form>

        {results ? (
          <section id="vehicles" className="mt-10">
            <div className="grid gap-6 md:grid-cols-3">
              {results.map((car) => (
                <article key={car.name} className="rounded-[24px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                  <div className="relative overflow-hidden rounded-2xl bg-white">
                    <img src={car.imageUrl} alt="" className="h-44 w-full object-cover object-center" />
                    <span className="absolute right-3 top-3 rounded-full bg-[#8fbf3f] px-3 py-1 text-xs font-semibold text-white shadow-sm">{car.name}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-extrabold">{car.name}</h3>
                  <p className="text-sm text-gray-400">or similar</p>
                  <div className="mt-4 flex items-center gap-6 text-sm font-medium text-[#6f9a32]">
                    <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> {car.seats} Seats</span>
                    <span className="inline-flex items-center gap-2"><Cog className="h-4 w-4" /> {car.transmission}</span>
                  </div>
                  <p className="mt-4 border-t border-gray-100 pt-4">
                    <span className="text-2xl font-extrabold">${car.pricePerDay}</span>
                    <span className="text-sm text-gray-400"> / day</span>
                  </p>
                  <button type="button" onClick={() => { setSelected(car); setMessage(""); }} className="mt-4 h-10 w-full rounded-lg bg-[#ea580c] font-bold text-white">Book now</button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {selected ? (
          <form onSubmit={submitRequest} className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Request {selected.name}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input required placeholder="Your name" value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} className="h-11 rounded-xl border border-gray-200 px-3" />
              <input required type="email" placeholder="Email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} className="h-11 rounded-xl border border-gray-200 px-3" />
              <input placeholder="Phone" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} className="h-11 rounded-xl border border-gray-200 px-3" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button disabled={sending} className="h-11 rounded-xl bg-[#0f172a] px-6 font-bold text-white" type="submit">{sending ? "Sending..." : "Send request"}</button>
              {message ? <p className="text-sm text-gray-600">{message}</p> : null}
            </div>
          </form>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
