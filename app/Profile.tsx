'use client'
import { useState } from "react";
function Profile(){
const [profile,setprofile] = useState(false)
function handleprofile(){
    setprofile(!profile)
}
return(
    <>
    <button onClick={handleprofile}></button>
    </>
)
}
export default Profile;