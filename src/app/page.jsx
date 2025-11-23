import Link from 'next/link';
import dbConnect from '@/lib/db';
import Hall from '@/models/Hall';

export default async function Home() {
  await dbConnect();
  // Fetch halls from DB
  const halls = await Hall.find({}).lean();

  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 mb-10 border border-blue-100 font-semibold text-2xl">
            AJ INSTITUTE OF ENGINEERING AND TECHNOLOGY
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-9">
            Seminar Halls, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Booked For Events
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your event planning. Check real-time availability, secure your slot instantly, and manage approvals—all in one place.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#halls" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30">
              Explore Halls
            </a>
            <Link href="/dashboard" className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-50 transition">
              Check Schedule
            </Link>
          </div>
        </div>
      </section>

      {/* 2. HALLS GRID SECTION */}
      <section id="halls" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Premium Venues</h2>
            <p className="text-gray-600">Select the perfect space for your seminar, workshop, or guest lecture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {halls.map((hall) => (
              <div key={hall._id} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                
                {/* IMAGE AREA */}
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div> {/* Skeleton loader effect if image loads slow */}
                  <img 
                    src={hall.image || 'https://placehold.co/600x400?text=No+Image'} 
                    alt={hall.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                    👥 Capacity: {hall.capacity}
                  </div>
                </div>

                {/* CONTENT AREA */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{hall.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {hall.location}
                    </p>
                  </div>

                  {/* AMENITIES PILLS */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {hall.amenities?.map((item, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-100">
                        {item}
                      </span>
                    ))}
                    {(!hall.amenities || hall.amenities.length === 0) && (
                      <span className="text-xs text-gray-400 italic">Standard Setup</span>
                    )}
                  </div>
                  
                  <Link 
                    href={`/book/${hall._id}`} 
                    className="block w-full text-center bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Book This Hall
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SIMPLE FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">© 2025 UniSpace Booking System. Built for Students.</p>
          <p className="text-gray-500">Made With Love By Akash R Acharya</p>
        </div>
      </footer>

    </main>
  );
}