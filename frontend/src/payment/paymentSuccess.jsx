import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const rotateXAnimation = {
    animation: "rotateY 1s ease-in-out forwards",
    marginLeft: "40px",
  };

  const keyframesStyle = `
    @keyframes rotateY {
      0% {
        transform: rotateY(0deg);
      }
      100% {
        transform: rotateY(360deg);
      }
    }
  `;

  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        color: "#4A5568",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        padding: "20px",
      }}
    >
      <style>{keyframesStyle}</style>
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          padding: "36px 30px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
          textAlign: "center",
          border: "1px solid #e2e8f0",
        }}
      >

        <svg
          viewBox="0 0 24 24"
          className="text-green-600 w-16 h-16 mx-auto my-4"
          style={rotateXAnimation}
          width={"70%"}
        >
          <path
            fill="green"
            d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"
          ></path>
        </svg>


        <div>
          <h3
            className="text-lg md:text-2xl font-semibold mb-4"
            style={{
              color: "#2D3748",
              textAlign: "center",
              fontSize: "24px",
            }}
          >
            Payment Successful!
          </h3>
          <p
            className="text-sm md:text-base mb-2"
            style={{
              lineHeight: "1.6",
              textAlign: "center",
            }}
          >
            Thank you for completing your secure online payment.
          </p>
          <p className="text-sm md:text-base" style={{ textAlign: "center",color: "#333" }}>Have a great day!</p>


          <button
            onClick={() => navigate("/student/fees")}
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              cursor: "pointer",
              backgroundColor: "#10b981",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "600",
              border: "none",
              marginTop: "20px",
              transition: "background-color 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#059669")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#10b981")}
          >
            📄 View Fee Receipt in Student Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
