// app/middleware.js

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// This secret should be the same as your NEXTAUTH_SECRET
const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req) {
  const token = await getToken({ req, secret });

  if (!token) {
    // Redirect to the sign-in page if the user is not authenticated
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  return NextResponse.next();
}

// Define protected paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/students/:path*",
    "/api/feedback/:path*",
  ],
};
