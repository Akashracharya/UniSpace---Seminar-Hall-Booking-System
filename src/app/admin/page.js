'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Protect the Page
  useEffect(() => {
    if (status === 'authenticated') {
      if (!session.user.isAdmin) {
        router.push('/'); // Kick out non-admins
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  // 2. Fetch Data
  const fetchBookings = async () => {
    const res = await fetch('/api/bookings'); // Fetch all
    const data = await res.json();
    if (data.success) setBookings(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 3. Handle Actions
  const updateStatus = async (id, newStatus) => {
    setLoading(true);
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    await fetchBookings(); // Refresh list
  };

  const deleteBooking = async (id) => {
    if(!confirm("Permanently delete this?")) return;
    await fetch(`/api/bookings?id=${id}`, { method: 'DELETE' });
    fetchBookings();
  };

  if (loading || status === 'loading') return <div className="p-10 text-center">Loading Admin Panel...</div>;
  if (!session?.user?.isAdmin) return null; // Don't show anything while redirecting

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">👑 Admin Control Panel</h1>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-4">Hall</th>
                <th className="p-4">Date/Time</th>
                <th className="p-4">Student</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold">{booking.hallId?.name}</td>
                  <td className="p-4 text-sm">
                    {new Date(booking.startTime).toLocaleDateString()} <br/>
                    {new Date(booking.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </td>
                  <td className="p-4">{booking.userEmail}</td>
                  <td className="p-4 text-gray-600">{booking.purpose}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2 justify-center">
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateStatus(booking._id, 'confirmed')}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateStatus(booking._id, 'rejected')}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => deleteBooking(booking._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}