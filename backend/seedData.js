import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "config/config.env") });
import Student from "./models/studentModel.js";
import Teacher from "./models/teacherModel.js";
import Admin from "./models/adminModel.js";
import Attendance from "./models/attendanceSchema.js";
import Exam from "./models/examSchema.js";
import Assignment from "./models/assignmentSchema.js";
import Announcement from "./models/announcementSchema.js";
import { Events } from "./models/eventsSchema.js";
import { Book, IssuedBook } from "./models/librarySchema.js";
import Fee from "./models/feeModel.js";
import Fine from "./models/fineModel.js";
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d; }
function dateStr(d) { return d.toISOString().split("T")[0]; }
const BATCHES = ["Batch 2022","Batch 2023","Batch 2024"];
const DEPARTMENTS = ["Computer Science","Electronics","Mechanical","Civil","Information Technology"];
const SEMESTERS = ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6"];
const SECTIONS = ["A","B","C"];
const GROUPS = ["G1","G2","G3"];
const GENDERS = ["male","female"];
const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const CITIES = ["Mumbai","Delhi","Bangalore","Hyderabad","Pune","Chennai","Jaipur","Lucknow"];
const STATES = ["Maharashtra","Delhi","Karnataka","Telangana","Tamil Nadu","Rajasthan","Uttar Pradesh"];
const SUBJECTS_BY_DEPT = {
  "Computer Science":["Data Structures & Algorithms","Operating Systems","Database Management Systems","Computer Networks","Software Engineering","Machine Learning","Web Technologies","Discrete Mathematics"],
  "Electronics":["Digital Electronics","Analog Circuits","Microprocessors","Signal Processing","Embedded Systems","VLSI Design"],
  "Mechanical":["Thermodynamics","Fluid Mechanics","Manufacturing Technology","Engineering Mechanics","Machine Design"],
  "Civil":["Structural Analysis","Geotechnical Engineering","Highway Engineering","Environmental Engineering","Construction Management"],
  "Information Technology":["Cloud Computing","Cyber Security","Data Science","Mobile Application Development","Internet of Things","Artificial Intelligence"]
};
const FM = ["Arjun","Rahul","Vikram","Ankit","Rohan","Nikhil","Suraj","Aditya","Karan","Manish","Siddharth","Rajesh","Deepak","Amit","Gaurav","Prateek","Sachin","Varun","Harsh","Shubham"];
const FF = ["Priya","Anjali","Sneha","Neha","Pooja","Kritika","Simran","Divya","Isha","Shreya","Megha","Ritu","Kavya","Nisha","Sakshi","Preeti","Meera","Ankita","Swati","Kajal"];
const LN = ["Sharma","Verma","Singh","Gupta","Patel","Kumar","Joshi","Pandey","Mishra","Yadav","Mehta","Shah","Agarwal","Tiwari","Chauhan","Nair","Iyer","Reddy","Rao","Bose"];
const genName = (g) => `${g==="male"?rand(FM):rand(FF)} ${rand(LN)}`;
const genEmail = (name, sfx) => `${name.toLowerCase().replace(/\s+/g,".")}${sfx}@campussync.edu.in`;
const genPhone = () => `9${randInt(100000000,999999999)}`;
const genRoll = (dept, batch, i) => `${dept.split(" ").map(w=>w[0]).join("").toUpperCase()}${batch.split(" ")[1]}${String(i).padStart(3,"0")}`;
const SUBJECT_CODES = {"Data Structures & Algorithms":"CS301","Operating Systems":"CS302","Database Management Systems":"CS303","Computer Networks":"CS304","Software Engineering":"CS401","Machine Learning":"CS501","Web Technologies":"CS502","Discrete Mathematics":"CS201","Digital Electronics":"EC301","Analog Circuits":"EC302","Microprocessors":"EC303","Signal Processing":"EC401","Embedded Systems":"EC402","VLSI Design":"EC501","Thermodynamics":"ME301","Fluid Mechanics":"ME302","Manufacturing Technology":"ME401","Engineering Mechanics":"ME201","Machine Design":"ME501","Structural Analysis":"CV301","Geotechnical Engineering":"CV302","Highway Engineering":"CV401","Environmental Engineering":"CV402","Construction Management":"CV501","Cloud Computing":"IT401","Cyber Security":"IT402","Data Science":"IT403","Mobile Application Development":"IT404","Internet of Things":"IT501","Artificial Intelligence":"IT502"};
async function seed() {
  await mongoose.connect(process.env.MONGO_URL, { dbName: "Campus_Sync" });
  console.log("Connected to MongoDB");
  await Promise.all([Student.deleteMany({}),Teacher.deleteMany({}),Attendance.deleteMany({}),Exam.deleteMany({}),Assignment.deleteMany({}),Announcement.deleteMany({}),Events.deleteMany({}),Book.deleteMany({}),IssuedBook.deleteMany({}),Fee.deleteMany({}),Fine.deleteMany({})]);
  await Admin.deleteMany({ isSuperAdmin: { $ne: true } });
  console.log("Cleared existing data");
  // Students
  const insertedStudents = [];
  let idx = 1;
  for (const dept of DEPARTMENTS) {
    for (const batch of BATCHES) {
      for (let i = 0; i < randInt(8,12); i++) {
        const g = rand(GENDERS), name = genName(g);
        const s = new Student({ name, email:genEmail(name,idx), password:"student123", rollno:genRoll(dept,batch,idx), mobileno:genPhone(), batch, department:dept, semester:rand(SEMESTERS), section:rand(SECTIONS), group:rand(GROUPS), gender:g, dob:`${randInt(2000,2004)}-${String(randInt(1,12)).padStart(2,"0")}-${String(randInt(1,28)).padStart(2,"0")}`, bloodGroup:rand(BLOOD_GROUPS), address:`${randInt(1,200)}, ${rand(["MG Road","Civil Lines","Sector 14","Park Street"])}`, city:rand(CITIES), state:rand(STATES), pincode:`${randInt(100000,999999)}`, guardianName:genName("male"), guardianPhone:genPhone(), admissionDate:`${batch.split(" ")[1]}-07-15`, degree:"B.Tech", specialization:dept, feePerSemester:rand([42000,45000,48000,52000]) });
        await s.save(); insertedStudents.push(s); idx++;
      }
    }
  }
  console.log(`${insertedStudents.length} students seeded`);
  // Teachers
  const insertedTeachers = [];
  const DESIGS = ["Assistant Professor","Associate Professor","Professor","Senior Lecturer","Head of Department"];
  const QUALS = ["M.Tech","Ph.D","M.Sc + Ph.D","M.E + Ph.D"];
  for (const dept of DEPARTMENTS) {
    const subs = SUBJECTS_BY_DEPT[dept];
    for (let i = 0; i < Math.ceil(subs.length/2); i++) {
      const g = rand(GENDERS), name = genName(g);
      const t = new Teacher({ name, email:genEmail(name,`.t${i+1}`), password:"teacher123", employeeId:`EMP${dept.split(" ").map(w=>w[0]).join("").toUpperCase()}${String(i+1).padStart(3,"0")}`, phone:genPhone(), designation:rand(DESIGS), department:dept, subject:subs[i]||subs[0], qualification:rand(QUALS), experience:`${randInt(2,20)} years`, gender:g, dob:`${randInt(1975,1990)}-${String(randInt(1,12)).padStart(2,"0")}-${String(randInt(1,28)).padStart(2,"0")}`, joiningDate:`${randInt(2005,2020)}-${String(randInt(1,12)).padStart(2,"0")}-01`, bloodGroup:rand(BLOOD_GROUPS), address:`${randInt(1,200)}, Faculty Quarter`, city:rand(CITIES), responsibility:rand(["Teacher","Class Coordinator","Lab In-Charge","Exam Cell"]) });
      await t.save(); insertedTeachers.push(t);
    }
  }
  console.log(`${insertedTeachers.length} teachers seeded`);
  // Admins
  for (const ad of [
    { name:"Dr. Ramesh Chandra", email:"hod.cs@campussync.edu.in", password:"admin123", phone:genPhone(), designation:"Head of Department", department:"Computer Science", officeRoom:"Room 201, CS Block" },
    { name:"Mrs. Lalitha Devi", email:"exam.controller@campussync.edu.in", password:"admin123", phone:genPhone(), designation:"Exam Controller", department:"Administration", officeRoom:"Room 101, Admin Block" },
    { name:"Mr. Arvind Kapoor", email:"accounts@campussync.edu.in", password:"admin123", phone:genPhone(), designation:"Accounts Officer", department:"Finance", officeRoom:"Room 105, Admin Block" }
  ]) { const a = new Admin(ad); await a.save(); }
  console.log("3 admins seeded");
  // Attendance
  const workingDays = [];
  for (let i = 90; i >= 1; i--) { const d = daysAgo(i); if (d.getDay()!==0&&d.getDay()!==6) workingDays.push(d); }
  let attCount = 0;
  const CHUNK = 500;
  let batch = [];
  for (const student of insertedStudents) {
    const subs = SUBJECTS_BY_DEPT[student.department]||SUBJECTS_BY_DEPT["Computer Science"];
    for (const date of workingDays) {
      const n = randInt(2,4);
      const todaySubs = [...subs].sort(()=>Math.random()-0.5).slice(0,n);
      for (const sub of todaySubs) {
        const prob = student.name.charCodeAt(0)%2===0 ? 0.88 : 0.76;
        batch.push({ student:student._id, status:Math.random()<prob?"Present":"Absent", date:dateStr(date), batch:student.batch, department:student.department, subject:sub, group:student.group, section:student.section });
        if (batch.length>=CHUNK) { await Attendance.insertMany(batch); attCount+=batch.length; batch=[]; process.stdout.write(`\rAttendance: ${attCount}`); }
      }
    }
  }
  if (batch.length) { await Attendance.insertMany(batch); attCount+=batch.length; }
  console.log(`\n${attCount} attendance records seeded`);
  // Exams
  const exams = [];
  for (const b of BATCHES) for (const dept of DEPARTMENTS) for (const sub of SUBJECTS_BY_DEPT[dept]) {
    exams.push({ subjectName:sub, subjectCode:SUBJECT_CODES[sub]||"GEN101", batch:b, date:daysAgo(randInt(20,60)), description:`Mid-Term Exam for ${sub}. Duration: 2hrs. Max Marks: 30.`, targetEmails:[] });
    exams.push({ subjectName:sub, subjectCode:SUBJECT_CODES[sub]||"GEN201", batch:b, date:daysFromNow(randInt(5,45)), description:`End-Semester Exam for ${sub}. Duration: 3hrs. Max Marks: 70. Entire syllabus.`, targetEmails:[] });
  }
  await Exam.insertMany(exams);
  console.log(`${exams.length} exams seeded`);
  // Assignments
  const TOPICS = {"Data Structures & Algorithms":["Implement AVL Tree","Dijkstra Shortest Path","DP - Knapsack"],"Operating Systems":["Process Scheduling Simulation","Banker Algorithm","Page Replacement"],"Database Management Systems":["ER Diagram for Hospital","SQL Query Optimization","NoSQL vs SQL Study"],"Computer Networks":["TCP/IP Analysis","Subnetting & VLSM","Socket Programming"],"Software Engineering":["UML for E-Commerce","Agile Sprint Planning","Testing Strategies"],"Machine Learning":["Linear Regression Scratch","CNN Image Classification","K-Means Clustering"],"Web Technologies":["REST API with Node.js","React Component Library","Responsive Dashboard"],"Cloud Computing":["AWS EC2 Setup Report","Microservices Design","Cloud Cost Optimization"],"Cyber Security":["Vulnerability Assessment","AES Encryption Impl","Phishing Attack Analysis"]};
  const assignList = [];
  for (const dept of DEPARTMENTS) {
    const subs = SUBJECTS_BY_DEPT[dept];
    const teacher = rand(insertedTeachers.filter(t=>t.department===dept)||insertedTeachers);
    for (const sub of subs) {
      const topics = TOPICS[sub]||[`Assignment on ${sub}`,`Case Study on ${sub}`,`Research: ${sub} Applications`];
      for (const topic of topics) for (const b of BATCHES) {
        assignList.push({ title:topic, description:`Submit well-documented work for: "${topic}". Follow rubric. No plagiarism.`, batch:b, department:dept, section:rand(SECTIONS), className:rand(SEMESTERS), subject:sub, teacherName:teacher?.name||"Faculty", dueDate:daysFromNow(randInt(3,21)) });
      }
    }
  }
  await Assignment.insertMany(assignList);
  console.log(`${assignList.length} assignments seeded`);
  // Announcements
  const anns = [
    { title:"Mid-Semester Examination Schedule", announcement:"Mid-semester exams start 25th Oct 2026. Detailed timetable on portal. Report 30 min early with admit card.", category:"Exam", targetAudience:"students", createdBy:"Exam Cell" },
    { title:"Campus Wi-Fi Upgrade", announcement:"Campus Wi-Fi upgrade this weekend. Brief outages 10PM-6AM. 6GHz Wi-Fi available after.", category:"Infrastructure", targetAudience:"all", createdBy:"IT Department" },
    { title:"Fee Payment Deadline", announcement:"Last date for fee payment: 31st Oct 2026. Late penalty Rs.500/week. Pay online or at finance office.", category:"Finance", targetAudience:"students", createdBy:"Accounts Office" },
    { title:"National Hackathon Registration Open", announcement:"Annual Hackathon on 15th Nov 2026. Teams of 2-4. Problem areas: AI/ML, Fintech, Smart Cities. Register by 5th Nov.", category:"Event", targetAudience:"students", createdBy:"Student Activities Cell" },
    { title:"AICTE Faculty Development Program", announcement:"FDP on Emerging Technologies in Education, 10-14 Nov 2026. Faculty register by 3rd Nov.", category:"Academic", targetAudience:"teachers", createdBy:"IQAC Cell" },
    { title:"Library New Arrivals - October 2026", announcement:"200+ new titles in CS, AI, Management added to library. 14-day borrowing available.", category:"Library", targetAudience:"all", createdBy:"Library Administration" },
    { title:"Infosys Campus Placement Drive", announcement:"Infosys placement for Batch 2026 on 20th Oct. Eligibility: 6.5+ CGPA, no backlogs. Register by 15th Oct.", category:"Placement", targetAudience:"students", createdBy:"T&P Cell" },
    { title:"Sports Day Registrations Open", announcement:"Annual Sports Day: 8th Nov 2026. Events: Athletics, Football, Basketball, Badminton, Chess. Register by 1st Nov.", category:"Sports", targetAudience:"students", createdBy:"Sports Committee" },
    { title:"Anti-Ragging Notice", announcement:"Zero tolerance for ragging. Report immediately to helpline 1800-180-5522 or student portal.", category:"General", targetAudience:"all", createdBy:"Dean of Students" },
    { title:"NAAC Visit Preparation", announcement:"NAAC team visiting 18-20 Nov. Departments must update documentation. Students: maintain decorum.", category:"General", targetAudience:"all", createdBy:"Principal Office" },
    { title:"Class Schedule Change - TechUtsav", announcement:"Online classes for Sem 3 & 5 rescheduled to weekend 10-12 Oct due to TechUtsav fest.", category:"Academic", targetAudience:"students", createdBy:"Academic Office" },
    { title:"Research Paper Submission - IJCSE", announcement:"Submit research papers to IJCSE Vol.18 by 25th Oct 2026. IEEE template mandatory.", category:"Research", targetAudience:"teachers", createdBy:"Research Cell" }
  ];
  await Announcement.insertMany(anns.map(a=>({...a})));
  console.log(`${anns.length} announcements seeded`);
  // Events
  await Events.insertMany([
    { name:"TechUtsav 2026 - Annual Technical Fest", description:"3-day fest: hackathon, robotics, coding, paper presentations. All engineering students welcome.", date:daysFromNow(12), location:"Main Auditorium & Sports Ground", targetAudience:"all" },
    { name:"Infosys Campus Placement Drive", description:"Infosys recruitment for 2026 batch. Package 4.5LPA. Bring resume, ID, photos.", date:daysFromNow(20), location:"Seminar Hall 1, Academic Block", targetAudience:"students" },
    { name:"Blood Donation Camp - NSS", description:"Blood donation camp with Red Cross. All healthy students & staff 18-60 welcome.", date:daysFromNow(5), location:"Medical Center, Ground Floor", targetAudience:"all" },
    { name:"Workshop: Docker & Kubernetes", description:"1-day hands-on workshop on containerization. Topics: Docker, Compose, K8s. Prerequisites: Linux, Python.", date:daysFromNow(8), location:"Computer Lab 3, CS Block", targetAudience:"students" },
    { name:"Alumni Meet 2026", description:"Annual alumni reunion for 2015-2022 batches. Keynotes, mentorship, department visits, gala dinner.", date:daysFromNow(35), location:"College Grounds & Convention Hall", targetAudience:"all" },
    { name:"Faculty Felicitation Ceremony", description:"Honoring faculty with 10+ years service and Scopus/SCI publications this year.", date:daysFromNow(25), location:"Conference Hall, Admin Block", targetAudience:"teachers" },
    { name:"Inter-College Football Tournament", description:"3-day tournament. 12 colleges. Knockout format. Day 1 - 10 AM.", date:daysFromNow(15), location:"Football Ground, Sports Complex", targetAudience:"all" },
    { name:"Mental Health Awareness Seminar", description:"Seminar by Dr. Priya Malhotra (NIMHANS) on student mental health & stress management.", date:daysFromNow(3), location:"Lecture Hall 5, Main Block", targetAudience:"students" },
    { name:"Industry Visit - Wipro Technologies", description:"Visit to Wipro Hinjewadi for CSE Sem 5&7. Transport provided. Formal dress. 50 seats.", date:daysFromNow(18), location:"Wipro Hinjewadi, Pune", targetAudience:"students", batch:"Batch 2022" },
    { name:"Convocation Ceremony 2026", description:"Graduation for Batch 2022. Chief Guest: Dr. K. Radhakrishnan. Parents invited. Formal attire.", date:daysFromNow(45), location:"Main Auditorium", targetAudience:"students" }
  ]);
  console.log("10 events seeded");
  // Library
  const insertedBooks = await Book.insertMany([
    { bookname:"Introduction to Algorithms", author:"Cormen, Leiserson, Rivest, Stein", totalQuantity:8, availableQuantity:5 },
    { bookname:"Operating System Concepts", author:"Abraham Silberschatz", totalQuantity:6, availableQuantity:4 },
    { bookname:"Database System Concepts", author:"Silberschatz, Korth, Sudarshan", totalQuantity:7, availableQuantity:6 },
    { bookname:"Computer Networks: A Top-Down Approach", author:"Kurose & Ross", totalQuantity:5, availableQuantity:3 },
    { bookname:"Artificial Intelligence: A Modern Approach", author:"Russell & Norvig", totalQuantity:6, availableQuantity:4 },
    { bookname:"Machine Learning: A Probabilistic Perspective", author:"Kevin P. Murphy", totalQuantity:4, availableQuantity:2 },
    { bookname:"Clean Code", author:"Robert C. Martin", totalQuantity:5, availableQuantity:3 },
    { bookname:"The Pragmatic Programmer", author:"David Thomas & Andrew Hunt", totalQuantity:4, availableQuantity:2 },
    { bookname:"Design Patterns: Reusable OO Software", author:"Gang of Four", totalQuantity:3, availableQuantity:1 },
    { bookname:"Head First Java", author:"Kathy Sierra & Bert Bates", totalQuantity:8, availableQuantity:6 },
    { bookname:"Python Crash Course", author:"Eric Matthes", totalQuantity:10, availableQuantity:7 },
    { bookname:"Deep Learning", author:"Goodfellow, Bengio, Courville", totalQuantity:4, availableQuantity:2 },
    { bookname:"Computer Organization & Architecture", author:"William Stallings", totalQuantity:6, availableQuantity:5 },
    { bookname:"Digital Design", author:"M. Morris Mano", totalQuantity:7, availableQuantity:6 },
    { bookname:"Engineering Mathematics Vol. 1", author:"B.S. Grewal", totalQuantity:12, availableQuantity:9 },
    { bookname:"Engineering Mathematics Vol. 2", author:"B.S. Grewal", totalQuantity:12, availableQuantity:8 },
    { bookname:"Signals & Systems", author:"Oppenheim & Willsky", totalQuantity:5, availableQuantity:4 },
    { bookname:"Thermodynamics: An Engineering Approach", author:"Cengel & Boles", totalQuantity:5, availableQuantity:4 },
    { bookname:"Fluid Mechanics", author:"Frank M. White", totalQuantity:4, availableQuantity:3 },
    { bookname:"Structural Analysis", author:"R.C. Hibbeler", totalQuantity:6, availableQuantity:5 },
    { bookname:"Cloud Computing Concepts", author:"Thomas Erl", totalQuantity:4, availableQuantity:2 },
    { bookname:"Cybersecurity Essentials", author:"Charles J. Brooks", totalQuantity:5, availableQuantity:3 },
    { bookname:"Data Science from Scratch", author:"Joel Grus", totalQuantity:6, availableQuantity:4 },
    { bookname:"The IoT Hackers Handbook", author:"Aditya Gupta", totalQuantity:3, availableQuantity:2 },
    { bookname:"Software Engineering 10th Edition", author:"Ian Sommerville", totalQuantity:8, availableQuantity:6 },
    { bookname:"Web Development with Node.js and React", author:"Vasan Subramanian", totalQuantity:5, availableQuantity:3 },
    { bookname:"Effective Java", author:"Joshua Bloch", totalQuantity:4, availableQuantity:3 },
    { bookname:"Theory of Computation", author:"Michael Sipser", totalQuantity:3, availableQuantity:2 },
    { bookname:"Pattern Recognition and Machine Learning", author:"Christopher Bishop", totalQuantity:3, availableQuantity:1 },
    { bookname:"Distributed Systems Principles", author:"Tanenbaum & Van Steen", totalQuantity:4, availableQuantity:3 }
  ]);
  console.log(`${insertedBooks.length} books seeded`);
  const issuedData = [];
  for (let i = 0; i < 25; i++) {
    const st = insertedStudents[i]; const book = rand(insertedBooks);
    const issueDate = daysAgo(randInt(3,14)); const dur = 14;
    const dueDate = new Date(issueDate.getTime()+dur*86400000);
    const status = rand(["Issued","Approved","Returned","Requested"]);
    issuedData.push({ book:book._id, student:st._id, bookname:book.bookname, author:book.author, studentName:st.name, rollno:st.rollno, batch:st.batch, requestDate:daysAgo(randInt(14,20)), issueDate, dueDate, durationDays:dur, returnDate:status==="Returned"?daysAgo(randInt(1,5)):undefined, status });
  }
  await IssuedBook.insertMany(issuedData);
  console.log(`${issuedData.length} issued books seeded`);
  // Fees
  const fees = [];
  const AY = ["2023-24","2024-25","2025-26"];
  for (const st of insertedStudents) {
    for (let i = 0; i < randInt(2,4); i++) {
      const status = rand(["completed","completed","completed","pending","failed"]);
      fees.push({ studentId:st._id, amount:st.feePerSemester+(Math.random()<0.3?500:0), paymentId:`PAY${Date.now()}${randInt(1000,9999)}`, paymentStatus:status, academicYear:rand(AY), semester:rand(SEMESTERS), PaidAt:daysAgo(randInt(10,200)), lateFee:Math.random()<0.3?500:0, paymentMode:rand(["Online Gateway","UPI","Net Banking","Demand Draft"]) });
    }
  }
  await Fee.insertMany(fees);
  console.log(`${fees.length} fee records seeded`);
  // Fines
  const FINE_TYPES = ["Library Late Return","Laboratory Damage","Campus / Property Damage","ID Card Reissue Fee","Late Fee Penalty","Other Institutional Fine"];
  const FINE_REASONS = {"Library Late Return":"Book returned 7 days past due date","Laboratory Damage":"Damaged oscilloscope probe in Lab 3","Campus / Property Damage":"Broken classroom chair","ID Card Reissue Fee":"Lost student ID card - reissuance charge","Late Fee Penalty":"Semester fee paid after deadline","Other Institutional Fine":"Violation of campus code of conduct"};
  const fines = [];
  for (const st of insertedStudents.slice(0,30)) {
    for (let j = 0; j < randInt(1,3); j++) {
      const ft = rand(FINE_TYPES); const status = rand(["Pending","Paid","Waived"]);
      fines.push({ student:st._id, studentName:st.name, rollno:st.rollno, fineType:ft, amount:rand([50,100,150,200,250,500,750,1000]), reason:FINE_REASONS[ft], status, leviedBy:rand(["Library Administration","Lab Supervisor","Dean Office","Accounts Administration"]), dueDate:daysFromNow(randInt(5,30)), paymentId:status==="Paid"?`FIN${Date.now()}${randInt(100,999)}`:"", paidAt:status==="Paid"?daysAgo(randInt(1,15)):undefined, paymentMode:status==="Paid"?rand(["Online Gateway","Cash","UPI"]):"", waiveReason:status==="Waived"?"Genuine case - waived by Dean":"" });
    }
  }
  await Fine.insertMany(fines);
  console.log(`${fines.length} fines seeded`);
  console.log("\n=== SEEDING COMPLETE ===");
  console.log(`Students: ${insertedStudents.length}`);
  console.log(`Teachers: ${insertedTeachers.length}`);
  console.log(`Attendance: ${attCount}`);
  console.log(`Exams: ${exams.length}, Assignments: ${assignList.length}`);
  console.log(`Books: ${insertedBooks.length}, Fees: ${fees.length}, Fines: ${fines.length}`);
  console.log("\nCredentials:");
  console.log("  Super Admin: admin@campus-sync.com / admin123");
  console.log("  HOD: hod.cs@campussync.edu.in / admin123");
  console.log("  Teachers: [email] / teacher123");
  console.log("  Students: [email] / student123");
  await mongoose.disconnect();
  process.exit(0);
}
seed().catch(err => { console.error("Seeding failed:", err); process.exit(1); });
