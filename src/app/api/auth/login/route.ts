process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { serialize } from "cookie";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";

const MAX_AGE = 24 * 60 * 60;

export async function POST(request: Request) {
  const BASE_URL = "https://localhost:3000";

  const body = await request.json();

  const { username, password } = body;

  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "origin": "http://localhost:8080"
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();
    // console.log(data);
    const secret = process.env.JWT_SECRET || "";

    const userSector = data.user.sector;

    const token = sign({ username, userSector }, secret, { expiresIn: MAX_AGE });

    const serialized = serialize("OurSiteJWT", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: MAX_AGE,
      path: "/",
    });
    
    // console.log(serialized);
    

    return NextResponse.json(data, {
      status: 201,
      headers: { "Set-Cookie": serialized },
    });
  } catch (error) {
    console.log("Error during login:", error);
    return NextResponse.json(error, {status: 500});
  }
}
