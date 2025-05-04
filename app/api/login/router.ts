import dbconnect from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { NextResponse } from "next/server";
import { useState } from "react";
const [userdata,setUserdata] =useState([])
export async function POST(request:Request){

    try{
        const data = await request.json();
        console.log(data.email);
        console.log(data.password);
        console.log(data);
        setUserdata(data)
        return NextResponse.json({ success: true, data: data });
    }catch(error){
     console.log(error);
     return NextResponse.json({unsuccess:false,error:"server throw the error in the system"})
    }
     
}