// app/components/Reporting.js

"use client";

import { useState } from "react";

export default function Reporting({ feedback }) {
  const generateReport = () => {
    return Object.entries(feedback).map(([id, { response, comment }]) => ({
      studentId: id,
      response,
      comment,
    }));
  };

  const report = generateReport();

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded-lg mt-4">
      <h2 className="text-xl font-semibold mb-2">Student Report</h2>
      <ul>
        {report.map(({ studentId, response, comment }, index) => (
          <li key={index} className="border-b p-2">
            Student ID: {studentId}, Response: {response}, Comment: {comment}
          </li>
        ))}
      </ul>
    </div>
  );
}
