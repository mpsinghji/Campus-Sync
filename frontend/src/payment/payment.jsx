import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
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
const Payment = () => {
  const [responseId, setResponseId] = React.useState("");
  const [responseState, setResponseState] = React.useState("");
  const navigate = useNavigate();

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

  const createRazorpayOrder = (amount) => {
    let data = JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      studentId: "temp_student", // You can get this from user context
      academicYear: new Date().getFullYear().toString()
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${BACKEND_URL}Fees`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        handleRazorpayScreen(response.data.amount);
      })
      .catch((error) => {
        console.log("error at", error);
        console.log("Error details:", error.response?.data);
      });
  };

  const handleRazorpayScreen = async (amount) => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!res) {
      alert("Some error at Razorpay loading screen");
      return;
    }

    const options = {
      key: "rzp_test_RJjIrWx8F7ZuO8", // Updated to match backend key
      amount: amount,
      currency: "INR",
      name: "Campus Sync",
      description: "Fee Payment",
      image: "../assets/bg1.png",
      handler: function (response) {
        setResponseId(response.razorpay_payment_id);
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

  // const paymentFetch = (e) => {
  //   e.preventDefault();

  //   const paymentId = e.target.paymentId.value;

  //   axios
  //     .get(`${BACKEND_URL}payment/${paymentId}`)
  //     .then((response) => {
  //       console.log(response.data);
  //       setResponseState(response.data);
  //     })
  //     .catch((error) => {
  //       console.log("error occurred", error);
  //     });
  // };

  return (
    <Container>
      <FormContainer>
        <Logo src={ProjectLogo} alt="Logo" />
        <Title>Fee Payment</Title>
        <Button onClick={() => createRazorpayOrder(100)}>Pay Now</Button>
        {responseId && <ResponseText>Payment ID: {responseId}</ResponseText>}
        {/* <h3>OR</h3> */}
        {/* <Form onSubmit={paymentFetch}> */}
          {/* <Input type="text" name="paymentId" placeholder="Enter Payment ID" /> */}
          {/* <Button type="submit">Fetch Payment</Button>
          {responseState.length !== 0 && (
            <List>
              <li>Amount: ₹{responseState.amount / 100}</li>
              <li>Currency: {responseState.currency}</li>
              <li>Status: {responseState.status}</li>
              <li>Method: {responseState.method}</li>
            </List> */}
          {/* )} */}
        {/* </Form> */}
      </FormContainer>
    </Container>
  );
};

export default Payment;
