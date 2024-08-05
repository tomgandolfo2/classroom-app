// app/utils/dataManagement.js

export function logStudentBehavior(log, student, action) {
  const timestamp = new Date().toLocaleTimeString();
  return [...log, { student, action, timestamp }];
}
