import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styled from 'styled-components';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

const TotalBadge = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
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
`;

const UserAnalysis = ({ totalStudents = 0, totalTeachers = 0, totalAdmins = 0 }) => {
  const totalUsers = totalStudents + totalTeachers + totalAdmins;

  const data = {
    labels: ['Enrolled Students', 'Faculty / Teachers', 'Administrators'],
    datasets: [
      {
        label: 'Active Accounts',
        data: [totalStudents, totalTeachers, totalAdmins],
        backgroundColor: [
          'rgba(16, 185, 129, 0.85)', // Emerald
          'rgba(14, 165, 233, 0.85)', // Sky
          'rgba(245, 158, 11, 0.85)', // Amber
        ],
        hoverBackgroundColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(245, 158, 11, 1)',
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
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const count = context.raw || 0;
            const pct = totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : 0;
            return ` ${count} members (${pct}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: '600' }, color: '#475569' },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 }, color: '#94a3b8', stepSize: 1 },
        beginAtZero: true,
      },
    },
  };

  return (
    <GraphCard>
      <HeaderArea>
        <div className="title-group">
          <h2>👥 Campus Demographics</h2>
          <p>Distribution of active accounts across all user hierarchies</p>
        </div>
        <TotalBadge>{totalUsers} Total Members</TotalBadge>
      </HeaderArea>

      <MiniKpiRow>
        <KpiPill $bg="#ecfdf5" $border="#a7f3d0" $labelColor="#065f46" $valColor="#047857">
          <span className="label">Students</span>
          <span className="val">{totalStudents}</span>
        </KpiPill>

        <KpiPill $bg="#f0f9ff" $border="#bae6fd" $labelColor="#075985" $valColor="#0284c7">
          <span className="label">Faculty</span>
          <span className="val">{totalTeachers}</span>
        </KpiPill>

        <KpiPill $bg="#fffbeb" $border="#fde68a" $labelColor="#92400e" $valColor="#d97706">
          <span className="label">Admins</span>
          <span className="val">{totalAdmins}</span>
        </KpiPill>
      </MiniKpiRow>

      <ChartContainer>
        <Bar data={data} options={options} />
      </ChartContainer>
    </GraphCard>
  );
};

export default UserAnalysis;
