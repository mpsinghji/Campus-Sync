import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "config/config.env") });
import Student from "./models/studentModel.js";
import Teacher from "./models/teacherModel.js";
async function run() {
  await mongoose.connect(process.env.MONGO_URL, { dbName: "Campus_Sync" });
  const students = await Student.find({}, "name email rollno department batch").sort("rollno").lean();
  const teachers = await Teacher.find({}, "name email employeeId department responsibility designation").sort("employeeId").lean();
  console.log("\n=== STUDENTS ===");
  for (const s of students) console.log(`${s.name} | ${s.rollno} | ${s.email} | ${s.department} | ${s.batch} | student123`);
  console.log("\n=== TEACHERS (Faculty) ===");
  for (const t of teachers.filter(t=>!t.responsibility||t.responsibility==="Teacher")) console.log(`${t.name} | ${t.employeeId} | ${t.email} | ${t.department} | teacher123`);
  console.log("\n=== LIBRARIANS ===");
  for (const t of teachers.filter(t=>t.responsibility==="Librarian")) console.log(`${t.name} | ${t.employeeId} | ${t.email} | ${t.designation} | librarian123`);
  console.log("\n=== EXAM CONTROLLERS ===");
  for (const t of teachers.filter(t=>t.responsibility==="Exam Controller")) console.log(`${t.name} | ${t.employeeId} | ${t.email} | ${t.designation} | examctrl123`);
  console.log("\n=== EVENT COORDINATORS ===");
  for (const t of teachers.filter(t=>t.responsibility==="Event Coordinator")) console.log(`${t.name} | ${t.employeeId} | ${t.email} | ${t.designation} | coord123`);
  console.log("\n=== STUDENT REGISTRARS ===");
  for (const t of teachers.filter(t=>t.responsibility==="Student Registrar")) console.log(`${t.name} | ${t.employeeId} | ${t.email} | ${t.designation} | registrar123`);
  await mongoose.disconnect();
  process.exit(0);
}
run().catch(e=>{ console.error(e); process.exit(1); });
