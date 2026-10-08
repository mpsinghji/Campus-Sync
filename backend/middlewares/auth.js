import jwt from "jsonwebtoken";
import { Response } from "../utils/response.js";
import { message } from "../utils/message.js";
import Admin from "../models/adminModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]?.trim();

  if (!token || token === "undefined" || token === "null") {
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
    // Parsing cookies and headers
    const { adminToken, teacherToken, studentToken } = req.cookies || {};
    const authHeader = req.headers["authorization"];

    // Check which token is available
    let token;
    let role = "";

    // Check header first
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const candidate = authHeader.split(" ")[1]?.trim();
      if (candidate && candidate !== "undefined" && candidate !== "null") {
        token = candidate;
        try {
          const decoded = jwt.decode(token);
          if (decoded && decoded.role) {
            role = decoded.role;
          }
        } catch (e) {}
      }
    }

    // If no valid token from header, check cookies
    if (!token) {
      if (adminToken && adminToken !== "undefined" && adminToken !== "null") {
        token = adminToken;
        role = "admin";
      } else if (teacherToken && teacherToken !== "undefined" && teacherToken !== "null") {
        token = teacherToken;
        role = "teacher";
      } else if (studentToken && studentToken !== "undefined" && studentToken !== "null") {
        token = studentToken;
        role = "student";
      }
    }

    // If no token is provided
    if (!token) {
      return Response(res, 401, false, message.unAuthorizedMessage);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return Response(res, 401, false, jwtErr.message || message.invalidOrExpiredToken);
    }

    if (!role && decoded?.role) {
      role = decoded.role;
    }

    // Find user based on role
    let user;
    if (role === "admin") {
      user = await Admin.findById(decoded.id);
    } else if (role === "teacher") {
      user = await Teacher.findById(decoded.id);
    } else if (role === "student") {
      user = await Student.findById(decoded.id);
    } else {
      user = (await Admin.findById(decoded.id)) ||
             (await Teacher.findById(decoded.id)) ||
             (await Student.findById(decoded.id));
      if (user) {
        role = user.role || (user.isSuperAdmin !== undefined ? "admin" : "");
      }
    }

    // If user not found
    if (!user) {
      return Response(res, 401, false, `No ${role || "user"} found with this token`);
    }

    req.user = user;
    req.role = role; // Add role to request to use for role-based authorization
    next();
  } catch (error) {
    return Response(res, 401, false, error.message);
  }
};
