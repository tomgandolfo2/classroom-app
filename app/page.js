// app/page.js

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to the Classroom App
        </h1>
        <p className="text-lg mb-6">
          A powerful tool for teachers to manage classroom activities
          efficiently.
        </p>
        <Link href="/dashboard">
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition">
            Go to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
