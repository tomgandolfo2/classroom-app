// app/components/TeacherDashboard.js

"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import StudentInterface from "./StudentInterface";
import BehaviorTracking from "./BehaviorTracking";
import Whitelist from "./Whitelist";
import ClassSchedule from "./ClassSchedule";
import Quiz from "./Quiz";
import Reporting from "./Reporting";
import AnalyticsDashboard from "./AnalyticsDashboard";
import PerformanceDashboard from "./PerformanceDashboard"; // Import the PerformanceDashboard component

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [newStudent, setNewStudent] = useState({ name: "", status: "active" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const predefinedComments = [
    "Great job!",
    "Needs improvement in math skills.",
    "Excellent participation!",
    "Focus more on assignments.",
  ];

  useEffect(() => {
    console.log("Session Status:", status);
    console.log("Session Data:", session);
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchStudents = async () => {
        try {
          const response = await fetch("/api/students");
          if (!response.ok) throw new Error("Failed to fetch students");
          const data = await response.json();
          setStudents(data);
          console.log("Fetched Students:", data);
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      };

      fetchStudents();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 shadow-lg rounded-lg max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="mb-6">
            You need to sign in with your Google account to access the
            dashboard.
          </p>
          <button
            className="bg-primary text-white px-6 py-3 rounded-lg shadow-md hover:bg-secondary transition"
            onClick={() => signIn("google")}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  const selectRandomStudent = () => {
    const randomIndex = Math.floor(Math.random() * students.length);
    setSelectedStudent(null);
    setTimeout(() => {
      setSelectedStudent(students[randomIndex]);
    }, 500);
  };

  const handleFeedback = async (id, response, comment) => {
    const selectedComment = comment || predefinedComments[0]; // Use first predefined comment if no custom comment
    setFeedback((prev) => ({
      ...prev,
      [id]: { response, comment: selectedComment },
    }));

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: id,
          response,
          comment: selectedComment,
        }),
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const addStudent = async () => {
    if (!newStudent.name.trim()) {
      alert("Student name can't be empty.");
      return;
    }

    if (students.some((student) => student.name === newStudent.name.trim())) {
      alert("Student name already exists.");
      return;
    }

    // Optimistically update UI
    const optimisticStudent = { ...newStudent, id: Date.now() };
    setStudents((prev) => [...prev, optimisticStudent]);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStudent),
      });

      const addedStudent = await response.json();
      // Replace the optimistic student with the actual one from the server
      setStudents((prev) =>
        prev.map((student) =>
          student.id === optimisticStudent.id ? addedStudent : student
        )
      );
      setNewStudent({ name: "", status: "active" });
    } catch (error) {
      console.error("Error adding student:", error);
      // Rollback in case of an error
      setStudents((prev) =>
        prev.filter((student) => student.id !== optimisticStudent.id)
      );
    }
  };

  const updateStudent = async (id, newStatus) => {
    try {
      const response = await fetch("/api/students", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const updatedStudent = await response.json();
      setStudents((prev) =>
        prev.map((student) => (student.id === id ? updatedStudent : student))
      );
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await fetch("/api/students", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      setStudents((prev) => prev.filter((student) => student.id !== id));
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const toggleStudentSelection = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((studentId) => studentId !== id)
        : [...prev, id]
    );
  };

  const bulkDeleteStudents = async () => {
    const confirmation = window.confirm(
      `Are you sure you want to delete ${selectedStudents.length} students?`
    );
    if (!confirmation) return;

    try {
      await Promise.all(
        selectedStudents.map((id) =>
          fetch("/api/students", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
          })
        )
      );

      setStudents((prev) =>
        prev.filter((student) => !selectedStudents.includes(student.id))
      );
      setSelectedStudents([]);
    } catch (error) {
      console.error("Error deleting students:", error);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-primary">Teacher Dashboard</h1>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Student Management Section */}
        <div className="bg-white p-6 shadow-lg rounded-lg col-span-1 lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Manage Students</h2>

          {/* Search and Filter */}
          <div className="flex items-center mb-6 space-x-4">
            <input
              type="text"
              className="border p-3 flex-1 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedStudents.length > 0 && (
            <div className="flex items-center mb-4 space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                onClick={bulkDeleteStudents}
              >
                Delete Selected ({selectedStudents.length})
              </button>
              {/* Add more bulk action buttons if needed */}
            </div>
          )}

          {/* Add New Student */}
          <div className="flex items-center mb-6 space-x-4">
            <input
              type="text"
              className="border p-3 flex-1 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Student Name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
            />
            <select
              className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={newStudent.status}
              onChange={(e) =>
                setNewStudent({ ...newStudent, status: e.target.value })
              }
            >
              <option value="active">Active</option>
              <option value="idle">Idle</option>
            </select>
            <button
              className="bg-primary text-white px-5 py-3 rounded-lg shadow-md hover:bg-secondary transition"
              onClick={addStudent}
            >
              Add Student
            </button>
          </div>

          {/* Student List */}
          <ul className="space-y-4 mb-6">
            {filteredStudents.map((student) => (
              <li
                key={student.id}
                className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition ${
                  selectedStudent?.id === student.id
                    ? "bg-yellow-50"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                    />
                    <div>
                      <p className="text-lg font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.status}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <select
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      onChange={(e) =>
                        handleFeedback(
                          student.id,
                          feedback[student.id]?.response || "",
                          e.target.value
                        )
                      }
                    >
                      {predefinedComments.map((comment, index) => (
                        <option key={index} value={comment}>
                          {comment}
                        </option>
                      ))}
                    </select>
                    <button
                      className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition"
                      onClick={() =>
                        handleFeedback(
                          student.id,
                          "good",
                          feedback[student.id]?.comment || ""
                        )
                      }
                    >
                      👍
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                      onClick={() =>
                        handleFeedback(
                          student.id,
                          "needs improvement",
                          feedback[student.id]?.comment || ""
                        )
                      }
                    >
                      👎
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition"
                      onClick={() =>
                        updateStudent(
                          student.id,
                          student.status === "active" ? "idle" : "active"
                        )
                      }
                    >
                      {student.status === "active" ? "Set Idle" : "Set Active"}
                    </button>
                    <button
                      className="bg-red-700 text-white px-3 py-2 rounded hover:bg-red-800 transition"
                      onClick={() => deleteStudent(student.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition"
            onClick={selectRandomStudent}
          >
            Select Random Student
          </button>
        </div>

        {/* Performance Dashboard Section */}
        <div className="bg-white p-6 shadow-lg rounded-lg col-span-1 lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Student Performance</h2>
          <PerformanceDashboard />
        </div>

        {/* Analytics Section */}
        <div className="bg-white p-6 shadow-lg rounded-lg col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
          <AnalyticsDashboard />
        </div>

        {/* Other Sections */}
        <div className="bg-white p-6 shadow-lg rounded-lg col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Other Features</h2>
          <Whitelist />
          <ClassSchedule />
          <Quiz />
          <BehaviorTracking />
          <Reporting feedback={feedback} />
        </div>
      </div>

      {/* Selected Student Display */}
      {selectedStudent && (
        <div className="mt-8 p-6 bg-gray-200 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold mb-2">
            Selected Student: {selectedStudent.name}
          </h3>
          <p>Provide feedback for this student.</p>
        </div>
      )}
    </div>
  );
}
