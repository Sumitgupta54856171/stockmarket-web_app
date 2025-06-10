import { NextResponse } from 'next/server';
import 'server-only'
import dbconnect from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { encrypt, decrypt } from '@/app/lib/session';
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers';
import {SignJWT, jwtVerify} from 'jose'
import { Session } from '@/app/lib/models/sessiondb';



export async function POST(request: Request) {
  try {
    await dbconnect();
    const data = await request.json();
    console.log(data)
   const user = await User.find({email:data.email,password:data.password})
   console.log(user)
  if(user){
  console.log("user")
  console.log(data.email)

    const cookieStore = await cookies()
    const userId  = data.email
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await encrypt({ userId, expiresAt })
    
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'strict',
      path: '/',
    })
    const sessionId = await decrypt(session)
    const savesesson = new Session(sessionId)
    await savesesson.save()
    console.log("session")
    const response = NextResponse.json({success:true,message:"user is valid"},);

    return NextResponse.json({success:true,message:"user is valid"})
   
    
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
