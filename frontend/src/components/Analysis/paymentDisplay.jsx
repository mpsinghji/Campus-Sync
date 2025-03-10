import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import styled from "styled-components";

const GraphWrapper = styled.div`
  flex: 1;
  height: 400px;
  max-height: 500px;
  width: 100%;
  max-width: 600px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow: hidden;
  margin: 0 auto;
`;

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const PaymentGraph = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const response = await axios.get("https://campus-sync-ez7y.onrender.com/payments");

        if (response.data.success) {
          const payments = response.data.data;

          const dates = [];
          const paymentCounts = [];
          payments.forEach((payment) => {
            dates.push(payment.date);
            paymentCounts.push(payment.count);
          });

          setPaymentData({
            labels: dates,
            datasets: [
              {
                label: "Payments Received",
                data: paymentCounts,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: false,
              },
            ],
          });
        } else {
          setError("Failed to fetch payment data");
        }
      } catch (error) {
        setError("Error fetching payments");
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  return (
    <GraphWrapper>
      <h2>Payment Graph</h2>
      {loading ? (
        <p>Loading payment data...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <Line
          data={paymentData}
          options={{
            responsive: true,
            maintainAspectRatio: true, // Allow chart to fill its container
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
            },
            scales: {
              x: {
                beginAtZero: true,
              },
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function (value) {
                    return `${value}`;
                  },
                },
              },
            },
          }}
        />
      )}
    </GraphWrapper>
  );
};

export default PaymentGraph;
