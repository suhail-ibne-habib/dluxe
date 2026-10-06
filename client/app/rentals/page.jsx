"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const emptyRequest = { name: "", email: "", phone: "", pickupLocation: "", pickupDate: "", returnDate: "" };

export default function RentalsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [query, setQuery] = useState({ location: "", date: "" });
  const [selected, setSelected] = useState(null);
  const [request, setRequest] = useState(emptyRequest);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/cars?available=1")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not load cars");
        setCars(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        setCars([]);
        setLoadError(error.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const place = query.location.trim().toLowerCase();
    return cars.filter((car) => !place || String(car.location || "").toLowerCase().includes(place));
  }, [cars, query.location]);

  function openBooking(car) {
    setSelected(car);
    setMessage("");
    setRequest({ ...emptyRequest, pickupLocation: query.location || car.location || "", pickupDate: query.date || "" });
  }

  async function submitRequest(event) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    try {
      const res = await fetch("/api/rental-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, carId: selected.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not send the request");
      setMessage("Request received. Our team will confirm the car.");
      setRequest(emptyRequest);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <Navbar />
      <header className="bg-[#0f172a] text-white pt-36 pb-28 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#ea580c] mb-4">Car rental</p>
          <h1 className="text-4xl md:text-6xl font-extrabold max-w-xl leading-tight">Reliable and luxury cars for rent</h1>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 -mt-12">
        <form
          className="bg-white rounded-2xl shadow-xl p-4 md:p-6 grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery({ location, date });
          }}
        >
          <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-gray-500">
            Pickup location
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Sint Maarten" className="h-11 rounded-lg border border-gray-200 px-3 text-sm font-medium text-[#0f172a]" />
          </label>
          <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-gray-500">
            Pickup date
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-11 rounded-lg border border-gray-200 px-3 text-sm font-medium text-[#0f172a]" />
          </label>
          <button className="h-11 px-6 rounded-lg bg-[#ea580c] text-white font-bold" type="submit">Search car</button>
        </form>

        <div className="flex items-end justify-between mt-14 mb-6">
          <h2 className="text-3xl font-extrabold">Latest inventory</h2>
          <p className="text-sm text-gray-500">{visible.length} cars</p>
        </div>

        {loading ? <p className="text-gray-500">Loading cars...</p> : null}
        {!loading && loadError ? <p className="text-gray-500">{loadError}</p> : null}
        {!loading && !loadError && visible.length === 0 ? <p className="text-gray-500">No cars match that pickup location.</p> : null}

        <div className="grid md:grid-cols-3 gap-6 pb-8">
          {visible.map((car) => (
            <article key={car.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <img src={car.imageUrl} alt={car.name} className="h-48 w-full object-cover bg-gray-100" />
              <div className="p-5">
                <h3 className="font-bold text-lg">{car.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{car.year} · {car.transmission} · {car.seats} seats</p>
                <p className="text-sm font-semibold mt-3">${car.pricePerDay} <span className="text-gray-400 font-medium">/ day</span></p>
                <button type="button" onClick={() => openBooking(car)} className="mt-4 w-full h-11 rounded-lg bg-[#ea580c] text-white font-bold">Book now</button>
              </div>
            </article>
          ))}
        </div>

        {selected ? (
          <form onSubmit={submitRequest} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-16 grid md:grid-cols-2 gap-4">
            <h3 className="md:col-span-2 text-2xl font-bold">Request {selected.name}</h3>
            <input required placeholder="Your name" value={request.name} onChange={(event) => setRequest({ ...request, name: event.target.value })} className="h-11 rounded-lg border border-gray-200 px-3" />
            <input required type="email" placeholder="Email" value={request.email} onChange={(event) => setRequest({ ...request, email: event.target.value })} className="h-11 rounded-lg border border-gray-200 px-3" />
            <input placeholder="Phone" value={request.phone} onChange={(event) => setRequest({ ...request, phone: event.target.value })} className="h-11 rounded-lg border border-gray-200 px-3" />
            <input placeholder="Pickup location" value={request.pickupLocation} onChange={(event) => setRequest({ ...request, pickupLocation: event.target.value })} className="h-11 rounded-lg border border-gray-200 px-3" />
            <input type="date" value={request.pickupDate} onChange={(event) => setRequest({ ...request, pickupDate: event.target.value })} className="h-11 rounded-lg border border-gray-200 px-3" />
            <input type="date" value={request.returnDate} onChange={(event) => setRequest({ ...request, returnDate: event.target.value })} className="h-11 rounded-lg border border-gray-200 px-3" />
            <div className="md:col-span-2 flex items-center gap-3">
              <button disabled={sending} className="h-11 px-6 rounded-lg bg-[#0f172a] text-white font-bold" type="submit">{sending ? "Sending..." : "Send request"}</button>
              <button type="button" className="h-11 px-4 font-semibold" onClick={() => setSelected(null)}>Cancel</button>
              {message ? <p className="text-sm text-gray-600">{message}</p> : null}
            </div>
          </form>
        ) : <div className="h-16" />}
      </div>
      <Footer />
    </div>
  );
}
