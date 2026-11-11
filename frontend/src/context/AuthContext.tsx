'use client'
import { createContext,useContext,useState,useEffect,ReactNode, useCallback } from "react"
import { refreshAccessToken, logoutUser } from "@/lib/auth"

interface AuthContextType {
    accessToken:string | null,
    setAccessToken: (token:string | null)=>void
    logout:()=>Promise<void>,
    isAuthLoading:boolean,

}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({children}:{children:ReactNode}){
const[accessToken, setAccessToken] = useState<string | null>(null)
const [isAuthLoading, setIsAuthLoading] = useState(true)

useEffect(()=>{
    async function restoreSession(){
        try{
        const {access} = await refreshAccessToken()
        setAccessToken(access)
        }catch{
            setAccessToken(null)
        }finally{
            setIsAuthLoading(false)
        }
    }
    restoreSession()
},[])
const logout = useCallback(async ()=> {
    try{
        await logoutUser()
    }finally{
        setAccessToken(null)
    }
},[])
    return (
        <AuthContext.Provider value={{accessToken,setAccessToken,logout,isAuthLoading}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    const context = useContext(AuthContext)
    
    if(!context){
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}