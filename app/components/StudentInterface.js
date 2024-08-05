// app/components/StudentInterface.js

"use client";

export default function StudentInterface({ student, isSelected }) {
  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded-lg mt-4">
      <h1 className="text-2xl font-bold mb-4">{student.name}'s Interface</h1>
      <div className={`p-4 ${isSelected ? "bg-yellow-100" : "bg-gray-100"}`}>
        {isSelected ? (
          <p className="text-lg font-semibold text-center">
            It's your turn to answer!
          </p>
        ) : (
          <p className="text-lg text-center">Waiting for your turn...</p>
        )}
      </div>
    </div>
  );
}
