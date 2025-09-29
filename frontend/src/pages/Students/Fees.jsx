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
  const [studentId, setStudentId] = useState("507f1f77bcf86cd799439011"); // You can get this from user context or Redux store
  
  // Fetch fee data from backend
  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}student-fees/${studentId}`);
        console.log('Fee data fetched:', response.data.data);
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
    const status = getPaymentStatus(semester);
    if (status === 'completed' || status === 'pending') {
      return; // Don't allow payment for completed or pending fees
    }
    setSemesterTitle(semester);
    // Navigate to payment page with semester information
    navigate("/payment", { state: { semesterTitle: semester, semester: semester } });
  };

  const refreshFeeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}student-fees/${studentId}`);
      setFeeData(response.data.data);
      toast.success("Fee data refreshed!");
    } catch (error) {
      console.error('Error refreshing fee data:', error);
      toast.error("Failed to refresh fee data");
    } finally {
      setLoading(false);
    }
  };


  const getPaymentStatus = (semester) => {
    if (!feeData || !feeData.fees) return 'unpaid';
    
    console.log('Checking payment status for semester:', semester);
    console.log('Available fees:', feeData.fees);
    
    // Check if there's a completed payment for this specific semester
    const completedPayment = feeData.fees.find(fee => 
      fee.paymentStatus === 'completed' && 
      fee.semester === semester &&
      fee.academicYear === new Date().getFullYear().toString()
    );
    
    console.log('Completed payment found:', completedPayment);
    if (completedPayment) return 'completed';
    
    // Check for pending payments for this specific semester
    const pendingPayment = feeData.fees.find(fee => 
      fee.paymentStatus === 'pending' && 
      fee.semester === semester &&
      fee.academicYear === new Date().getFullYear().toString()
    );
    
    if (pendingPayment) return 'pending';
    
    // Check for failed payments for this specific semester
    const failedPayment = feeData.fees.find(fee => 
      fee.paymentStatus === 'failed' && 
      fee.semester === semester &&
      fee.academicYear === new Date().getFullYear().toString()
    );
    
    if (failedPayment) return 'failed';
    
    return 'unpaid';
  };

  const getPaymentButtonText = (semester) => {
    const status = getPaymentStatus(semester);
    switch (status) {
      case 'completed':
        return 'Paid ✓';
      case 'pending':
        return 'Processing...';
      case 'failed':
        return 'Retry Payment';
      case 'unpaid':
        return 'Pay Now';
      default:
        return 'Pay Now';
    }
  };

  const getPaymentButtonColor = (semester) => {
    const status = getPaymentStatus(semester);
    switch (status) {
      case 'completed':
        return { backgroundColor: "#28a745", color: "white", cursor: "not-allowed" };
      case 'pending':
        return { backgroundColor: "#ffc107", color: "black", cursor: "not-allowed" };
      case 'failed':
        return { backgroundColor: "#dc3545", color: "white" };
      case 'unpaid':
        return { backgroundColor: "#007bff", color: "white" };
      default:
        return { backgroundColor: "#007bff", color: "white" };
    }
  };

  return (
    <>
      <div className="flex">
        {loading && <Loading />} 
        <Sidebar />
        <FeesContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <FeesHeader>Fees</FeesHeader>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={refreshFeeData}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
          </div>
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
                const isDisabled = paymentStatus === 'completed' || paymentStatus === 'pending';
                
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
