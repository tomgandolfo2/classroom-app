// app/api/quizzes/route.js

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: true,
      },
    });
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { title, questions, dueDate, isTimed, timeLimit } =
      await request.json();
    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        dueDate,
        isTimed,
        timeLimit,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })),
        },
      },
    });
    return NextResponse.json(newQuiz);
  } catch (error) {
    console.error("Error adding quiz:", error);
    return NextResponse.json({ error: "Failed to add quiz" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, title, questions, dueDate, isTimed, timeLimit } =
      await request.json();
    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        dueDate,
        isTimed,
        timeLimit,
        questions: {
          deleteMany: {}, // Delete existing questions
          create: questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })),
        },
      },
    });
    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await prisma.quiz.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
