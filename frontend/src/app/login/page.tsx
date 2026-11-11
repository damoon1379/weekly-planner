'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { loginUser } from '@/lib/auth'

export default function LoginPage(){
    const [username,setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const {setAccessToken} = useAuth()
    const router = useRouter()

    async function handleSubmit(event:React.SubmitEvent<HTMLFormElement>){
    
       event.preventDefault()
       setError("")
       try{
        const {access} = await loginUser({username,password})
        if(!access){
        throw new Error("access token was not received")    
        }
        setAccessToken(access)
        router.replace('/')
       }catch(error){
        setError(error instanceof Error ? error.message : 'Login failed')
       }

    }

    return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          Login
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </form>
    </main>
  );
}