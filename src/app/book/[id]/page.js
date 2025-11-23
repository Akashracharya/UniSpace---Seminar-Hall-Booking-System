'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Import session hook

export default function BookingPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession(); // Get session data
  const resolvedParams = use(params);
  const hallId = resolvedParams.id;

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. CHECK LOGIN STATUS
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login'); // Kick them out if not logged in
    }
  }, [status, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hallId,
          // SECURITY: We don't send the email from the form anymore.
          // The backend will grab it directly from the secure session.
          startTime: startDateTime,
          endTime: endDateTime,
          purpose: formData.purpose,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage('✅ Booking Successful! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking if user is logged in
  if (status === 'loading') {
    return <div className="p-10 text-center">Checking access...</div>;
  }

  // If user is not logged in (and hasn't redirected yet), show nothing
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Book Hall</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field is now Read-Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Email</label>
            <input
              type="text"
              value={session.user.email} // Auto-filled from session
              disabled // User cannot change this
              className="mt-1 w-full p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              required
              className="mt-1 w-full p-2 border rounded-md"
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                name="startTime"
                required
                className="mt-1 w-full p-2 border rounded-md"
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                name="endTime"
                required
                className="mt-1 w-full p-2 border rounded-md"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Purpose</label>
            <textarea
              name="purpose"
              required
              rows="3"
              className="mt-1 w-full p-2 border rounded-md"
              onChange={handleChange}
            ></textarea>
          </div>

          {message && (
            <div className={`p-3 rounded text-sm ${message.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}