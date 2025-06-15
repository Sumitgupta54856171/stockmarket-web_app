import { NextResponse } from 'next/server';
import dbconnect from '@/app/lib/db';
import User from '@/app/lib/models/User';


export async function POST(request: Request) {
  try {
    
    await dbconnect();
    const data = await request.json();
   const existemail = User.find({email:data.email})
   if(!existemail){
     return NextResponse.json({message:"email is register please login"})
   }
   const student = new User(data);
    await student.save();
    
    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save student data' },
      { status: 500 }
    );
  }
} 