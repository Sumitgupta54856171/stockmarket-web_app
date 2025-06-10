'use server'
import Loginnav from "./Loginnav"
import Navbar from "./Navbar"

import axios from "axios"
import logout from "./logout"
import Profile from "./Profile"
import { getSession} from "./lib/session"
import LiveCandlestickChart from "./LiveCandlestickChart"



export default async function Home(){

const session = await getSession();
console.log(session)
const userId = session.userId;



   


    return <>
    <div className="overflow-auto">
 {userId?<Profile/>:<Loginnav/>}
 <LiveCandlestickChart/>
   <Navbar></Navbar>
   </div>
    </>
}