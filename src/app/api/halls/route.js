import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Hall from '@/models/Hall';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET: Everyone can see halls
export async function GET() {
  await dbConnect();
  try {
    const halls = await Hall.find({});
    return NextResponse.json({ success: true, data: halls });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Only Admin can ADD a hall
export async function POST(request) {
  await dbConnect();
  
  // 1. Security Check
  const session = await getServerSession(authOptions);
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
  }

  try {
    const body = await request.json();
    // Body should contain: name, capacity, location, image, amenities
    const hall = await Hall.create(body);
    return NextResponse.json({ success: true, data: hall }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE: Only Admin can REMOVE a hall
export async function DELETE(request) {
  await dbConnect();
  
  // 1. Security Check
  const session = await getServerSession(authOptions);
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'Hall ID required' }, { status: 400 });

    await Hall.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Hall deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}