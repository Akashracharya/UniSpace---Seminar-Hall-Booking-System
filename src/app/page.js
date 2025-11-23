import Link from 'next/link';
import dbConnect from '@/lib/db';
import Hall from '@/models/Hall';

// This is an Async Server Component. 
// It fetches data directly on the server before sending HTML to the browser.
export default async function Home() {
  // 1. Connect to our database
  await dbConnect();

  // 2. Fetch all halls from the database
  // .lean() converts the complex Mongoose objects into simple JavaScript objects (faster)
  const halls = await Hall.find({}).lean();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          College Seminar Hall Booking
        </h1>
        <p className="text-lg text-gray-600">
          Select a venue below to check availability and book your slot.
        </p>
      </div>

      {/* Grid of Halls */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {halls.map((hall) => (
          <div key={hall._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
            
            {/* Image Section (using the placeholder URL we saved) */}
            <div className="h-48 bg-gray-200 relative">
              <img 
                src={hall.image || 'https://placehold.co/600x400'} 
                alt={hall.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600 shadow-sm">
                Capacity: {hall.capacity}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{hall.name}</h2>
              <p className="text-gray-500 mb-4 flex items-center">
                📍 {hall.location}
              </p>
              
              {/* This button links to a dynamic page we will build next */}
              <Link 
                href={`/book/${hall._id}`} 
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}