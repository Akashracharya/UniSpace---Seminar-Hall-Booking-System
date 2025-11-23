import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Hall from '@/models/Hall'; // We need this to show Hall Names

// POST method: Use this to CREATE a new booking
export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    
    // 1. Destructure the data coming from the frontend
    const { hallId, userEmail, startTime, endTime, purpose } = body;

    // 2. Convert string dates to real Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 3. Basic Safety Checks
    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // 4. THE CONFLICT DETECTOR (Crucial Step)
    // We search for any EXISTING booking that overlaps with the NEW request.
    // Logic: A conflict exists if (NewStart < OldEnd) AND (NewEnd > OldStart)
    const existingBooking = await Booking.findOne({
      hallId: hallId,
      status: { $ne: 'cancelled' }, // Ignore cancelled bookings
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: '❌ Conflict! This time slot is already booked.' },
        { status: 409 } // 409 means "Conflict"
      );
    }

    // 5. If no conflict, save the booking!
    const newBooking = await Booking.create({
      hallId,
      userEmail,
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

export async function GET(request) {
  await dbConnect();

  try {
    // We use .populate('hallId') to replace the ID with the actual Hall Name
    const bookings = await Booking.find({})
      .populate('hallId', 'name') 
      .sort({ startTime: 1 }); // Sort by closest date first

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Cancel a specific booking
export async function DELETE(request) {
  await dbConnect();

  try {
    // Get the booking ID from the URL (e.g., ?id=12345)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 });
    }

    // Delete the booking
    await Booking.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}