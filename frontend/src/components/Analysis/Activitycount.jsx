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

const VelocityBadge = styled.div`
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
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
`;

const ActivityGraph = () => {
  const [activityCounts, setActivityCounts] = useState({
    events: 0,
    assignments: 0,
    announcements: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [eventsRes, assignmentsRes, announcementsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}api/v1/events/count`),
          axios.get(`${BACKEND_URL}api/v1/assignments/count`),
          axios.get(`${BACKEND_URL}api/v1/announcements/count`),
        ]);

        setActivityCounts({
          events: eventsRes.data.count || 0,
          assignments: assignmentsRes.data.count || 0,
          announcements: announcementsRes.data.count || 0,
        });
      } catch (error) {
        console.error("Error fetching activity counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const totalActivities =
    activityCounts.events + activityCounts.assignments + activityCounts.announcements;

  const data = {
    labels: ["Campus Events", "Course Assignments", "Broadcast Notices"],
    datasets: [
      {
        label: "Total Posted",
        data: [
          activityCounts.events,
          activityCounts.assignments,
          activityCounts.announcements,
        ],
        backgroundColor: [
          "rgba(139, 92, 246, 0.85)", // Violet
          "rgba(236, 72, 153, 0.85)", // Pink
          "rgba(59, 130, 246, 0.85)", // Blue
        ],
        hoverBackgroundColor: [
          "rgba(139, 92, 246, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(59, 130, 246, 1)",
        ],
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 36,
      },
    ],
  };

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
        ticks: { font: { size: 12, weight: "600" }, color: "#475569" },
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
          <h2>⚡ Institutional Operations Velocity</h2>
          <p>Total published assignments, circulars, and scheduled events</p>
        </div>
        <VelocityBadge>{totalActivities} Total Items</VelocityBadge>
      </HeaderArea>

      <MiniKpiRow>
        <KpiPill $bg="#f5f3ff" $border="#ddd6fe" $labelColor="#6d28d9" $valColor="#7c3aed">
          <span className="label">Events</span>
          <span className="val">{activityCounts.events}</span>
        </KpiPill>

        <KpiPill $bg="#fdf2f8" $border="#fbcfe8" $labelColor="#be185d" $valColor="#db2777">
          <span className="label">Assignments</span>
          <span className="val">{activityCounts.assignments}</span>
        </KpiPill>

        <KpiPill $bg="#eff6ff" $border="#bfdbfe" $labelColor="#1d4ed8" $valColor="#2563eb">
          <span className="label">Notices</span>
          <span className="val">{activityCounts.announcements}</span>
        </KpiPill>
      </MiniKpiRow>

      <ChartContainer>
        <Bar data={data} options={options} />
      </ChartContainer>
    </GraphCard>
  );
};

export default ActivityGraph;
