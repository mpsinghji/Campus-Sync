import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Loading from "../components/Loading/loading";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, roles }) => {
  // const { isAuthenticated, userRole } = useAuth();
  const { isAuthenticated, loading } = useSelector((state) => state.admin);
  console.log("isAuthenticated:", isAuthenticated);
  console.log("userRole:", userRole);
  console.log("allowed roles:", roles);

  // if (isAuthenticated === null) {
  //   return <Loading />;
  // }

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
