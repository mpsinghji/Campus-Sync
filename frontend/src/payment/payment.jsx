import axios from "axios";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  FormContainer,
  Logo,
  Title,
  Button,
  ResponseText,
  Form,
  Input,
  List,
} from "../styles/paymentStyles";
import ProjectLogo from "../assets/bg1.png";
import { BACKEND_URL } from "../constants/url";
import Cookies from "js-cookie";

const Payment = () => {
  const [responseId, setResponseId] = React.useState("");
  const [responseState, setResponseState] = React.useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const semester = location.state?.semester || "1st Semester";

  const getLoggedInStudentId = () => {
    try {
      const raw = Cookies.get("studentData");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.user?._id || parsed.user?.id || parsed.id;
      }
    } catch {}
    return "507f1f77bcf86cd799439011";
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const updatePaymentStatus = async (paymentId, orderId) => {
    try {
      console.log('Completing verified payment for:', paymentId, orderId);
      const response = await axios.post(
        `${BACKEND_URL}complete-fee-payment`,
        {
          amount: 100,
          semester: semester,
          academicYear: new Date().getFullYear().toString(),
          paymentMode: "Razorpay Payment Gateway",
          paymentId: paymentId,
          orderId: orderId,
        },
        { withCredentials: true }
      );
      console.log('Payment status update response:', response.data);
    } catch (error) {
      console.error('Error recording payment status:', error);
    }
  };

  const createRazorpayOrder = (amount) => {
    let data = JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      studentId: getLoggedInStudentId(),
      academicYear: new Date().getFullYear().toString(),
      semester: semester
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${BACKEND_URL}Fees`,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        handleRazorpayScreen(response.data.amount, response.data.order_id);
      })
      .catch((error) => {
        console.log("error at", error);
        console.log("Error details:", error.response?.data);
      });
  };

  const handleRazorpayScreen = async (amount, orderId) => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!res) {
      alert("Some error at Razorpay loading screen");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_RJjIrWx8F7ZuO8",
      amount: amount,
      currency: "INR",
      name: "Campus Sync",
      description: "Fee Payment",
      order_id: orderId && orderId.startsWith("order_") ? orderId : undefined,
      image: "../assets/bg1.png",
      handler: function (response) {
        setResponseId(response.razorpay_payment_id);
        // Securely complete fee payment on backend via single source of truth
        updatePaymentStatus(response.razorpay_payment_id, response.razorpay_order_id || orderId);
        navigate("/payment-success");
      },
      prefill: {
        name: "Campus Sync",
        email: "m2210991889@gmail.com",
      },
      theme: {
        color: "#3399cc",
      },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <Container>
      <FormContainer>
        <Logo src={ProjectLogo} alt="Logo" />
        <Title>Fee Payment</Title>
        <Button onClick={() => createRazorpayOrder(100)}>Pay Now</Button>
        {responseId && <ResponseText>Payment ID: {responseId}</ResponseText>}
      </FormContainer>
    </Container>
  );
};

export default Payment;
