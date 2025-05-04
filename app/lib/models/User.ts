import mongoose from "mongoose";
import dbconnect from "@/app/lib/db";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },lastName:{
        type:String,
        required:true
    },age:{
        type:Number,
        required:true
    },email:{
        type:String,
        required:true
    },password:{
        type:String,
        required:true
    }
})
userSchema.pre('save',async function(next){
 if(!this.isModified('password')){
    return next();
 }
 const salt =await bcrypt.genSalt(10);
 this.password = await bcrypt.hash(this.password,salt);
})
userSchema.methods.matchPassword = async function(enteredPassword:string){
    return await bcrypt.compare(enteredPassword,this.password);
}
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;    