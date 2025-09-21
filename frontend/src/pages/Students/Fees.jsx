import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { 
  FeesContainer, 
  FeesTable, 
  FeesTableHead, 
  FeesTableRow, 
  FeesHeader, 
  FeesTableHeader, 
  FeesTableData, 
  FeesPayButton 
} from "../../styles/feesStyles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/loading.jsx";
import Cookies from "js-cookie";
import axios from "axios";
import { BACKEND_URL } from "../../constants/url";

const Fees = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [semesterTitle, setSemesterTitle] = useState("");
  const [feeData, setFeeData] = useState(null);
  const [studentId, setStudentId] = useState("temp_student"); // You can get this from user context
  
  // Fetch fee data from backend
  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}student-fees/${studentId}`);
        setFeeData(response.data.data);
      } catch (error) {
        console.error('Error fetching fee data:', error);
        toast.error("Failed to fetch fee data");
      } finally {
        setLoading(false);
      }
    };

    fetchFeeData();
  }, [studentId]);

  const feesData = [
    { semester: "1st Semester", amount: "₹100" },
    { semester: "2nd Semester", amount: "₹100" },
    { semester: "3rd Semester", amount: "₹100" },
    { semester: "4th Semester", amount: "₹100" },
    { semester: "5th Semester", amount: "₹100" },
    { semester: "6th Semester", amount: "₹100" },
  ];

  const handlePayment = (semester) => {
    setSemesterTitle(semester);
    // Navigate to payment page
    navigate("/payment", { state: { semesterTitle: semester } });
  };

  const getPaymentStatus = (semester) => {
    if (!feeData || !feeData.fees) return 'pending';
    
    // Check if there's a completed payment for this semester
    const completedPayment = feeData.fees.find(fee => 
      fee.paymentStatus === 'completed' && 
      fee.academicYear === new Date().getFullYear().toString()
    );
    
    return completedPayment ? 'completed' : 'pending';
  };

  const getPaymentButtonText = (semester) => {
    const status = getPaymentStatus(semester);
    switch (status) {
      case 'completed':
        return 'Paid';
      case 'pending':
        return 'Pay';
      case 'failed':
        return 'Retry';
      default:
        return 'Pay';
    }
  };

  const getPaymentButtonColor = (semester) => {
    const status = getPaymentStatus(semester);
    switch (status) {
      case 'completed':
        return { backgroundColor: "green", color: "white" };
      case 'failed':
        return { backgroundColor: "red", color: "white" };
      default:
        return {};
    }
  };

  return (
    <>
      <div className="flex">
        {loading && <Loading />} 
        <Sidebar />
        <FeesContainer>
          <FeesHeader>Fees</FeesHeader>
          <FeesTable>
            <FeesTableHead>
              <FeesTableRow>
                <FeesTableHeader>Semester</FeesTableHeader>
                <FeesTableHeader>Amount</FeesTableHeader>
                <FeesTableHeader>Action</FeesTableHeader>
              </FeesTableRow>
            </FeesTableHead>
            <tbody>
              {feesData.map((fee, index) => {
                const paymentStatus = getPaymentStatus(fee.semester);
                const isDisabled = paymentStatus === 'completed';
                
                return (
                  <FeesTableRow key={index}>
                    <FeesTableData>{fee.semester}</FeesTableData>
                    <FeesTableData>{fee.amount}</FeesTableData>
                    <FeesTableData>
                      <FeesPayButton
                        onClick={() => handlePayment(fee.semester)}
                        style={getPaymentButtonColor(fee.semester)}
                        disabled={isDisabled}
                      >
                        {getPaymentButtonText(fee.semester)}
                      </FeesPayButton>
                    </FeesTableData>
                  </FeesTableRow>
                );
              })}
            </tbody>
          </FeesTable>
        </FeesContainer>
      </div>
      <ToastContainer />
    </>
  );
};

export default Fees;
