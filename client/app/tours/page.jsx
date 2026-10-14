"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tours")
      .then((res) => res.json())
      .then((data) => setTours(Array.isArray(data) ? data.filter((tour) => tour.isActive) : []))
      .catch(() => setTours([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(tours.map((tour) => tour.category).filter(Boolean))];
  const visible = category === "All" ? tours : tours.filter((tour) => tour.category === category);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f6f5] text-[#0f172a]">
      <Navbar />
      <header className="relative h-[460px] overflow-hidden md:h-[520px]">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80"
          alt="Island coastline"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/50" />
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 pt-24 text-center text-white">
          <h1 className="text-balance text-4xl font-extrabold leading-tight drop-shadow-md md:text-5xl">
            Tours and rentals in St. Maarten
          </h1>
          <p className="mt-4 max-w-2xl text-balance text-sm leading-relaxed text-white/95 md:text-lg">
            Scooter rides, ATV trails, and guided hikes. Choose a package and send a request. The team confirms the time with you.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`h-10 rounded-full px-4 text-sm font-semibold ${category === item ? "bg-[#0f172a] text-white" : "bg-white text-[#0f172a]"}`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? <p className="mt-10 text-sm text-gray-500">Loading tours...</p> : null}
        {!loading && visible.length === 0 ? <p className="mt-10 text-sm text-gray-500">No tours in this category yet.</p> : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((tour) => (
            <Link key={tour.slug} href={`/tours/${tour.slug}`} className="overflow-hidden rounded-[24px] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="relative">
                <img src={tour.imageUrl} alt="" className="h-48 w-full object-cover" />
                <span className="absolute right-3 top-3 rounded-full bg-[#8fbf3f] px-3 py-1 text-xs font-semibold text-white">{tour.category}</span>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-extrabold">{tour.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">{tour.summary}</p>
                <div className="mt-4 flex items-end justify-between border-t border-gray-100 pt-4">
                  <p>
                    <span className="text-2xl font-extrabold">${Number(tour.price).toLocaleString()}</span>
                    <span className="text-sm text-gray-400"> / person</span>
                  </p>
                  <span className="text-sm font-semibold text-[#6f9a32]">{tour.duration}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
