// app/components/BehaviorTracking.js

"use client";

import { useState } from "react";

export default function BehaviorTracking() {
  const [log, setLog] = useState([]);

  const handleLog = (student, action) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog((prev) => [...prev, { student, action, timestamp }]);
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow rounded-lg mt-4">
      <h2 className="text-xl font-semibold mb-2">Behavior Tracking</h2>
      <ul>
        {log.map((entry, index) => (
          <li key={index} className="border-b p-2">
            {entry.student} - {entry.action} at {entry.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}
