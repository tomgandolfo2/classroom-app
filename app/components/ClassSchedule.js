// app/components/ClassSchedule.js

"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function ClassSchedule() {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({
    subject: "",
    date: new Date(),
    time: "",
    location: "",
    isRecurring: false,
    recurrencePattern: "weekly",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes");
        if (!response.ok) throw new Error("Failed to fetch classes");
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        alert(
          "An error occurred while fetching classes. Please try again later."
        );
      }
    };

    fetchClasses();
  }, []);

  const addClass = async () => {
    if (
      !newClass.subject.trim() ||
      !newClass.time.trim() ||
      !newClass.location.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const timePattern = /^([01]\d|2[0-3]):?([0-5]\d)$/;
    if (!timePattern.test(newClass.time)) {
      alert("Invalid time format. Use HH:mm.");
      return;
    }

    const optimisticClass = { ...newClass, id: Date.now() };
    setClasses((prev) => [...prev, optimisticClass]);

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClass),
      });

      const addedClass = await response.json();
      setClasses((prev) =>
        prev.map((item) => (item.id === optimisticClass.id ? addedClass : item))
      );
      setNewClass({
        subject: "",
        date: new Date(),
        time: "",
        location: "",
        isRecurring: false,
        recurrencePattern: "weekly",
      });
    } catch (error) {
      console.error("Error adding class:", error);
      setClasses((prev) =>
        prev.filter((item) => item.id !== optimisticClass.id)
      );
      alert(
        "An error occurred while adding the class. Please try again later."
      );
    }
  };

  const deleteClass = async (id) => {
    try {
      await fetch("/api/classes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      setClasses((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting class:", error);
      alert(
        "An error occurred while deleting the class. Please try again later."
      );
    }
  };

  const filteredClasses = classes.filter((item) =>
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const events = classes.map((item) => ({
    title: item.subject,
    start: new Date(item.date + "T" + item.time),
    end: new Date(item.date + "T" + item.time),
  }));

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg mb-8">
      <h2 className="text-2xl font-semibold mb-4">Class Schedule Management</h2>

      {/* Add New Class */}
      <div className="flex flex-col mb-6 space-y-4">
        <input
          type="text"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Subject"
          value={newClass.subject}
          onChange={(e) =>
            setNewClass({ ...newClass, subject: e.target.value })
          }
        />
        <DatePicker
          selected={newClass.date}
          onChange={(date) => setNewClass({ ...newClass, date })}
          className="border p-3 rounded-lg"
        />
        <input
          type="text"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Time (HH:mm)"
          value={newClass.time}
          onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
        />
        <input
          type="text"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Location"
          value={newClass.location}
          onChange={(e) =>
            setNewClass({ ...newClass, location: e.target.value })
          }
        />
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={newClass.isRecurring}
            onChange={() =>
              setNewClass({ ...newClass, isRecurring: !newClass.isRecurring })
            }
          />
          <label>Recurring Event</label>
        </div>
        {newClass.isRecurring && (
          <div className="flex items-center space-x-2">
            <label>Recurrence:</label>
            <select
              value={newClass.recurrencePattern}
              onChange={(e) =>
                setNewClass({ ...newClass, recurrencePattern: e.target.value })
              }
              className="border p-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}
        <button
          className="bg-primary text-white px-5 py-3 rounded-lg shadow-md hover:bg-secondary transition"
          onClick={addClass}
        >
          Add Class
        </button>
      </div>

      {/* Search Classes */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          className="border p-3 flex-1 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Search classes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Class List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 border-b border-gray-300">
                  {item.subject}
                </td>
                <td className="px-6 py-4 border-b border-gray-300">
                  {format(new Date(item.date), "MM/dd/yyyy")}
                </td>
                <td className="px-6 py-4 border-b border-gray-300">
                  {item.time}
                </td>
                <td className="px-6 py-4 border-b border-gray-300">
                  {item.location}
                </td>
                <td className="px-6 py-4 border-b border-gray-300 text-right">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    onClick={() => deleteClass(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calendar View */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="auto"
        />
      </div>
    </div>
  );
}
