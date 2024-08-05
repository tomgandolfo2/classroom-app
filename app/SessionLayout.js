// app/SessionLayout.js

"use client"; // Ensure this is a Client Component

import { SessionProvider } from "next-auth/react";

export default function SessionLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
