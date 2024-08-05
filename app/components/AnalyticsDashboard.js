// app/components/AnalyticsDashboard.js

"use client";

import React, { useState, useEffect } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../utils/chartSetup"; // Ensure the setup is imported here

export default function AnalyticsDashboard() {
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  ); // One month ago
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch("/api/grades");
        if (!response.ok) {
          throw new Error("Failed to fetch grades");
        }
        const data = await response.json();
        console.log("Grades data:", data);
        setGrades(data);
      } catch (error) {
        console.error("Error fetching grades:", error);
        alert(
          "An error occurred while fetching grades. Please try again later."
        );
      }
    };

    const fetchAttendance = async () => {
      try {
        const response = await fetch("/api/attendance");
        if (!response.ok) {
          throw new Error("Failed to fetch attendance");
        }
        const data = await response.json();
        console.log("Attendance data:", data);
        setAttendance(data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        alert(
          "An error occurred while fetching attendance. Please try again later."
        );
      }
    };

    Promise.all([fetchGrades(), fetchAttendance()]).then(() =>
      setLoading(false)
    );
  }, []);

  if (loading) {
    return <p>Loading analytics...</p>;
  }

  // Filter data based on date range
  const filteredGrades = grades.filter(
    (grade) =>
      new Date(grade.date) >= startDate && new Date(grade.date) <= endDate
  );

  const filteredAttendance = attendance.filter(
    (record) =>
      new Date(record.date) >= startDate && new Date(record.date) <= endDate
  );

  const gradeData = {
    labels: filteredGrades.map((grade) => grade.subject),
    datasets: [
      {
        label: "Grades",
        data: filteredGrades.map((grade) => grade.score),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const gradeOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.raw}`,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuad",
    },
  };

  const attendanceData = {
    labels: filteredAttendance.map((record) => record.date.split("T")[0]),
    datasets: [
      {
        label: "Attendance",
        data: filteredAttendance.map((record) =>
          record.status === "present" ? 1 : 0
        ),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  const attendanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `Status: ${context.raw === 1 ? "Present" : "Absent"}`,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuad",
    },
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>

      {/* Date Range Filter */}
      <div className="flex items-center mb-8">
        <div className="mr-4">
          <label className="block mb-1 text-gray-700">Start Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="border p-2 rounded-lg"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700">End Date:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="border p-2 rounded-lg"
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Student Grades</h3>
        <Bar data={gradeData} options={gradeOptions} />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Attendance</h3>
        <Line data={attendanceData} options={attendanceOptions} />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Feedback Summary</h3>
        <Pie
          data={{
            labels: ["Good", "Needs Improvement"],
            datasets: [
              {
                data: [
                  filteredGrades.filter((grade) => grade.score >= 75).length,
                  filteredGrades.filter((grade) => grade.score < 75).length,
                ],
                backgroundColor: [
                  "rgba(54, 162, 235, 0.6)",
                  "rgba(255, 99, 132, 0.6)",
                ],
              },
            ],
          }}
          options={{ responsive: true }}
        />
      </div>
    </div>
  );
}
