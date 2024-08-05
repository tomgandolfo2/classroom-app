// app/api/classes/route.js

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const classes = await prisma.class.findMany();
    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { subject, date, time, location, isRecurring, recurrencePattern } =
      await request.json();
    const newClass = await prisma.class.create({
      data: { subject, date, time, location, isRecurring, recurrencePattern },
    });
    return NextResponse.json(newClass);
  } catch (error) {
    console.error("Error adding class:", error);
    return NextResponse.json({ error: "Failed to add class" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await prisma.class.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
