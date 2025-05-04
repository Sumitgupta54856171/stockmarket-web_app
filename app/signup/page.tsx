import React from "react"
import StudentDetailForm from "./Student"

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Signup</h1>
      <StudentDetailForm />
    </div>
  )
}