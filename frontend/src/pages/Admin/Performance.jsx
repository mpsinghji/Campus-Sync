import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./Sidebar";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";
import {
  BsAward,
  BsGraphUp,
  BsBuilding,
  BsPrinter,
  BsTrophyFill,
  BsPeople,
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
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      margin-bottom: 3px;
    }
    .lbl {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
    }
    .sub {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;

    h3 {
      font-size: 16px;
      font-weight: 700;
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
  gap: 16px;

  .dept-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .row-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .name {
        font-size: 14px;
        font-weight: 600;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  color: #64748b;

  .icon {
    font-size: 40px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 18px;
    color: #1e293b;
    margin: 0 0 6px 0;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
`;

const AdminPerformance = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}api/v1/results/analytics`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error("Error loading performance analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const totalResults = analytics?.totalResultsCount || 0;
  const deptAverages = analytics?.departmentAverages || [];
  const toppers = analytics?.toppers || [];

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

          {totalResults > 0 && (
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
          )}
        </Header>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading institutional academic performance analytics...
          </div>
        ) : totalResults === 0 ? (
          <EmptyState>
            <div className="icon">📊</div>
            <h3>No academic performance records are available yet.</h3>
            <p>Institutional department metrics and student leaderboards will populate once exam marks are evaluated.</p>
          </EmptyState>
        ) : (
          <>
            {/* Metrics Overview */}
            <MetricsGrid>
              <MetricCard $bg="#ecfdf5" $color="#059669">
                <div className="icon-wrap">
                  <BsPeople />
                </div>
                <div className="details">
                  <div className="val">{totalResults}</div>
                  <div className="lbl">Total Evaluated Records</div>
                  <div className="sub">MongoDB Academic Results</div>
                </div>
              </MetricCard>

              <MetricCard $bg="#eff6ff" $color="#2563eb">
                <div className="icon-wrap">
                  <BsAward />
                </div>
                <div className="details">
                  <div className="val">{analytics?.overallAveragePercentage || 0}%</div>
                  <div className="lbl">Institutional Mean Score</div>
                  <div className="sub">Aggregated Marks Average</div>
                </div>
              </MetricCard>

              <MetricCard $bg="#fef3c7" $color="#d97706">
                <div className="icon-wrap">
                  <BsTrophyFill />
                </div>
                <div className="details">
                  <div className="val">{toppers[0]?.gpa || "N/A"}</div>
                  <div className="lbl">Top Student CGPA</div>
                  <div className="sub">{toppers[0]?.name || "N/A"}</div>
                </div>
              </MetricCard>

              <MetricCard $bg="#f5f3ff" $color="#7c3aed">
                <div className="icon-wrap">
                  <BsBuilding />
                </div>
                <div className="details">
                  <div className="val">{deptAverages.length}</div>
                  <div className="lbl">Active Departments</div>
                  <div className="sub">Evaluated in Examinations</div>
                </div>
              </MetricCard>
            </MetricsGrid>

            <MainGrid>
              {/* Genuine Department Breakdown */}
              <Card>
                <div className="card-header">
                  <h3>
                    <BsBuilding /> Department Performance Index
                  </h3>
                </div>

                <DeptList>
                  {deptAverages.map((dept, i) => (
                    <div key={i} className="dept-item">
                      <div className="row-top">
                        <span className="name">{dept.department}</span>
                        <span className="gpa-score">{dept.averagePercentage}% Avg</span>
                      </div>
                      <div className="bar-bg">
                        <div
                          className="fill"
                          style={{ width: `${dept.averagePercentage}%` }}
                        />
                      </div>
                      <div className="row-btm">
                        <span>{dept.totalStudentsTested} Evaluated Records</span>
                        <span>Mean GPA: {dept.averageGpa}</span>
                      </div>
                    </div>
                  ))}
                </DeptList>
              </Card>

              {/* Genuine Academic Toppers Leaderboard */}
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
                      <th>CGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toppers.map((s, idx) => (
                      <tr key={s.rollno || idx}>
                        <td>
                          <span
                            className={`rank-badge ${
                              idx === 0
                                ? "rank-1"
                                : idx === 1
                                ? "rank-2"
                                : idx === 2
                                ? "rank-3"
                                : ""
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td>
                          <strong>{s.name}</strong>
                        </td>
                        <td>
                          <code>{s.rollno}</code>
                        </td>
                        <td>{s.department}</td>
                        <td>
                          <span style={{ color: "#059669", fontWeight: 800 }}>
                            {s.gpa}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </LeaderboardTable>
              </Card>
            </MainGrid>
          </>
        )}
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default AdminPerformance;