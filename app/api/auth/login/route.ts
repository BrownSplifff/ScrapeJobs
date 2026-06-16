import { adminDb } from "@/lib/firebase-admin"
import bcrypt from "bcryptjs"
import { error } from "console"
import { NextResponse } from "next/server"

export async function POST(req:Request) {

    try{
        const {email, password} = await req.json()

        const existing = await adminDb
            .collection("users")
            .where("email", "==", email)
            .get()

        if(existing.empty){
            return NextResponse.json(
                {error: "User doesn't exist, please register first"},
                {status: 400}
            )
        }

        const userDoc = existing.docs[0]
        const user = userDoc.data()

        const isValidPassword = await bcrypt.compare(
            password,
            user.password
        )

        if(!isValidPassword){
            return NextResponse.json(
                {error: "Invalid Password"},
                {status: 401}
            )
        }

        return NextResponse.json({
            success: true,
            user: {
                id: userDoc.id,
                fullName: user.fullName,
                email: user.email,
                token: user.token
            }
        })
    } catch(error){
        console.error(error)

        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        )
    }
    
}