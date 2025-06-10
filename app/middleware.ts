import { getSession } from "@/app/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "./lib/session";
import { Session } from "@/app/lib/models/sessiondb";
const session = (await cookies()).get('session')?.value
const sessionId = await decrypt(session as string);
console.log(sessionId)
export async function middleware(request: NextRequest) {
  console.log(sessionId)
  const datasession = await Session.findOne({ userId: sessionId.userId });
  if(datasession){
  if (!sessionId.userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
}
  return NextResponse.next();
}