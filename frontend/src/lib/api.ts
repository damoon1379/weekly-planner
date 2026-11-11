export class ApiError extends Error{
    status:number
    constructor(message:string, status:number) {
        super(message)
        this.status=status
    }

}

async function getCsrfToken():Promise<string> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/csrf/`,{
        method:"GET",
        credentials:"include",
        cache:"no-store",
    })

    const data = await response.json().catch(()=>null)

    if (!response.ok || !data?.csrfToken){
        throw new ApiError(
            "Unable to obtain csrf token",
            response.status
        )
    }

    return data.csrfToken
}

export async function apiRequest(endpoint:string, options:RequestInit={}){

    const method = (options.method || "GET").toUpperCase()

    const headers = new Headers(options.headers)

    if(!headers.has("Content-Type")){
        headers.set("Content-Type", "application/json")
    }

    const safeMethods = ['GET', 'OPTIONS', 'HEAD', 'TRACE']

    if(!safeMethods.includes(method)){
        const csrfToken = await getCsrfToken()
        headers.set('X-CSRFToken', csrfToken)
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,{
        ...options,
        credentials:"include",
        method,
        headers,
    })

    const data = await response.json().catch(()=>null)
    if(!response.ok){
        throw new ApiError (
            data?.detail 
            || data?.error 
            || Object.values(data || {}).flat().find(value=>typeof value === 'string') 
            ||'Something went wrong',response.status)
    }

    return data
}