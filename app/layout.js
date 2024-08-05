// app/layout.js

import "./globals.css";
import SessionLayout from "./SessionLayout"; // Import the SessionLayout component

export const metadata = {
  title: "Classroom App",
  description: "A classroom management app to assist teachers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <SessionLayout>{children}</SessionLayout>
      </body>
    </html>
  );
}
