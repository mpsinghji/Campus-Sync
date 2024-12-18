import React from "react";
import { Navigate } from "react-router-dom";
import Loading from "../components/Loading/loading";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, userRole } = useSelector((state) => {return state.user || {};});
  console.log("isAuthenticated:", isAuthenticated);
  console.log("userRole:", userRole);
  console.log("allowed roles:", roles);
  console.log("loading:", loading);
  console.log("roles and userRole:",roles && roles.includes(userRole));

  return (
    loading===true || loading===undefined ? <Loading /> : (
      isAuthenticated && roles && roles.includes(userRole) ? (
        children
      ) : (
        <Navigate to="/choose-user" />
      )
    )
  )
};

export default ProtectedRoute;
