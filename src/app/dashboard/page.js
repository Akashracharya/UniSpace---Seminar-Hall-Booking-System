'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch data
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

  // NEW: Function to handle deletion
  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`/api/bookings?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.success) {
        // Refresh the list after deleting
        fetchBookings(); 
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      alert('Error deleting booking');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading schedule...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Seminar Hall Schedule</h1>

        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Hall</th>
                <th className="p-4 font-semibold text-gray-600">Date & Time</th>
                <th className="p-4 font-semibold text-gray-600">Booked By</th>
                <th className="p-4 font-semibold text-gray-600">Purpose</th>
                <th className="p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-blue-600">
                      {booking.hallId?.name || 'Unknown Hall'}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {new Date(booking.startTime).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4">{booking.userEmail}</td>
                    <td className="p-4 text-gray-600">{booking.purpose}</td>
                    <td className="p-4">
                      {/* DELETE BUTTON */}
                      <button 
                        onClick={() => handleDelete(booking._id)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}