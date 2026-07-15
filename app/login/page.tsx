"use client";
import {GoogleLogin} from "@react-oauth/google";

export default function Login()
{
    return(
        <GoogleLogin onSuccess={async(response)=>{
            const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    token:response.credential
                }),
            });
            const data=await res.json();
            if (!res.ok) throw new Error(data.error||"Login failed");
            if (data.jwt) 
            {
                localStorage.setItem("token",data.jwt);
                console.log("Logged in:",data)
            }
        }}
        />
);
}