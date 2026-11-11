'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";

export default function AuthGuard({children}:{children:ReactNode}){
    const router = useRouter()
    const {accessToken, isAuthLoading} = useAuth()

    useEffect(()=>{
        if(!accessToken && !isAuthLoading){
            router.replace("/login")
        }

    },[accessToken,router,isAuthLoading])

    if(isAuthLoading || !accessToken){
        return null
    }

    return children
}