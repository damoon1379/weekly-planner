import { apiRequest } from "./api";

interface RegisterData {
    username:string,
    password:string,
    email:string,
}

interface LoginData {
    username:string,
    password:string,
}

interface TokenResponse {
    access:string,
}


export async function registerUser(data:RegisterData){
    return apiRequest('/register/',{
        method:'POST',
        body:JSON.stringify(data)
    })
}

export async function loginUser(data:LoginData): Promise<TokenResponse>{
    return apiRequest('/token/',{
        method:"POST",
        body:JSON.stringify(data)
    })
}

export async function refreshAccessToken():Promise<TokenResponse>{
    return apiRequest('/token/refresh/',{
        method:"POST"
    })
}
export async function logoutUser(){
    return apiRequest("/logout/",{
        method:"POST"
    })
}