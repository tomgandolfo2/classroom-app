// app/api/students/route.js

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch all students
export async function GET() {
  const students = await prisma.student.findMany();
  return NextResponse.json(students);
}

// Create a new student
export async function POST(request) {
  const { name, status } = await request.json();
  const newStudent = await prisma.student.create({
    data: { name, status },
  });
  return NextResponse.json(newStudent);
}

// Update student details
export async function PUT(request) {
  const { id, status } = await request.json();
  const updatedStudent = await prisma.student.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(updatedStudent);
}

// Delete a student
export async function DELETE(request) {
  const { id } = await request.json();
  await prisma.student.delete({
    where: { id },
  });
  return NextResponse.json({ message: "Student deleted successfully" });
}
