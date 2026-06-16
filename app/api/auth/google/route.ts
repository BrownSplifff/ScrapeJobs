import { NextResponse } from "next/server";

export async function POST(req:Request) {
    try{
        const {token} = await req.json();
        console.log("token recieved: ", token)
        return NextResponse.json({
            success: true
        })
    }catch(error){
        return NextResponse.json(
            {success: false},
            {status: 500}
        )
    }
}