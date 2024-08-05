// app/components/PerformanceDashboard.js

"use client";

import React, { useState, useEffect } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function PerformanceDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 3))
  );
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
        alert(
          "An error occurred while fetching students. Please try again later."
        );
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      const fetchStudentData = async () => {
        try {
          const gradesResponse = await fetch(
            `/api/grades?studentId=${selectedStudent.id}`
          );
          if (!gradesResponse.ok) throw new Error("Failed to fetch grades");
          const gradesData = await gradesResponse.json();

          const attendanceResponse = await fetch(
            `/api/attendance?studentId=${selectedStudent.id}`
          );
          if (!attendanceResponse.ok)
            throw new Error("Failed to fetch attendance");
          const attendanceData = await attendanceResponse.json();

          const quizzesResponse = await fetch(
            `/api/attempts?studentId=${selectedStudent.id}`
          );
          if (!quizzesResponse.ok) throw new Error("Failed to fetch quizzes");
          const quizzesData = await quizzesResponse.json();

          setGrades(gradesData);
          setAttendance(attendanceData);
          setQuizzes(quizzesData);
        } catch (error) {
          console.error("Error fetching student data:", error);
          alert(
            "An error occurred while fetching student data. Please try again later."
          );
        }
      };

      fetchStudentData();
    }
  }, [selectedStudent]);

  const filteredGrades = grades.filter(
    (grade) =>
      new Date(grade.date) >= startDate && new Date(grade.date) <= endDate
  );

  const filteredAttendance = attendance.filter(
    (record) =>
      new Date(record.date) >= startDate && new Date(record.date) <= endDate
  );

  const filteredQuizzes = quizzes.filter(
    (quiz) => new Date(quiz.date) >= startDate && new Date(quiz.date) <= endDate
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

  const quizData = {
    labels: filteredQuizzes.map((quiz) => quiz.title),
    datasets: [
      {
        label: "Quiz Scores",
        data: filteredQuizzes.map((quiz) => quiz.score),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
    ],
  };

  const handleExport = () => {
    const csvData = [
      ["Subject", "Score"],
      ...filteredGrades.map((grade) => [grade.subject, grade.score]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_${selectedStudent.name}_grades.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg mb-8">
      <h2 className="text-2xl font-semibold mb-4">
        Student Performance Dashboard
      </h2>

      {/* Student Selection */}
      <div className="mb-4">
        <label className="block mb-2 text-gray-700">Select Student:</label>
        <select
          value={selectedStudent ? selectedStudent.id : ""}
          onChange={(e) => {
            const studentId = parseInt(e.target.value);
            const student = students.find((s) => s.id === studentId);
            setSelectedStudent(student);
          }}
          className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

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

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="col-span-1">
          <h3 className="text-lg font-semibold mb-2">Average Grade</h3>
          <Pie
            data={{
              labels: ["Average Grade", "Remaining"],
              datasets: [
                {
                  data: [
                    filteredGrades.reduce(
                      (acc, grade) => acc + grade.score,
                      0
                    ) / filteredGrades.length || 0,
                    100 -
                      (filteredGrades.reduce(
                        (acc, grade) => acc + grade.score,
                        0
                      ) / filteredGrades.length || 0),
                  ],
                  backgroundColor: [
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(255, 99, 132, 0.1)",
                  ],
                },
              ],
            }}
            options={{ responsive: true }}
          />
        </div>
        <div className="col-span-1">
          <h3 className="text-lg font-semibold mb-2">Attendance Rate</h3>
          <Pie
            data={{
              labels: ["Present", "Absent"],
              datasets: [
                {
                  data: [
                    filteredAttendance.filter(
                      (record) => record.status === "present"
                    ).length,
                    filteredAttendance.filter(
                      (record) => record.status !== "present"
                    ).length,
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
        <div className="col-span-1">
          <h3 className="text-lg font-semibold mb-2">Quiz Scores</h3>
          <Pie
            data={{
              labels: ["Average Quiz Score", "Remaining"],
              datasets: [
                {
                  data: [
                    filteredQuizzes.reduce((acc, quiz) => acc + quiz.score, 0) /
                      filteredQuizzes.length || 0,
                    100 -
                      (filteredQuizzes.reduce(
                        (acc, quiz) => acc + quiz.score,
                        0
                      ) / filteredQuizzes.length || 0),
                  ],
                  backgroundColor: [
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.1)",
                  ],
                },
              ],
            }}
            options={{ responsive: true }}
          />
        </div>
      </div>

      {/* Detailed Reports */}
      {selectedStudent && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Detailed Reports for {selectedStudent.name}
          </h3>
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-2">Grades</h4>
            <Bar data={gradeData} options={{ responsive: true }} />
          </div>

          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-2">Attendance</h4>
            <Line data={attendanceData} options={{ responsive: true }} />
          </div>

          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-2">Quiz Scores</h4>
            <Bar data={quizData} options={{ responsive: true }} />
          </div>

          <button
            className="bg-green-500 text-white px-5 py-3 rounded-lg shadow-md hover:bg-green-600 transition"
            onClick={handleExport}
          >
            Export Grades to CSV
          </button>
        </div>
      )}
    </div>
  );
}
