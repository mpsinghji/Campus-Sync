import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";
import styled from "styled-components";
import { BACKEND_URL } from "../../constants/url";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);

const GraphCard = styled.div`
  flex: 1;
  min-height: 420px;
  width: 100%;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
  }
`;

const HeaderArea = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;

  .title-group {
    h2 {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    p {
      font-size: 13px;
      color: #64748b;
      margin: 4px 0 0 0;
    }
  }
`;

const TrendBadge = styled.div`
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MiniKpiRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const KpiPill = styled.div`
  flex: 1;
  min-width: 90px;
  background: ${(props) => props.$bg || "#f8fafc"};
  border: 1px solid ${(props) => props.$border || "#e2e8f0"};
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;

  .label {
    font-size: 11px;
    font-weight: 600;
    color: ${(props) => props.$labelColor || "#64748b"};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .val {
    font-size: 18px;
    font-weight: 700;
    color: ${(props) => props.$valColor || "#1e293b"};
    margin-top: 2px;
  }
`;

const ChartContainer = styled.div`
  flex: 1;
  position: relative;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyNotice = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
  font-size: 14px;

  .icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
`;

const PaymentGraph = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BACKEND_URL}api/v1/fees/analytics`, {
          withCredentials: true,
        });

        if (response.data?.success) {
          const { dates, counts, totalTransactions } = response.data;
          setAnalytics(response.data);

          if (Array.isArray(dates) && dates.length > 0 && Array.isArray(counts) && counts.length > 0) {
            setPaymentData({
              labels: dates,
              datasets: [
                {
                  label: "Settled Payments",
                  data: counts,
                  borderColor: "#0284c7",
                  backgroundColor: "rgba(14, 165, 233, 0.12)",
                  fill: true,
                  tension: 0.35,
                  borderWidth: 3,
                  pointBackgroundColor: "#0284c7",
                  pointBorderColor: "#ffffff",
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            });
          } else {
            setPaymentData(null);
          }
        } else {
          setAnalytics(null);
          setPaymentData(null);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load payment analytics.");
        setAnalytics(null);
        setPaymentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  const totalTransactions = analytics?.totalTransactions || 0;
  const completedCount = analytics?.completedCount || 0;
  const totalCollected = analytics?.totalCollectedAmount || 0;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#64748b" },
      },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: { font: { size: 11 }, color: "#94a3b8", stepSize: 1 },
        beginAtZero: true,
      },
    },
  };

  return (
    <GraphCard>
      <HeaderArea>
        <div className="title-group">
          <h2>💳 Fee Collection & Flow</h2>
          <p>Transaction inflow trend across academic accounts</p>
        </div>
        {totalTransactions > 0 && (
          <TrendBadge>₹{totalCollected.toLocaleString("en-IN")} Total Collected</TrendBadge>
        )}
      </HeaderArea>

      <MiniKpiRow>
        <KpiPill $bg="#f0f9ff" $border="#bae6fd" $labelColor="#075985" $valColor="#0284c7">
          <span className="label">Total Records</span>
          <span className="val">{totalTransactions}</span>
        </KpiPill>

        <KpiPill $bg="#ecfdf5" $border="#a7f3d0" $labelColor="#065f46" $valColor="#047857">
          <span className="label">Settled Payments</span>
          <span className="val">{completedCount}</span>
        </KpiPill>

        <KpiPill $bg="#fdf4ff" $border="#f5d0fe" $labelColor="#86198f" $valColor="#a21caf">
          <span className="label">Gateway Telemetry</span>
          <span className="val">{totalTransactions > 0 ? "Active" : "Ready"}</span>
        </KpiPill>
      </MiniKpiRow>

      <ChartContainer>
        {loading ? (
          <EmptyNotice>
            <div className="icon">⏳</div>
            <div>Loading payment telemetries...</div>
          </EmptyNotice>
        ) : error ? (
          <EmptyNotice style={{ color: "#e11d48" }}>
            <div className="icon">⚠️</div>
            <div>{error}</div>
          </EmptyNotice>
        ) : paymentData ? (
          <Line data={paymentData} options={options} />
        ) : (
          <EmptyNotice>
            <div className="icon">💳</div>
            <div>No fee payment transactions recorded yet.</div>
          </EmptyNotice>
        )}
      </ChartContainer>
    </GraphCard>
  );
};

export default PaymentGraph;
