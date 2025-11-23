import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth'; // Import this
import { authOptions } from '@/lib/authOptions'; // Import your shared config

export async function POST(request) {
  await dbConnect();

  // 1. SECURITY CHECK: Is the user logged in?
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { hallId, startTime, endTime, purpose } = body;
    
    // 2. SECURITY CHECK: Use the email from the SESSION, not the user input
    // This prevents "User A" from booking as "User B"
    const userEmail = session.user.email;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return NextResponse.json({ success: false, error: 'End time must be after start time' }, { status: 400 });
    }

    // Check Conflicts
    const existingBooking = await Booking.findOne({
      hallId: hallId,
      status: { $ne: 'cancelled' },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (existingBooking) {
      return NextResponse.json({ success: false, error: '❌ Conflict! This time slot is already booked.' }, { status: 409 });
    }

    // Create Booking with the SECURE email
    const newBooking = await Booking.create({
      hallId,
      userEmail, // <--- Using session email
      startTime: start,
      endTime: end,
      purpose,
      status: 'confirmed'
    });

    return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Ensure GET is also updated to keep using your existing logic
export async function GET(request) {
  await dbConnect();

  try {
    const bookings = await Booking.find({})
      .populate('hallId', 'name') 
      .sort({ startTime: 1 });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Ensure DELETE is also protected!
export async function DELETE(request) {
  await dbConnect();
  
  // Protect Delete too!
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    // Optional: Check if the user owns this booking (or is admin)
    // For now, any logged-in user can delete (we can restrict this later)
    await Booking.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}