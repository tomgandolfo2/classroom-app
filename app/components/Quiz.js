// app/components/Quiz.js

"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import DatePicker from "react-datepicker"; // Import the DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for styling

export default function Quiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    questions: [],
    dueDate: new Date(),
    isTimed: false,
    timeLimit: 30, // in minutes
  });
  const [question, setQuestion] = useState({
    text: "",
    type: "multiple-choice",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [studentAttempts, setStudentAttempts] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("/api/quizzes");
        if (!response.ok) throw new Error("Failed to fetch quizzes");
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        alert(
          "An error occurred while fetching quizzes. Please try again later."
        );
      }
    };

    fetchQuizzes();
  }, []);

  const addQuiz = async () => {
    if (!newQuiz.title.trim() || newQuiz.questions.length === 0) {
      alert("Please enter a title and add at least one question.");
      return;
    }

    const optimisticQuiz = { ...newQuiz, id: Date.now() };
    setQuizzes((prev) => [...prev, optimisticQuiz]);

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newQuiz),
      });

      const addedQuiz = await response.json();
      setQuizzes((prev) =>
        prev.map((item) => (item.id === optimisticQuiz.id ? addedQuiz : item))
      );
      setNewQuiz({
        title: "",
        questions: [],
        dueDate: new Date(),
        isTimed: false,
        timeLimit: 30,
      });
    } catch (error) {
      console.error("Error adding quiz:", error);
      setQuizzes((prev) =>
        prev.filter((item) => item.id !== optimisticQuiz.id)
      );
      alert("An error occurred while adding the quiz. Please try again later.");
    }
  };

  const addQuestion = () => {
    if (!question.text.trim() || question.options.some((opt) => !opt.trim())) {
      alert("Please fill in the question text and all options.");
      return;
    }

    setNewQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));

    setQuestion({
      text: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
  };

  const deleteQuiz = async (id) => {
    try {
      await fetch("/api/quizzes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      setQuizzes((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert(
        "An error occurred while deleting the quiz. Please try again later."
      );
    }
  };

  const editQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setNewQuiz(quiz);
  };

  const updateQuiz = async () => {
    if (!newQuiz.title.trim() || newQuiz.questions.length === 0) {
      alert("Please enter a title and add at least one question.");
      return;
    }

    try {
      await fetch("/api/quizzes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newQuiz),
      });

      setQuizzes((prev) =>
        prev.map((item) => (item.id === editingQuiz.id ? newQuiz : item))
      );
      setEditingQuiz(null);
      setNewQuiz({
        title: "",
        questions: [],
        dueDate: new Date(),
        isTimed: false,
        timeLimit: 30,
      });
    } catch (error) {
      console.error("Error updating quiz:", error);
      alert(
        "An error occurred while updating the quiz. Please try again later."
      );
    }
  };

  const viewQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    try {
      const response = await fetch(`/api/attempts?quizId=${quiz.id}`);
      if (!response.ok) throw new Error("Failed to fetch student attempts");
      const data = await response.json();
      setStudentAttempts(data);
    } catch (error) {
      console.error("Error fetching student attempts:", error);
      alert(
        "An error occurred while fetching student attempts. Please try again later."
      );
    }
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg mb-8">
      <h2 className="text-2xl font-semibold mb-4">Quiz Management</h2>

      {/* Add/Edit Quiz */}
      <div className="flex flex-col mb-6 space-y-4">
        <input
          type="text"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Quiz Title"
          value={newQuiz.title}
          onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
        />
        <div className="flex items-center space-x-2">
          <label>Due Date:</label>
          <DatePicker
            selected={newQuiz.dueDate}
            onChange={(date) => setNewQuiz({ ...newQuiz, dueDate: date })}
            className="border p-3 rounded-lg"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={newQuiz.isTimed}
            onChange={() =>
              setNewQuiz({ ...newQuiz, isTimed: !newQuiz.isTimed })
            }
          />
          <label>Timed Quiz</label>
          {newQuiz.isTimed && (
            <input
              type="number"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-20"
              placeholder="Time Limit (min)"
              value={newQuiz.timeLimit}
              onChange={(e) =>
                setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) })
              }
            />
          )}
        </div>
        <button
          className={`bg-${
            editingQuiz ? "yellow" : "primary"
          }-500 text-white px-5 py-3 rounded-lg shadow-md hover:bg-${
            editingQuiz ? "yellow" : "secondary"
          }-600 transition`}
          onClick={editingQuiz ? updateQuiz : addQuiz}
        >
          {editingQuiz ? "Update Quiz" : "Add Quiz"}
        </button>
      </div>

      {/* Add Questions */}
      <div className="flex flex-col mb-6 space-y-4">
        <h3 className="text-lg font-semibold mb-2">Add Question</h3>
        <textarea
          className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Question Text"
          value={question.text}
          onChange={(e) => setQuestion({ ...question, text: e.target.value })}
        />
        <div className="flex items-center space-x-2">
          <label>Type:</label>
          <select
            value={question.type}
            onChange={(e) => setQuestion({ ...question, type: e.target.value })}
            className="border p-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="short-answer">Short Answer</option>
          </select>
        </div>
        {question.type === "multiple-choice" && (
          <div className="flex flex-col space-y-2">
            {question.options.map((option, index) => (
              <input
                key={index}
                type="text"
                className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...question.options];
                  newOptions[index] = e.target.value;
                  setQuestion({ ...question, options: newOptions });
                }}
              />
            ))}
          </div>
        )}
        <input
          type="text"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Correct Answer"
          value={question.correctAnswer}
          onChange={(e) =>
            setQuestion({ ...question, correctAnswer: e.target.value })
          }
        />
        <button
          className="bg-blue-500 text-white px-5 py-3 rounded-lg shadow-md hover:bg-blue-600 transition"
          onClick={addQuestion}
        >
          Add Question
        </button>
      </div>

      {/* Quiz List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 tracking-wider">
                Timed
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td className="px-6 py-4 border-b border-gray-300">
                  {quiz.title}
                </td>
                <td className="px-6 py-4 border-b border-gray-300">
                  {format(new Date(quiz.dueDate), "MM/dd/yyyy")}
                </td>
                <td className="px-6 py-4 border-b border-gray-300">
                  {quiz.isTimed ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 border-b border-gray-300 text-right">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition mr-2"
                    onClick={() => viewQuiz(quiz)}
                  >
                    View
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition mr-2"
                    onClick={() => editQuiz(quiz)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    onClick={() => deleteQuiz(quiz.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Quiz */}
      {selectedQuiz && (
        <div className="mt-8 bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">
            Quiz: {selectedQuiz.title}
          </h3>
          <div className="mb-4">
            <h4 className="text-lg font-semibold">Questions:</h4>
            <ul className="list-disc list-inside">
              {selectedQuiz.questions.map((q, index) => (
                <li key={index}>
                  <p>{q.text}</p>
                  {q.type === "multiple-choice" && (
                    <ul className="list-disc list-inside ml-4">
                      {q.options.map((option, i) => (
                        <li key={i}>{option}</li>
                      ))}
                    </ul>
                  )}
                  <p className="font-semibold">
                    Correct Answer: {q.correctAnswer}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold">Student Attempts:</h4>
            <ul className="list-disc list-inside">
              {studentAttempts.map((attempt) => (
                <li key={attempt.id}>
                  {attempt.studentName} - Score: {attempt.score}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
