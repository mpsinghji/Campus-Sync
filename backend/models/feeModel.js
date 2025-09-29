import mongoose from "mongoose";

const feeSchema=new mongoose.Schema({
    studentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    paymentId:{
        type:String,
        required:true
    },
    paymentStatus:{
        type:String,
        enum:['pending','completed','failed'],
        default:'pending'
    },
    academicYear:{
        type:String,
        required:true
    },
    semester:{
        type:String,
        required:true
    },
    PaidAt:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});

const Fee=mongoose.model('Fee',feeSchema);
export default Fee;