'use client'

import { useAuth } from "@/context/AuthContext";
import { apiRequest, ApiError } from "@/lib/api";
import { refreshAccessToken } from "@/lib/auth";
import { useCallback } from "react";

let refreshPromise:Promise<string> | null = null

export function useApi(){
    const {accessToken, setAccessToken,logout} = useAuth()

    const refreshToken = useCallback(async()=>{
        if(!refreshPromise){
        refreshPromise = refreshAccessToken()
        .then(({access})=>{
            setAccessToken(access)
            return access
        })
        .catch(async (error)=>{
           await logout()
            throw error
        })
        .finally(()=>{
            refreshPromise=null
        })
     }
     return refreshPromise
    },[logout, setAccessToken])

    const request = useCallback(async(endpoint:string,options:RequestInit={})=>{
        try{
            return await apiRequest(endpoint,{
                ...options,
                headers:{
                    ...options.headers,
                    Authorization:`Bearer ${accessToken}`,
                }
            })
        }catch(error){
            if(error instanceof ApiError && error.status === 401){
                const newAccessToken = await refreshToken()

                return await apiRequest(endpoint,{
                    ...options,
                    headers:{
                        ...options.headers,
                        Authorization: `Bearer ${newAccessToken}`
                    }
                })
            }
            throw error
        }
    },[accessToken,refreshToken])
    

    return {request}
}