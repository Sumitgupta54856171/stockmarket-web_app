import { NextResponse } from 'next/server';
import dbconnect from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { createSession } from '@/app/lib/session';
import { redirect } from 'next/dist/server/api-utils';


export async function POST(request: Request) {
  try {
    await dbconnect();
    const data = await request.json();
    console.log(data)
   const user = await User.find({email:data.email,password:data.password})
  if(user){
    createSession(data.email)
   
    return NextResponse.json({ success: true ,redirect:'/' });
   
    
  }else{
    return NextResponse.json({error:"email is invalid "},{status:404})
  }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save student data' },
      { status: 500 }
    );
  }
}
export async function POST(request:Request){
  
} 