// app/api/whitelist/route.js

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const whitelist = await prisma.whitelist.findMany();
    return NextResponse.json(whitelist);
  } catch (error) {
    console.error("Error fetching whitelist:", error);
    return NextResponse.json(
      { error: "Failed to fetch whitelist" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { url } = await request.json();
    const newUrl = await prisma.whitelist.create({
      data: { url },
    });
    return NextResponse.json(newUrl);
  } catch (error) {
    console.error("Error adding URL:", error);
    return NextResponse.json({ error: "Failed to add URL" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await prisma.whitelist.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return NextResponse.json(
      { error: "Failed to delete URL" },
      { status: 500 }
    );
  }
}
