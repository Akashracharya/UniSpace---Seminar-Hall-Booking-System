'use client';

import { useState, use } from 'react'; // <--- We added 'use' here
import { useRouter } from 'next/navigation';

export default function BookingPage({ params }) {
  const router = useRouter();
  
  // FIX: In Next.js 15, params is a Promise. We must unwrap it with use()
  const resolvedParams = use(params); 
  const hallId = resolvedParams.id;

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    email: '',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
          userEmail: formData.email,
          purpose: formData.purpose,
          startTime: startDateTime,
          endTime: endDateTime,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage('✅ Booking Successful! Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Book Hall</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full p-2 border rounded-md"
              onChange={handleChange}
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
            {loading ? 'Checking Availability...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}