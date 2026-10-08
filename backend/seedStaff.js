import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "config/config.env") });
import Teacher from "./models/teacherModel.js";

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const genPhone = () => `9${randInt(100000000, 999999999)}`;
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Pune", "Chennai", "Hyderabad"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const DEPTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Information Technology", "Administration", "Library"];

const staffToAdd = [
  // ─── LIBRARIANS ───────────────────────────────────────────────────────────
  { name:"Mrs. Sunita Bhatt",      email:"librarian@campussync.edu.in",         password:"librarian123", employeeId:"LIB001", phone:genPhone(), designation:"Chief Librarian",           department:"Library",          subject:"Library Sciences",             qualification:"M.Lib.Sc",        experience:"14 years", gender:"female", dob:"1981-04-12", joiningDate:"2011-07-01", bloodGroup:"A+",  address:"12, Faculty Quarters", city:"Pune",      responsibility:"Librarian" },
  { name:"Mr. Deepak Nair",        email:"librarian2@campussync.edu.in",        password:"librarian123", employeeId:"LIB002", phone:genPhone(), designation:"Assistant Librarian",       department:"Library",          subject:"Library Sciences",             qualification:"M.Lib.Sc",        experience:"7 years",  gender:"male",   dob:"1989-09-22", joiningDate:"2018-06-15", bloodGroup:"B+",  address:"45, Staff Block A",    city:"Pune",      responsibility:"Librarian" },
  { name:"Ms. Rekha Srinivasan",   email:"librarian3@campussync.edu.in",        password:"librarian123", employeeId:"LIB003", phone:genPhone(), designation:"Library Assistant",         department:"Library",          subject:"Digital Library Management",   qualification:"B.Lib.Sc",        experience:"4 years",  gender:"female", dob:"1994-02-18", joiningDate:"2021-01-10", bloodGroup:"O+",  address:"8, Hostel Road",       city:"Chennai",   responsibility:"Librarian" },

  // ─── EXAM CONTROLLERS ─────────────────────────────────────────────────────
  { name:"Dr. Vivek Sharma",       email:"examcontroller@campussync.edu.in",    password:"examctrl123",  employeeId:"EXM001", phone:genPhone(), designation:"Senior Exam Controller",    department:"Examination Cell", subject:"Academic Administration",      qualification:"Ph.D",            experience:"18 years", gender:"male",   dob:"1976-11-05", joiningDate:"2007-08-01", bloodGroup:"B+",  address:"21, Admin Block",      city:"Delhi",     responsibility:"Exam Controller" },
  { name:"Mrs. Kavitha Iyer",      email:"examcontroller2@campussync.edu.in",   password:"examctrl123",  employeeId:"EXM002", phone:genPhone(), designation:"Exam Controller",           department:"Examination Cell", subject:"Examination Management",       qualification:"M.Sc + Ph.D",     experience:"11 years", gender:"female", dob:"1983-07-14", joiningDate:"2014-03-15", bloodGroup:"A+",  address:"7, Faculty Housing",   city:"Bangalore", responsibility:"Exam Controller" },
  { name:"Mr. Suresh Menon",       email:"examcontroller3@campussync.edu.in",   password:"examctrl123",  employeeId:"EXM003", phone:genPhone(), designation:"Assistant Exam Controller", department:"Examination Cell", subject:"Examination & Evaluation",     qualification:"M.Tech",          experience:"6 years",  gender:"male",   dob:"1991-03-29", joiningDate:"2019-09-01", bloodGroup:"O-",  address:"33, Staff Quarters",   city:"Pune",      responsibility:"Exam Controller" },

  // ─── EVENT COORDINATORS ───────────────────────────────────────────────────
  { name:"Ms. Priya Malhotra",     email:"coordinator@campussync.edu.in",       password:"coord123",     employeeId:"CRD001", phone:genPhone(), designation:"Chief Event Coordinator",   department:"Student Affairs",  subject:"Event Management",             qualification:"MBA",             experience:"9 years",  gender:"female", dob:"1988-06-21", joiningDate:"2016-05-01", bloodGroup:"B-",  address:"15, Staff Block B",    city:"Mumbai",    responsibility:"Event Coordinator" },
  { name:"Mr. Aditya Bose",        email:"coordinator2@campussync.edu.in",      password:"coord123",     employeeId:"CRD002", phone:genPhone(), designation:"Events & Activities Head",  department:"Student Affairs",  subject:"Cultural Activities",          qualification:"M.A",             experience:"5 years",  gender:"male",   dob:"1993-12-10", joiningDate:"2020-08-01", bloodGroup:"A-",  address:"22, Near Canteen",     city:"Kolkata",   responsibility:"Event Coordinator" },
  { name:"Ms. Ankita Rawat",       email:"coordinator3@campussync.edu.in",      password:"coord123",     employeeId:"CRD003", phone:genPhone(), designation:"Sports & Events Coordinator", department:"Student Affairs", subject:"Sports Management",           qualification:"B.P.Ed + M.P.Ed", experience:"3 years",  gender:"female", dob:"1996-08-04", joiningDate:"2022-04-15", bloodGroup:"O+",  address:"40, Campus Lane",      city:"Jaipur",    responsibility:"Event Coordinator" },

  // ─── STUDENT REGISTRARS ───────────────────────────────────────────────────
  { name:"Dr. Ramakrishna Pillai", email:"registrar@campussync.edu.in",         password:"registrar123", employeeId:"REG001", phone:genPhone(), designation:"Chief Student Registrar",  department:"Administration",   subject:"Student Records Management",   qualification:"M.A (Admin)",     experience:"22 years", gender:"male",   dob:"1973-01-17", joiningDate:"2004-01-01", bloodGroup:"AB+", address:"1, Dean Bungalow Lane",city:"Hyderabad", responsibility:"Student Registrar" },
  { name:"Mrs. Seema Kapoor",      email:"registrar2@campussync.edu.in",        password:"registrar123", employeeId:"REG002", phone:genPhone(), designation:"Deputy Registrar",         department:"Administration",   subject:"Admissions & Records",         qualification:"M.Com",           experience:"13 years", gender:"female", dob:"1982-05-25", joiningDate:"2012-07-01", bloodGroup:"A+",  address:"9, Admin Block Road",  city:"Lucknow",   responsibility:"Student Registrar" },
  { name:"Mr. Harish Choudhary",   email:"registrar3@campussync.edu.in",        password:"registrar123", employeeId:"REG003", phone:genPhone(), designation:"Assistant Registrar",      department:"Administration",   subject:"Enrollment & Documentation",   qualification:"MBA",             experience:"8 years",  gender:"male",   dob:"1990-10-30", joiningDate:"2017-03-20", bloodGroup:"B+",  address:"18, Staff Colony",     city:"Jaipur",    responsibility:"Student Registrar" },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URL, { dbName: "Campus_Sync" });
  console.log("Connected");
  let added = 0;
  const creds = [];
  for (const sd of staffToAdd) {
    const existing = await Teacher.findOne({ email: sd.email });
    if (existing) { console.log(`Skip (exists): ${sd.email}`); continue; }
    const t = new Teacher(sd);
    await t.save();
    creds.push({ role: sd.responsibility, name: sd.name, email: sd.email, password: sd.password, employeeId: sd.employeeId, designation: sd.designation });
    added++;
  }
  console.log(`\nAdded ${added} staff accounts\n`);
  console.log("=== ALL CREDENTIALS ===");
  for (const c of creds) {
    console.log(`[${c.role}] ${c.name} | ${c.employeeId} | ${c.email} | ${c.password}`);
  }
  await mongoose.disconnect();
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
