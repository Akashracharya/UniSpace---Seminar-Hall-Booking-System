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
    // ... inside POST function ...
    
    const newBooking = await Booking.create({
      hallId,
      userEmail,
      startTime: start,
      endTime: end,
      purpose,
      status: 'pending', // <--- CHANGED THIS from 'confirmed'
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
// ... imports are same ...

// DELETE: Cancel a booking (SECURE VERSION)
export async function DELETE(request) {
  await dbConnect();
  
  // 1. Check if user is logged in
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    // 2. Find the booking first (don't delete it yet!)
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // 3. AUTHORIZATION CHECK
    // Allow if: User is Admin OR User is the Owner
    const isOwner = booking.userEmail === session.user.email;
    const isAdmin = session.user.isAdmin;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: '⛔ Forbidden: You can only cancel your own bookings.' }, 
        { status: 403 }
      );
    }

    // 4. If passed, Delete it
    await Booking.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Admin updates the status (Approve/Reject)
export async function PATCH(request) {
  await dbConnect();
  
  // 1. Verify Admin Logic
  const session = await getServerSession(authOptions);
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status } = body; // e.g. { id: "123", status: "confirmed" }

    if (!['confirmed', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: status },
      { new: true } // Return the updated version
    );

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}