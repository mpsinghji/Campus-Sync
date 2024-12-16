import jwt from "jsonwebtoken";
import { Response } from "../utils/response.js";
import { message } from "../utils/message.js";
import Admin from "../models/adminModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return Response(res, 401, false, message.noTokenProvided);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return Response(res, 403, false, message.invalidOrExpiredToken);
    }
    req.user = decoded;
    next();
  });
};

export const isAuthenticated = async (req, res, next) => {
  try {
    // Parsing cookies
    const { admintoken, teachertoken, studenttoken } = req.cookies;
    console.log("Cookies:", req.cookies);

    // Check which token is available
    let token;
    let role = "";

    if (admintoken) {
      token = admintoken;
      role = "admin";
    } else if (teachertoken) {
      token = teachertoken;
      role = "teacher";
    } else if (studenttoken) {
      token = studenttoken;
      role = "student";
    }

    // If no token is provided
    if (!token) {
      return Response(res, 401, false, message.unAuthorizedMessage);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user based on role
    let user;
    if (role === "admin") {
      user = await Admin.findById(decoded.id);
    } else if (role === "teacher") {
      user = await Teacher.findById(decoded.id);
    } else if (role === "student") {
      user = await Student.findById(decoded.id);
    }

    // If user not found
    if (!user) {
      return Response(res, 401, false, `No ${role} found with this token`);
    }

    req.user = user;
    req.role = role; // Add role to request to use for role-based authorization
    next();
  } catch (error) {
    return Response(res, 500, false, error.message);
  }
};
