process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { serialize } from "cookie";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";

const MAX_AGE = 24 * 60 * 60;
const SECRET = process.env.JWT_SECRET || "supersecret";


// Hardcoded users
const users = [
  { username: "achraf@example.com", password: "123", sector: "textile" },
  { username: "user1@example.com", password: "user123", sector: "verre" },
  { username: "akram@example.com", password: "123", sector: "luxe" },
];

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  try {
    // Find the user in the hardcoded list
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT token
    const token = sign({ username: user.username, userSector: user.sector }, SECRET, {
      expiresIn: MAX_AGE,
    });
    console.log("Generated JWT payload:", { username: user.username, userSector: user.sector });

    const serialized = serialize("OurSiteJWT", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: MAX_AGE,
      path: "/",
    });

    return NextResponse.json(
      { user },
      {
        status: 200,
        headers: { "Set-Cookie": serialized },
      }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
