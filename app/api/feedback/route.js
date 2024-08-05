// app/api/feedback/route.js

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch all feedback
export async function GET() {
  const feedback = await prisma.feedback.findMany({
    include: { student: true },
  });
  return NextResponse.json(feedback);
}

// Create new feedback
export async function POST(request) {
  const { studentId, response, comment } = await request.json();
  const newFeedback = await prisma.feedback.create({
    data: {
      studentId,
      response,
      comment,
    },
  });
  return NextResponse.json(newFeedback);
}
