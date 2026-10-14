"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const emptyForm = { date: "", guests: "1", name: "", email: "", phone: "", notes: "" };

export default function TourPage() {
  const params = useParams();
  const slug = params.slug;
  const [tour, setTour] = useState(null);
  const [missing, setMissing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/tours/${slug}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Tour not found");
        setTour(data);
      })
      .catch(() => setMissing(true));
  }, [slug]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    try {
      const res = await fetch("/api/tour-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tourId: tour.id, guests: Number(form.guests) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not send the request");
      setMessage("Request received. Our team will confirm the tour.");
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
      {missing ? (
        <main className="mx-auto max-w-3xl px-4 pb-16 pt-36">
          <h1 className="text-3xl font-extrabold">This tour is not available</h1>
          <Link href="/tours" className="mt-4 inline-block font-semibold text-[#ea580c]">Back to tours</Link>
        </main>
      ) : null}
      {tour ? (
        <>
          <header className="relative h-[420px] overflow-hidden">
            <img src={tour.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/55" />
            <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 pt-24 text-center text-white">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/80">{tour.category}</p>
              <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{tour.name}</h1>
              <p className="mt-3 text-lg">{tour.duration}</p>
            </div>
          </header>
          <main className="relative z-10 mx-auto -mt-16 grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <p className="text-lg text-gray-600">{tour.summary}</p>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-700">{tour.description}</p>
              <p className="mt-6 border-t border-gray-100 pt-6">
                <span className="text-3xl font-extrabold">${Number(tour.price).toLocaleString()}</span>
                <span className="text-gray-400"> / person</span>
              </p>
            </article>
            <form onSubmit={submit} className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold">Request this tour</h2>
              <p className="mt-1 text-sm text-gray-500">Send the date and your details. We confirm availability before anything is charged.</p>
              <div className="mt-5 grid gap-3">
                <label className="grid gap-1 text-sm font-semibold">
                  Date *
                  <input required type="date" value={form.date} onChange={(event) => setField("date", event.target.value)} className="h-11 rounded-xl border border-gray-200 px-3 font-normal" />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  Guests *
                  <input required type="number" min="1" max="20" value={form.guests} onChange={(event) => setField("guests", event.target.value)} className="h-11 rounded-xl border border-gray-200 px-3 font-normal" />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  Name *
                  <input required value={form.name} onChange={(event) => setField("name", event.target.value)} className="h-11 rounded-xl border border-gray-200 px-3 font-normal" />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  Email *
                  <input required type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} className="h-11 rounded-xl border border-gray-200 px-3 font-normal" />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  Phone
                  <input value={form.phone} onChange={(event) => setField("phone", event.target.value)} className="h-11 rounded-xl border border-gray-200 px-3 font-normal" />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  Notes
                  <textarea value={form.notes} onChange={(event) => setField("notes", event.target.value)} rows={3} placeholder="Hotel pickup or questions" className="rounded-xl border border-gray-200 px-3 py-2 font-normal" />
                </label>
              </div>
              <button disabled={sending} className="mt-5 h-11 w-full rounded-xl bg-[#ea580c] font-bold text-white" type="submit">
                {sending ? "Sending..." : "Send request"}
              </button>
              {message ? <p className="mt-3 text-sm text-gray-600">{message}</p> : null}
            </form>
          </main>
        </>
      ) : null}
      <Footer />
    </div>
  );
}
