import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Hall from '@/models/Hall';

export async function GET() {
  // 1. Connect to the database
  await dbConnect();

  try {
    // 2. Check if halls already exist (so we don't create duplicates!)
    const existingHalls = await Hall.countDocuments();
    
    if (existingHalls > 0) {
      return NextResponse.json({ 
        message: 'Halls already exist. No changes made.', 
        count: existingHalls 
      });
    }

    // 3. Define your 3 Seminar Halls
    const hallsToCreate = [
      {
        name: 'Seminar Hall A',
        capacity: 60,
        location: 'Ground Floor, Block A',
        image: 'https://placehold.co/600x400?text=Hall+A', // Placeholder image
      },
      {
        name: 'Seminar Hall B',
        capacity: 120,
        location: 'Second Floor, Block B',
        image: 'https://placehold.co/600x400?text=Hall+B',
      },
      {
        name: 'Main Auditorium',
        capacity: 300,
        location: 'Admin Block',
        image: 'https://placehold.co/600x400?text=Auditorium',
      }
    ];

    // 4. Insert them into the database
    await Hall.insertMany(hallsToCreate);

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully created 3 halls!' 
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}