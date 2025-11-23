'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // <--- Import this

export default function Dashboard() {
  const { data: session } = useSession(); // <--- Get current user info
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`/api/bookings?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.success) {
        fetchBookings(); 
      } else {
        alert(data.error); // Show the specific error message from server
      }
    } catch (error) {
      alert('Error deleting booking');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    const activeStyle = styles[status] || styles.cancelled;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${activeStyle}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading schedule...</div>;

  return (
    <div className="mt-15 min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seminar Hall Schedule</h1>
          <Link href="/" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
            + Book New Slot
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Hall Name</th>
                <th className="p-4 font-semibold text-gray-600">Date & Time</th>
                <th className="p-4 font-semibold text-gray-600">Booked By</th>
                <th className="p-4 font-semibold text-gray-600">Purpose</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  
                  // LOGIC: Can this user delete this booking?
                  const isOwner = session?.user?.email === booking.userEmail;
                  const isAdmin = session?.user?.isAdmin;
                  const canDelete = isOwner || isAdmin;

                  return (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-blue-900">
                        {booking.hallId?.name || 'Unknown Hall'}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {booking.userEmail}
                        {/* Add a (You) tag if it's their booking */}
                        {isOwner && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">You</span>}
                      </td>
                      <td className="p-4 text-gray-600 italic">"{booking.purpose}"</td>
                      <td className="p-4">{getStatusBadge(booking.status)}</td>
                      <td className="p-4">
                        {/* Only show Cancel button if they have permission */}
                        {canDelete && booking.status !== 'rejected' && (
                          <button 
                            onClick={() => handleDelete(booking._id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}