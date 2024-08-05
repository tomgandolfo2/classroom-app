// app/utils/studentSelection.js

export function getRandomStudent(students) {
  const randomIndex = Math.floor(Math.random() * students.length);
  return students[randomIndex];
}
