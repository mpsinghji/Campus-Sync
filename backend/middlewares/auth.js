import jwt from "jsonwebtoken";
import { Response } from "../utils/response.js";
import { message } from "../utils/message.js";
import Admin from "../models/adminModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";

const SUPER_ADMIN_EMAIL = "admin@campus-sync.com";

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
    const { adminToken, teacherToken, studentToken, token: genericCookieToken } = req.cookies || {};
    const authHeader = req.headers["authorization"];

    // Check which token is available
    let token;
    let roleHint = "";

    // Check header first
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const candidate = authHeader.split(" ")[1]?.trim();
      if (candidate && candidate !== "undefined" && candidate !== "null") {
        token = candidate;
      }
    }

    // If no valid token from header, check cookies
    if (!token) {
      if (adminToken && adminToken !== "undefined" && adminToken !== "null") {
        token = adminToken;
        roleHint = "admin";
      } else if (teacherToken && teacherToken !== "undefined" && teacherToken !== "null") {
        token = teacherToken;
        roleHint = "teacher";
      } else if (studentToken && studentToken !== "undefined" && studentToken !== "null") {
        token = studentToken;
        roleHint = "student";
      } else if (genericCookieToken && genericCookieToken !== "undefined" && genericCookieToken !== "null") {
        token = genericCookieToken;
      }
    }

    // If no token is provided
    if (!token) {
      return Response(res, 401, false, message.unAuthorizedMessage || "Unauthorized: Access token is required");
    }

    // Verify token cryptographically
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return Response(res, 401, false, jwtErr.message || message.invalidOrExpiredToken);
    }

    if (!decoded || !decoded.id) {
      return Response(res, 401, false, "Unauthorized: Malformed session token");
    }

    const tokenRole = decoded.role || roleHint;

    // Find user strictly based on verified token identity
    let user = null;
    let verifiedRole = "";

    if (tokenRole === "admin") {
      user = await Admin.findById(decoded.id);
      if (user) verifiedRole = "admin";
    } else if (tokenRole === "teacher") {
      user = await Teacher.findById(decoded.id);
      if (user) verifiedRole = "teacher";
    } else if (tokenRole === "student") {
      user = await Student.findById(decoded.id);
      if (user) verifiedRole = "student";
    }

    // If not found with hinted role, search exact ID across models
    if (!user) {
      user = await Admin.findById(decoded.id);
      if (user) {
        verifiedRole = "admin";
      } else {
        user = await Teacher.findById(decoded.id);
        if (user) {
          verifiedRole = "teacher";
        } else {
          user = await Student.findById(decoded.id);
          if (user) {
            verifiedRole = "student";
          }
        }
      }
    }

    // If user record no longer exists
    if (!user) {
      return Response(res, 401, false, `Unauthorized: No active ${tokenRole || "user"} account found for this token`);
    }

    // Enforce account restriction status
    if (user.isRestricted) {
      return Response(
        res,
        403,
        false,
        `Account access restricted by administration. ${user.restrictionReason ? "Reason: " + user.restrictionReason : "Please contact campus support."}`
      );
    }

    req.user = user;
    req.role = verifiedRole;
    req.isSuperAdmin = Boolean(
      verifiedRole === "admin" &&
      (user.isSuperAdmin === true || user.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL)
    );

    next();
  } catch (error) {
    return Response(res, 401, false, error.message);
  }
};

// Flexible Role-based Authorization Guard
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return Response(res, 401, false, "Authentication required");
    }

    const isSuper = req.isSuperAdmin;
    const userRole = (req.role || "").toLowerCase();
    const userResponsibility = (req.user?.responsibility || "").toLowerCase();

    const isPermitted = allowedRoles.some((roleItem) => {
      const lower = roleItem.toLowerCase();
      if (lower === "superadmin") return isSuper;
      if (lower === "admin") return userRole === "admin";
      if (lower === "teacher") return userRole === "teacher";
      if (lower === "student") return userRole === "student";
      // Allow faculty specialization checks like "librarian", "exam controller", "event coordinator", "student registrar"
      if (userRole === "teacher" && userResponsibility === lower) return true;
      return false;
    });

    if (!isPermitted) {
      return Response(res, 403, false, `Forbidden: Role '${req.role}' is not authorized to access this resource.`);
    }

    next();
  };
};

// Dedicated Role Guards
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.role !== "admin") {
    return Response(res, 403, false, "Forbidden: Administrator privileges required.");
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.role !== "admin" || !req.isSuperAdmin) {
    return Response(res, 403, false, "Forbidden: Only Super Administrator (admin@campus-sync.com) has authorization.");
  }
  next();
};

export const requireStaffOrAdmin = (req, res, next) => {
  if (!req.user || (req.role !== "admin" && req.role !== "teacher")) {
    return Response(res, 403, false, "Forbidden: Faculty or Administrator authorization required.");
  }
  next();
};
