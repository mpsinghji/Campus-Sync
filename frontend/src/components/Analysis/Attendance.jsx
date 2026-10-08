import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import styled from "styled-components";
import { BACKEND_URL } from "../../constants/url";

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

const AttendanceRateBadge = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
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

const AttendanceGraph = () => {
  const [chartData, setChartData] = useState(null);
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [hasRecords, setHasRecords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BACKEND_URL}api/v1/attendance/records`, {
          withCredentials: true,
        });

        if (response.data?.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          const attendanceRecords = response.data.data;
          const attendanceByDate = {};
          let pCount = 0;
          let aCount = 0;

          attendanceRecords.forEach(({ date, status }) => {
            const dateStr = date ? String(date).split("T")[0] : "Recent";
            if (!attendanceByDate[dateStr]) attendanceByDate[dateStr] = { Present: 0, Absent: 0 };
            if (status === "Present") {
              attendanceByDate[dateStr].Present++;
              pCount++;
            } else {
              attendanceByDate[dateStr].Absent++;
              aCount++;
            }
          });

          setTotalPresent(pCount);
          setTotalAbsent(aCount);
          setHasRecords(true);

          const labels = Object.keys(attendanceByDate).sort().slice(-7);
          const presentData = labels.map((d) => attendanceByDate[d].Present);
          const absentData = labels.map((d) => attendanceByDate[d].Absent);

          setChartData({
            labels,
            datasets: [
              {
                label: "Present",
                data: presentData,
                backgroundColor: "rgba(16, 185, 129, 0.85)",
                borderRadius: 6,
                borderSkipped: false,
              },
              {
                label: "Absent",
                data: absentData,
                backgroundColor: "rgba(244, 63, 94, 0.85)",
                borderRadius: 6,
                borderSkipped: false,
              },
            ],
          });
        } else {
          setHasRecords(false);
          setTotalPresent(0);
          setTotalAbsent(0);
          setChartData(null);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load attendance analytics records.");
        setHasRecords(false);
        setTotalPresent(0);
        setTotalAbsent(0);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const total = totalPresent + totalAbsent;
  const attendancePct = total > 0 ? ((totalPresent / total) * 100).toFixed(1) : "0";

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: { boxWidth: 12, font: { size: 11, weight: "600" }, color: "#475569" },
      },
      tooltip: {
        backgroundColor: "#0f172a",
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
        ticks: { font: { size: 11 }, color: "#94a3b8" },
        beginAtZero: true,
      },
    },
  };

  return (
    <GraphCard>
      <HeaderArea>
        <div className="title-group">
          <h2>📊 Daily Attendance Pulse</h2>
          <p>Classroom attendance and punctuality ratios</p>
        </div>
        {hasRecords && (
          <AttendanceRateBadge>{attendancePct}% Attendance Rate</AttendanceRateBadge>
        )}
      </HeaderArea>

      <MiniKpiRow>
        <KpiPill $bg="#ecfdf5" $border="#a7f3d0" $labelColor="#065f46" $valColor="#047857">
          <span className="label">Present Count</span>
          <span className="val">{totalPresent}</span>
        </KpiPill>

        <KpiPill $bg="#fff1f2" $border="#fecdd3" $labelColor="#9f1239" $valColor="#e11d48">
          <span className="label">Absent Count</span>
          <span className="val">{totalAbsent}</span>
        </KpiPill>

        <KpiPill $bg="#f8fafc" $border="#e2e8f0" $labelColor="#475569" $valColor="#1e293b">
          <span className="label">Attendance Status</span>
          <span className="val">{total > 0 ? `${attendancePct}%` : "No Records"}</span>
        </KpiPill>
      </MiniKpiRow>

      <ChartContainer>
        {loading ? (
          <EmptyNotice>
            <div className="icon">⏳</div>
            <div>Loading genuine attendance records...</div>
          </EmptyNotice>
        ) : error ? (
          <EmptyNotice style={{ color: "#e11d48" }}>
            <div className="icon">⚠️</div>
            <div>{error}</div>
          </EmptyNotice>
        ) : hasRecords && chartData ? (
          <Bar data={chartData} options={options} />
        ) : (
          <EmptyNotice>
            <div className="icon">📋</div>
            <div>No attendance records available for this period.</div>
          </EmptyNotice>
        )}
      </ChartContainer>
    </GraphCard>
  );
};

export default AttendanceGraph;
