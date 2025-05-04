 import mongoose from "mongoose";
 type Connectionobject = {
   isConnected?: number
 };
 const connection:Connectionobject={}
 async function dbconnect():Promise<void> {

   try{
const db =await mongoose.connect(process.env.url as string || "mongodb://localhost:27017/studentdb")
.then((db) => {
  console.log(db)
     console.log("Connected to database");

   if(connection.isConnected) {
    console.log("Already connected");
    connection.isConnected = 1;
     return;
   }
     return db;
   })
   }catch(err){
     console.log(err)
   }
 }
 export default dbconnect;