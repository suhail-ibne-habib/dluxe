"use client";

import { apiFetch } from '@/lib/api';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plane, 
  Calendar, 
  Clock, 
  History, 
  Settings, 
  LogOut,
  User,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { authClient, clearSessionToken } from '@/lib/auth-client';

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const user = session?.user;

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await apiFetch(`/api/reservations?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(Array.isArray(data) ? data : []);
        } else {
          setBookingsError("Bookings could not be loaded. The rest of your account is still available.");
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setBookingsError("Bookings could not be loaded. The rest of your account is still available.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, user, isPending]);

  const handleLogout = async () => {
    await authClient.signOut();
    clearSessionToken();
    window.location.href = '/login';
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    const { error } = await authClient.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      revokeOtherSessions: true,
    });
    if (error) {
      setPasswordMessage(error.message || 'Could not change the password');
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '' });
    setPasswordMessage('Password updated.');
  };

  const upcomingBookings = bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled');
  const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/dluxe-logo.jpg" alt="D'LUXE Logo" className="h-16 w-auto object-contain rounded-xl shadow-sm" />
          </a>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-gray-900">{user?.name || 'Guest User'}</span>
              <span className="text-xs text-gray-500 font-medium">{user?.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 pt-10 space-y-10">
        {/* Welcome Section */}
        <section>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back,</h1>
          <p className="text-gray-500 text-lg mt-1 font-medium">Your current flight status and mission details.</p>
        </section>

        {/* Action Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Missions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Current Missions
              </h2>
            </div>

            {bookingsError && (
              <p className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">{bookingsError}</p>
            )}
            {!bookingsError && loading && (
              <p className="text-sm text-gray-500">Loading your bookings...</p>
            )}
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${
                          booking.serviceLevel === 'VIP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Star className="h-6 w-6 fill-current" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{booking.serviceLevel} SERVICE</p>
                          <p className="text-lg font-bold text-gray-900">{booking.fromAirport?.split(',')[0]} → {booking.toAirport?.split(',')[0] || 'TBD'}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                        booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {booking.status === 'Confirmed' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {booking.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Departure</p>
                        <div className="flex items-center gap-2 text-gray-900">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <span className="font-bold">{booking.departureDate ? new Date(booking.departureDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Passengers</p>
                        <div className="flex items-center gap-2 text-gray-900">
                          <User className="h-4 w-4 text-orange-600" />
                          <span className="font-bold">{booking.passengers} Adult(s)</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-right flex flex-col justify-end">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Booking Ref</p>
                        <p className="text-gray-900 font-mono font-bold">#{booking._id.toString().slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium text-lg">No active missions scheduled.</p>
                <button 
                  onClick={() => router.push('/')}
                  className="mt-6 text-orange-600 font-bold hover:underline"
                >
                  Book your next flight →
                </button>
              </div>
            )}
          </div>

          {/* Sidebar / Benefits */}
          <div className="space-y-8">
            {/* Quick Support */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Change password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <input
                  type="password"
                  minLength={8}
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-200"
                  required
                />
                <input
                  type="password"
                  minLength={8}
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-200"
                  required
                />
                {passwordMessage && <p className="text-sm text-gray-600">{passwordMessage}</p>}
                <button type="submit" className="w-full py-3 bg-gray-900 hover:bg-orange-600 text-white font-bold rounded-2xl">
                  Update password
                </button>
              </form>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Your dedicated concierge team is available 24/7 for any changes or delays.</p>
              <button className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-100">
                Contact Concierge
              </button>
            </div>
          </div>
        </div>

        {/* History Section */}
        {pastBookings.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History className="h-5 w-5 text-gray-400" />
              Mission History
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastBookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-gray-400">{booking.departureDate ? new Date(booking.departureDate).toLocaleDateString() : 'N/A'}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{booking.serviceLevel}</span>
                  </div>
                  <p className="font-bold text-gray-900 truncate">{booking.fromAirport?.split(',')[0]} → {booking.toAirport?.split(',')[0]}</p>
                  <p className="text-sm text-gray-500 mt-1">Status: <span className="text-gray-700 font-bold">{booking.status}</span></p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
