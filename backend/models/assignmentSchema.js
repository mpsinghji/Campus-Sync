import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    batch: {
        type: String,
        default: 'all',
    },
    department: {
        type: String,
        default: 'Computer Science',
    },
    section: {
        type: String,
        default: 'A',
    },
    className: {
        type: String,
        default: 'Semester 1',
    },
    subject: {
        type: String,
        default: 'General',
    },
    teacherName: {
        type: String,
        default: 'Faculty',
    },
    dueDate: {
        type: Date,
    },
    targetAudience: {
        type: String,
        default: 'all', // 'all', 'cohort', 'particular_student'
    },
    targetStudentEmail: {
        type: String,
        default: '',
        trim: true,
        lowercase: true,
    },
    targetStudentEmails: {
        type: [String],
        default: [],
    },
    targetStudentRollno: {
        type: String,
        default: '',
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;