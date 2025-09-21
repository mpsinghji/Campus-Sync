import Fee from "../models/feeModel.js";

export const createFeeRecord = async (req, res) => {
  try {
    const { studentId, amount, paymentId, academicYear } = req.body;
    const newFee = await Fee.create({
      studentId,
      amount,
      paymentId,
      academicYear,
    });
    res.status(201).json({
        success:true,
        fee:newFee
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating fee record",
    });
  }
};

export const getFeeHistory = async (req, res) => {
  try {
    const {studentId}=req.params;
    const feeHistory = (await Fee.find({studentId}).sort({createdAt: -1}));
    res.status(200).json({
        success:true,
        feeHistory
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching fee history",
    });
  }
};
