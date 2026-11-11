'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/lib/auth"

export default function RegisterPage(){
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleSubmit(event:React.SubmitEvent<HTMLFormElement>){
        event.preventDefault()
        setError('')
        try{
            await registerUser({username,password,email})
            router.replace("/login")
        }catch(error){
            setError(error instanceof Error? error.message : "Failed to register")
        }
    }

    return(
        <main className="min-h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
                 <h1 className="text-2xl font-bold">Create Account</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Register
        </button>

        {error && <p className="text-red-500">{error}</p>}
            </form>
        </main>
    )

}