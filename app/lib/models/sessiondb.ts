import mongoose from "mongoose";
import dbconnect from "@/app/lib/db";

const session = new mongoose.Schema({
    userId: String,
    expiresAt: Date,
})
export const Session = mongoose.models.Session || mongoose.model('Session', session)
