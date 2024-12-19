import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loading from "../components/Loading/loading";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated: isAuthenticatedAdmin, loading: loadingAdmin, userRole: userRoleAdmin } = useSelector((state) => {return state.admin});
  const { isAuthenticated: isAuthenticatedTeacher, loading: loadingTeacher, userRole: userRoleTeacher } = useSelector((state) => {return state.teacher});
  const { isAuthenticated: isAuthenticatedStudent, loading: loadingStudent, userRole: userRoleStudent } = useSelector((state) => {return state.student});
  const [role, setRole] = useState("");
  // console.log("isAuthenticated:", isAuthenticated);
  // console.log("userRole:", userRole);
  console.log("allowed roles:", roles);
  // console.log("loading:", loading);
  // console.log("roles and userRole:",roles && roles.includes(userRole));

  useEffect(() => {
    console.log('roles: ', roles[0])
    if(roles[0] === "admin"){
      setRole({
        isAuthenticated: isAuthenticatedAdmin,
        loading: loadingAdmin,
        userRole: 'admin'
      });
    } else if(roles[0] === "teacher"){
      setRole({
        isAuthenticated: isAuthenticatedTeacher,
        loading: loadingTeacher,
        userRole: 'teacher'
      });
    } else {
      setRole({
        isAuthenticated: isAuthenticatedStudent,
        loading: loadingStudent,
        userRole: 'student'
      });
    }
  }, [roles])

  useEffect(() => {
    console.log("role:", role);
  }, [role])

  return (
    (role.loading===true || role.loading===undefined) ? <Loading /> : (
      role.isAuthenticated && roles && roles.includes(role.userRole) ? (
        children
      ) : (
        <Navigate to="/choose-user" />
      )
    )
  )
};

export default ProtectedRoute;
