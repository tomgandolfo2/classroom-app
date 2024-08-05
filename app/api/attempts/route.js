// app/api/attempts/route.js

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  try {
    const attempts = await prisma.attempt.findMany({
      where: {
        studentId: parseInt(studentId),
      },
      include: {
        quiz: true,
      },
    });
    return NextResponse.json(
      attempts.map((attempt) => ({
        id: attempt.id,
        title: attempt.quiz.title,
        score: attempt.score,
        date: attempt.quiz.dueDate,
      }))
    );
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
