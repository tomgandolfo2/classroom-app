// app/api/attendance/route.js

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId"); // Get the studentId from query params

  // Check for missing studentId
  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
  }

  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: parseInt(studentId), // Ensure studentId is parsed to an integer
      },
    });
    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}
