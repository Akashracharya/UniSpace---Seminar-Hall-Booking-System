'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Data States
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'halls'
  const [loading, setLoading] = useState(true);

  // Form State for New Hall
  const [showHallForm, setShowHallForm] = useState(false);
  const [newHall, setNewHall] = useState({
    name: '',
    capacity: '',
    location: '',
    image: '',
    amenities: '' // We will handle this as comma-separated text
  });

  // --- SECURITY CHECK ---
  useEffect(() => {
    if (status === 'authenticated') {
      if (!session.user.isAdmin) router.push('/');
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  // --- DATA FETCHING ---
  const fetchAllData = async () => {
    setLoading(true);
    // Fetch Bookings
    const bookingRes = await fetch('/api/bookings');
    const bookingData = await bookingRes.json();
    if (bookingData.success) setBookings(bookingData.data);

    // Fetch Halls
    const hallRes = await fetch('/api/halls');
    const hallData = await hallRes.json();
    if (hallData.success) setHalls(hallData.data);
    
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.isAdmin) fetchAllData();
  }, [session]);

  // --- BOOKING ACTIONS ---
  const updateBookingStatus = async (id, newStatus) => {
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    fetchAllData();
  };

  const deleteBooking = async (id) => {
    if(!confirm("Delete this booking?")) return;
    await fetch(`/api/bookings?id=${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  // --- HALL ACTIONS ---
  const handleHallSubmit = async (e) => {
    e.preventDefault();
    
    // Convert amenities string "AC, Projector" -> Array ["AC", "Projector"]
    const formattedHall = {
      ...newHall,
      amenities: newHall.amenities.split(',').map(item => item.trim())
    };

    const res = await fetch('/api/halls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedHall)
    });

    if (res.ok) {
      alert("Hall Created Successfully!");
      setShowHallForm(false);
      setNewHall({ name: '', capacity: '', location: '', image: '', amenities: '' });
      fetchAllData();
    } else {
      alert("Failed to create hall");
    }
  };

  const deleteHall = async (id) => {
    if(!confirm("⚠️ WARNING: Deleting a hall will not delete its past bookings, but it will disappear from the homepage. Continue?")) return;
    
    const res = await fetch(`/api/halls?id=${id}`, { method: 'DELETE' });
    if(res.ok) fetchAllData();
  };

  if (loading || status === 'loading') return <div className="p-10 text-center">Loading Admin Panel...</div>;
  if (!session?.user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">👑 Admin Control Panel</h1>

        {/* TABS */}
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'bookings' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Manage Bookings
          </button>
          <button 
            onClick={() => setActiveTab('halls')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'halls' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Manage Halls
          </button>
        </div>

        {/* TAB CONTENT: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-4">Hall</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{booking.hallId?.name || 'Unknown'}</td>
                    <td className="p-4">{new Date(booking.startTime).toLocaleDateString()}</td>
                    <td className="p-4">{booking.userEmail}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>{booking.status}</span>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      {booking.status === 'pending' && (
                        <>
                          <button onClick={() => updateBookingStatus(booking._id, 'confirmed')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                          <button onClick={() => updateBookingStatus(booking._id, 'rejected')} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">Reject</button>
                        </>
                      )}
                      <button onClick={() => deleteBooking(booking._id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB CONTENT: HALLS */}
        {activeTab === 'halls' && (
          <div>
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setShowHallForm(!showHallForm)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold"
              >
                {showHallForm ? 'Close Form' : '+ Add New Hall'}
              </button>
            </div>

            {/* ADD HALL FORM */}
            {showHallForm && (
              <div className="bg-white p-6 rounded-xl shadow mb-6 border border-green-100">
                <h3 className="text-xl font-bold mb-4">Add New Hall</h3>
                <form onSubmit={handleHallSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required placeholder="Hall Name" className="p-2 border rounded" value={newHall.name} onChange={e => setNewHall({...newHall, name: e.target.value})} />
                  <input required type="number" placeholder="Capacity" className="p-2 border rounded" value={newHall.capacity} onChange={e => setNewHall({...newHall, capacity: e.target.value})} />
                  <input required placeholder="Location" className="p-2 border rounded" value={newHall.location} onChange={e => setNewHall({...newHall, location: e.target.value})} />
                  <input required placeholder="Image URL (e.g., https://example.com/hall.jpg)" className="p-2 border rounded" value={newHall.image} onChange={e => setNewHall({...newHall, image: e.target.value})} />
                  <input placeholder="Amenities (comma separated: Projector, AC)" className="p-2 border rounded md:col-span-2" value={newHall.amenities} onChange={e => setNewHall({...newHall, amenities: e.target.value})} />
                  <button type="submit" className="bg-blue-600 text-white py-2 rounded md:col-span-2 hover:bg-blue-700">Create Hall</button>
                </form>
              </div>
            )}

            {/* HALL LIST */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {halls.map((hall) => (
                <div key={hall._id} className="bg-white rounded-xl shadow overflow-hidden border">
                  <img src={hall.image || 'https://placehold.co/600x400'} alt={hall.name} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{hall.name}</h3>
                    <p className="text-sm text-gray-500">{hall.location}</p>
                    <p className="text-sm text-gray-500">Capacity: {hall.capacity}</p>
                    <button 
                      onClick={() => deleteHall(hall._id)}
                      className="mt-4 w-full bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 transition"
                    >
                      Remove Hall
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}