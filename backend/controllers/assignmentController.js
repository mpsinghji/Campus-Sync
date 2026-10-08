import Assignment from '../models/assignmentSchema.js';
import { Submission } from '../models/submissionModel.js';
import Student from '../models/studentModel.js';

export const getAllAssignments = async (req, res) => {
    try {
        const { batch, department, section, className, semester, studentEmail, studentRollno, role } = req.query;

        // If queried by staff without student context, return all
        if (role === "admin" || role === "teacher") {
            const assignments = await Assignment.find().sort({ createdAt: -1 });
            return res.status(200).json({ success: true, assignments });
        }

        const cleanEmail = studentEmail ? studentEmail.toLowerCase().trim() : '';
        const cleanRoll = studentRollno ? String(studentRollno).trim() : '';
        const cleanDept = department && department !== 'all' ? department.trim() : '';
        const cleanBatch = batch && batch !== 'all' ? batch.trim() : '';
        const cleanSection = section && section !== 'all' ? section.trim().replace(/^Section\s+/i, '') : '';
        const cleanSem = (semester || className) && (semester !== 'all' && className !== 'all') ? String(semester || className).trim() : '';

        // Direct student targeting conditions
        const targetedOr = [];
        if (cleanEmail) {
            targetedOr.push({ targetStudentEmail: cleanEmail });
            targetedOr.push({ targetStudentEmails: { $in: [cleanEmail] } });
        }
        if (cleanRoll) {
            targetedOr.push({ targetStudentRollno: cleanRoll });
        }

        // Cohort matching conditions (only for non-individual assignments)
        const cohortConditions = [
            { targetAudience: { $ne: 'particular_student' } },
            { targetStudentEmail: { $in: ['', null] } },
        ];

        if (cleanDept) {
            cohortConditions.push({
                department: { $in: ['all', 'All', cleanDept] }
            });
        }
        if (cleanBatch) {
            cohortConditions.push({
                batch: { $in: ['all', 'All', cleanBatch] }
            });
        }
        if (cleanSection) {
            cohortConditions.push({
                $or: [
                    { section: { $in: ['all', 'All', ''] } },
                    { section: cleanSection },
                    { section: `Section ${cleanSection}` },
                    { section: `Section ${cleanSection.toUpperCase()}` }
                ]
            });
        }
        if (cleanSem) {
            cohortConditions.push({
                $or: [
                    { className: { $in: ['all', 'All', ''] } },
                    { className: cleanSem },
                    { className: cleanSem.replace(/^Semester\s+/i, 'Sem ') }
                ]
            });
        }

        let filter;
        if (targetedOr.length > 0 && cohortConditions.length > 2) {
            filter = {
                $or: [
                    { $or: targetedOr },
                    { $and: cohortConditions }
                ]
            };
        } else if (targetedOr.length > 0) {
            filter = {
                $or: [
                    { $or: targetedOr },
                    { targetAudience: { $ne: 'particular_student' } }
                ]
            };
        } else if (cohortConditions.length > 2) {
            filter = { $and: cohortConditions };
        } else {
            filter = {};
        }

        const assignments = await Assignment.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addAssignment = async (req, res) => {
    const {
        title,
        description,
        batch,
        department,
        section,
        className,
        subject,
        teacherName,
        dueDate,
        targetAudience,
        targetStudentEmail,
        targetStudentEmails,
        targetStudentRollno,
    } = req.body;

    if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    
    try {
        let emailsArray = [];
        if (Array.isArray(targetStudentEmails)) {
            emailsArray = targetStudentEmails.map(e => String(e).trim().toLowerCase()).filter(Boolean);
        } else if (typeof targetStudentEmails === 'string' && targetStudentEmails.trim()) {
            emailsArray = targetStudentEmails.split(/[\s,;]+/).map(e => e.trim().toLowerCase()).filter(Boolean);
        }

        const newAssignment = new Assignment({
            title: title.trim(),
            description: description.trim(),
            batch: batch || 'all',
            department: department || 'Computer Science',
            section: section || 'A',
            className: className || 'Semester 1',
            subject: subject || 'General',
            teacherName: teacherName || 'Faculty',
            dueDate: dueDate || null,
            targetAudience: targetAudience || (targetStudentEmail ? 'particular_student' : 'all'),
            targetStudentEmail: targetStudentEmail ? targetStudentEmail.toLowerCase().trim() : '',
            targetStudentEmails: emailsArray,
            targetStudentRollno: targetStudentRollno ? targetStudentRollno.trim() : '',
        });
        
        await newAssignment.save();

        return res.status(201).json({ success: true, assignment: newAssignment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const countAssignments = async (req, res) => {
    try {
        const count = await Assignment.countDocuments();
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.query;
        const filter = {};
        if (assignmentId) filter.assignmentId = assignmentId;

        // Role-based scoping: students only see their own submissions
        if (req.user?.role === "student") {
            filter.studentId = req.user._id;
        }

        const submissions = await Submission.find(filter)
            .populate("studentId", "name rollno email department batch")
            .populate("assignmentId", "title subject dueDate")
            .sort({ submittedAt: -1 });

        res.status(200).json({ success: true, count: submissions.length, submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, fileUrl, remarks } = req.body;
        if (!assignmentId || !fileUrl) {
            return res.status(400).json({ success: false, message: "assignmentId and fileUrl are required" });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        let studentId = req.user?._id;
        let studentName = req.user?.name;
        let studentRollno = req.user?.rollno;

        if (req.user?.role === "student") {
            const student = await Student.findById(studentId);
            if (student) {
                studentName = student.name;
                studentRollno = student.rollno;
            }
        } else if (req.body.studentRollno) {
            const student = await Student.findOne({ rollno: req.body.studentRollno.trim() });
            if (student) {
                studentId = student._id;
                studentName = student.name;
                studentRollno = student.rollno;
            }
        }

        const submission = new Submission({
            assignmentId,
            assignmentTitle: assignment.title,
            studentId,
            studentRollno: studentRollno || "N/A",
            studentName: studentName || "Student",
            subject: assignment.subject || "General",
            fileUrl: fileUrl.trim(),
            status: "Submitted",
            remarks: remarks || "",
        });

        await submission.save();

        res.status(201).json({ success: true, message: "Assignment submitted successfully", submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const gradeSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, status, remarks } = req.body;

        const updated = await Submission.findByIdAndUpdate(
            id,
            { score: Number(score), status: status || "Graded", remarks: remarks || "" },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        res.status(200).json({ success: true, message: "Submission graded successfully", submission: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};