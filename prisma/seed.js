// prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create Students
  const students = await prisma.student.createMany({
    data: [
      { name: "Alice", status: "active" },
      { name: "Bob", status: "active" },
      { name: "Charlie", status: "idle" },
      { name: "David", status: "active" },
      { name: "Eve", status: "active" },
    ],
  });

  console.log("Seeded students:", students);

  // Fetch all students to use their IDs for related data
  const allStudents = await prisma.student.findMany();

  // Create Grades
  const grades = await prisma.grade.createMany({
    data: [
      { subject: "Math", score: 85, studentId: allStudents[0].id },
      { subject: "Science", score: 90, studentId: allStudents[0].id },
      { subject: "History", score: 75, studentId: allStudents[1].id },
      { subject: "Math", score: 88, studentId: allStudents[1].id },
      { subject: "Science", score: 92, studentId: allStudents[2].id },
      { subject: "History", score: 68, studentId: allStudents[2].id },
      { subject: "Math", score: 95, studentId: allStudents[3].id },
      { subject: "Science", score: 87, studentId: allStudents[3].id },
      { subject: "History", score: 82, studentId: allStudents[4].id },
      { subject: "Math", score: 90, studentId: allStudents[4].id },
    ],
  });

  console.log("Seeded grades:", grades);

  // Create Attendance Records
  const attendance = await prisma.attendance.createMany({
    data: [
      { date: new Date(), status: "present", studentId: allStudents[0].id },
      { date: new Date(), status: "absent", studentId: allStudents[1].id },
      { date: new Date(), status: "late", studentId: allStudents[2].id },
      { date: new Date(), status: "present", studentId: allStudents[3].id },
      { date: new Date(), status: "present", studentId: allStudents[4].id },
      { date: new Date(), status: "present", studentId: allStudents[0].id },
      { date: new Date(), status: "present", studentId: allStudents[1].id },
      { date: new Date(), status: "present", studentId: allStudents[2].id },
      { date: new Date(), status: "absent", studentId: allStudents[3].id },
      { date: new Date(), status: "late", studentId: allStudents[4].id },
    ],
  });

  console.log("Seeded attendance:", attendance);

  // Create Classes
  const classes = await prisma.class.createMany({
    data: [
      {
        subject: "Math",
        date: new Date(),
        time: "10:00 AM",
        location: "Room 101",
        isRecurring: true,
        recurrencePattern: "weekly",
      },
      {
        subject: "Science",
        date: new Date(),
        time: "11:00 AM",
        location: "Room 102",
        isRecurring: false,
        recurrencePattern: "",
      },
    ],
  });

  console.log("Seeded classes:", classes);

  // Fetch all classes to use their IDs for related data
  const allClasses = await prisma.class.findMany();

  // Create Quizzes
  const quizzes = await prisma.quiz.createMany({
    data: [
      {
        title: "Math Quiz 1",
        dueDate: new Date("2024-08-12T21:18:09.599Z"),
        isTimed: true,
        timeLimit: 30,
        classId: allClasses[0].id,
      },
      {
        title: "Science Quiz 1",
        dueDate: new Date("2024-08-15T21:18:09.599Z"),
        isTimed: false,
        timeLimit: 0,
        classId: allClasses[1].id,
      },
    ],
  });

  console.log("Seeded quizzes:", quizzes);

  // Fetch all quizzes to use their IDs for related data
  const allQuizzes = await prisma.quiz.findMany();

  // Create Questions
  const questions = await prisma.question.createMany({
    data: [
      {
        text: "What is 2 + 2?",
        type: "multiple-choice",
        options: JSON.stringify(["3", "4", "5"]),
        correctAnswer: "4",
        quizId: allQuizzes[0].id,
      },
      {
        text: "What is the chemical symbol for water?",
        type: "short-answer",
        options: JSON.stringify([]),
        correctAnswer: "H2O",
        quizId: allQuizzes[1].id,
      },
    ],
  });

  console.log("Seeded questions:", questions);

  // Create Attempts
  const attempts = await prisma.attempt.createMany({
    data: [
      { score: 90, studentId: allStudents[0].id, quizId: allQuizzes[0].id },
      { score: 80, studentId: allStudents[1].id, quizId: allQuizzes[0].id },
      { score: 85, studentId: allStudents[2].id, quizId: allQuizzes[1].id },
      { score: 75, studentId: allStudents[3].id, quizId: allQuizzes[1].id },
    ],
  });

  console.log("Seeded attempts:", attempts);

  // Create Feedback
  const feedback = await prisma.feedback.createMany({
    data: [
      {
        response: "Great job!",
        comment: "Keep up the good work!",
        studentId: allStudents[0].id,
      },
      {
        response: "Needs improvement",
        comment: "Focus on your studies.",
        studentId: allStudents[1].id,
      },
    ],
  });

  console.log("Seeded feedback:", feedback);

  // Create Whitelist
  const whitelist = await prisma.whitelist.createMany({
    data: [
      { url: "https://www.khanacademy.org" },
      { url: "https://www.coursera.org" },
    ],
  });

  console.log("Seeded whitelist:", whitelist);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
