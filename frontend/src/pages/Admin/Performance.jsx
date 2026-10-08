import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AdminSidebar from "./Sidebar";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";
import {
  BsAward,
  BsGraphUp,
  BsSearch,
  BsMortarboard,
  BsBuilding,
  BsCheckCircleFill,
  BsPrinter,
  BsTrophyFill,
  BsPeople,
  BsBarChart,
} from "react-icons/bs";

const Container = styled.div`
  display: flex;
  padding-left: 250px;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;

  @media screen and (max-width: 900px) {
    padding-left: 0;
    flex-direction: column;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 30px 36px;
  width: 100%;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .title-group {
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
      letter-spacing: -0.4px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 26px;
`;

const MetricCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
  display: flex;
  align-items: center;
  gap: 14px;

  .icon-wrap {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    background: ${(props) => props.$bg || "#ecfdf5"};
    color: ${(props) => props.$color || "#059669"};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .details {
    .val {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .lbl {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .sub {
      font-size: 11px;
      color: #94a3b8;
    }
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1.8fr;
  gap: 24px;
  margin-bottom: 24px;

  @media screen and (max-width: 1150px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 22px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;

    h3 {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
`;

const DeptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  .dept-item {
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 10px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .row-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .name {
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
      }
      .gpa-score {
        font-size: 14px;
        font-weight: 800;
        color: #059669;
      }
    }

    .bar-bg {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;

      .fill {
        height: 100%;
        background: linear-gradient(90deg, #059669 0%, #10b981 100%);
        border-radius: 4px;
      }
    }

    .row-btm {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
    }
  }
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    text-align: left;
    padding: 10px 12px;
    border-bottom: 2px solid #e2e8f0;
    font-size: 12px;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  tr:hover td {
    background: #f8fafc;
  }

  .rank-badge {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
  }

  .rank-1 {
    background: #fef3c7;
    color: #92400e;
  }
  .rank-2 {
    background: #f1f5f9;
    color: #475569;
  }
  .rank-3 {
    background: #ffedd5;
    color: #9a3412;
  }
`;

const AdminPerformance = () => {
  const departments = [
    { name: "Computer Science", avgCgpa: 8.65, passRate: "98.2%", students: 31 },
    { name: "Information Technology", avgCgpa: 8.52, passRate: "97.4%", students: 28 },
    { name: "Electronics", avgCgpa: 8.35, passRate: "95.6%", students: 27 },
    { name: "Mechanical", avgCgpa: 8.18, passRate: "94.2%", students: 26 },
    { name: "Civil", avgCgpa: 8.24, passRate: "95.0%", students: 27 },
  ];

  const topStudents = [
    { rank: 1, name: "Priya Sharma", roll: "CS2023001", dept: "Computer Science", cgpa: 9.85, batch: "Batch 2023" },
    { rank: 2, name: "Arjun Verma", roll: "IT2023004", dept: "Information Technology", cgpa: 9.72, batch: "Batch 2023" },
    { rank: 3, name: "Neha Singh", roll: "EC2022002", dept: "Electronics", cgpa: 9.64, batch: "Batch 2022" },
    { rank: 4, name: "Vikram Nair", roll: "CS2024008", dept: "Computer Science", cgpa: 9.58, batch: "Batch 2024" },
    { rank: 5, name: "Simran Gupta", roll: "CV2023012", dept: "Civil", cgpa: 9.52, batch: "Batch 2023" },
    { rank: 6, name: "Rohan Joshi", roll: "ME2022015", dept: "Mechanical", cgpa: 9.46, batch: "Batch 2022" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container>
      <AdminSidebar />
      <Content>
        <Header>
          <div className="title-group">
            <h1>
              <BsAward style={{ color: "#0f766e" }} /> Institutional Examination & Academic Performance
            </h1>
            <p>Comprehensive analytics across departments, batches, CGPA distributions and toppers</p>
          </div>

          <button
            onClick={handlePrint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              color: "#334155",
            }}
          >
            <BsPrinter /> Export Analysis
          </button>
        </Header>

        {/* Metrics Overview */}
        <MetricsGrid>
          <MetricCard $bg="#ecfdf5" $color="#059669">
            <div className="icon-wrap">
              <BsPeople />
            </div>
            <div className="details">
              <div className="val">139</div>
              <div className="lbl">Total Students Evaluated</div>
              <div className="sub">5 Departments • 3 Batches</div>
            </div>
          </MetricCard>

          <MetricCard $bg="#eff6ff" $color="#2563eb">
            <div className="icon-wrap">
              <BsAward />
            </div>
            <div className="details">
              <div className="val">8.42</div>
              <div className="lbl">Institutional Mean CGPA</div>
              <div className="sub">+0.18 from last semester</div>
            </div>
          </MetricCard>

          <MetricCard $bg="#fef3c7" $color="#d97706">
            <div className="icon-wrap">
              <BsCheckCircleFill />
            </div>
            <div className="details">
              <div className="val">96.1%</div>
              <div className="lbl">Overall Pass Percentage</div>
              <div className="sub">133 Passed • 6 Backlogs</div>
            </div>
          </MetricCard>

          <MetricCard $bg="#f5f3ff" $color="#7c3aed">
            <div className="icon-wrap">
              <BsTrophyFill />
            </div>
            <div className="details">
              <div className="val">42%</div>
              <div className="lbl">Distinction Holders</div>
              <div className="sub">CGPA 8.5 and above</div>
            </div>
          </MetricCard>
        </MetricsGrid>

        <MainGrid>
          {/* Department Breakdown */}
          <Card>
            <div className="card-header">
              <h3>
                <BsBuilding /> Department Performance Index
              </h3>
            </div>

            <DeptList>
              {departments.map((dept, i) => (
                <div key={i} className="dept-item">
                  <div className="row-top">
                    <span className="name">{dept.name}</span>
                    <span className="gpa-score">{dept.avgCgpa} CGPA</span>
                  </div>
                  <div className="bar-bg">
                    <div
                      className="fill"
                      style={{ width: `${(dept.avgCgpa / 10) * 100}%` }}
                    />
                  </div>
                  <div className="row-btm">
                    <span>{dept.students} Active Students</span>
                    <span>Pass Rate: {dept.passRate}</span>
                  </div>
                </div>
              ))}
            </DeptList>
          </Card>

          {/* Academic Toppers Leaderboard */}
          <Card>
            <div className="card-header">
              <h3>
                <BsTrophyFill style={{ color: "#d97706" }} /> Top Academic Performers Leaderboard
              </h3>
            </div>

            <LeaderboardTable>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Department</th>
                  <th>Batch</th>
                  <th>CGPA</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((s) => (
                  <tr key={s.rank}>
                    <td>
                      <span
                        className={`rank-badge ${
                          s.rank === 1
                            ? "rank-1"
                            : s.rank === 2
                            ? "rank-2"
                            : s.rank === 3
                            ? "rank-3"
                            : ""
                        }`}
                      >
                        {s.rank}
                      </span>
                    </td>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>
                      <code>{s.roll}</code>
                    </td>
                    <td>{s.dept}</td>
                    <td>{s.batch}</td>
                    <td>
                      <span style={{ color: "#059669", fontWeight: 800 }}>
                        {s.cgpa}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </LeaderboardTable>
          </Card>
        </MainGrid>
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default AdminPerformance;