import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"


import { adminDb } from "@/lib/firebase-admin";


export async function POST(req: Request) {
    try {
    const { fullName, email, password } = await req.json();

    const existing = await adminDb
      .collection("users")
      .where("email", "==", email)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await adminDb.collection("users").add({
      fullName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
  console.error(error);

  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}
}
