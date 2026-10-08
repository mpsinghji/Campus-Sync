import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import styled from "styled-components";
import axios from "axios";
import { BACKEND_URL } from "../../constants/url";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import {
  BsAward,
  BsGraphUp,
  BsCheckCircleFill,
  BsXCircleFill,
  BsPrinter,
  BsStarFill,
  BsBook,
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

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 26px;
`;

const OverviewCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
  display: flex;
  align-items: center;
  gap: 16px;

  .icon-wrap {
    width: 48px;
    height: 48px;
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
      margin-bottom: 4px;
    }
    .lbl {
      font-size: 13px;
      font-weight: 600;
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
  grid-template-columns: 2fr 1fr;
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

    .badge {
      font-size: 12px;
      font-weight: 600;
      background: #eff6ff;
      color: #2563eb;
      padding: 4px 10px;
      border-radius: 20px;
    }
  }
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    text-align: left;
    padding: 10px 12px;
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .grade-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 12px;
    background: #f1f5f9;
    color: #334155;

    &.a-plus,
    &.a {
      background: #ecfdf5;
      color: #059669;
    }
    &.f {
      background: #fee2e2;
      color: #dc2626;
    }
  }
`;

const TrendBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .sem-row {
    display: flex;
    align-items: center;
    gap: 12px;

    .sem-label {
      width: 70px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
    }

    .progress-bar-wrap {
      flex: 1;
      height: 10px;
      background: #f1f5f9;
      border-radius: 6px;
      overflow: hidden;

      .fill {
        height: 100%;
        background: linear-gradient(90deg, #059669 0%, #10b981 100%);
        border-radius: 6px;
      }
    }

    .gpa-val {
      width: 40px;
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      text-align: right;
    }
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

const StudentPerformanceSection = () => {
  const [studentInfo, setStudentInfo] = useState({
    name: "Student",
    department: "Computer Science",
    batch: "General",
  });
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookie = Cookies.get("studentData");
    if (cookie) {
      try {
        const parsed = JSON.parse(cookie);
        setStudentInfo({
          name: parsed.name || "Student",
          department: parsed.department || "Computer Science",
          batch: parsed.batch || "General",
        });
      } catch (e) {}
    }

    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}api/v1/results/my-results`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          setResults(res.data.results || []);
          setSummary(res.data.summary || null);
        }
      } catch (err) {
        console.error("Error loading student results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container>
      <Sidebar />
      <Content>
        <Header>
          <div className="title-group">
            <h1>
              <BsAward style={{ color: "#0f766e" }} /> Academic Results & Performance
            </h1>
            <p>
              Cumulative performance ledger for <strong>{studentInfo.name}</strong> • {studentInfo.department} ({studentInfo.batch})
            </p>
          </div>

          {results.length > 0 && (
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
              <BsPrinter /> Download Grade Sheet
            </button>
          )}
        </Header>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading academic performance records...
          </div>
        ) : results.length === 0 ? (
          <EmptyState>
            <div className="icon">📊</div>
            <h3>No academic performance records are available yet.</h3>
            <p>
              Official examination marks and grade transcripts will be published here once evaluated by the examination cell.
            </p>
          </EmptyState>
        ) : (
          <>
            {/* Overview Tiles with Genuine Aggregations */}
            <OverviewGrid>
              <OverviewCard $bg="#ecfdf5" $color="#059669">
                <div className="icon-wrap">
                  <BsAward />
                </div>
                <div className="details">
                  <div className="val">{summary?.gpa || 0}</div>
                  <div className="lbl">Cumulative CGPA</div>
                  <div className="sub">
                    {summary?.gpa >= 8.5
                      ? "First Class with Distinction"
                      : summary?.gpa >= 6.5
                      ? "First Class"
                      : "Satisfactory Standing"}
                  </div>
                </div>
              </OverviewCard>

              <OverviewCard $bg="#eff6ff" $color="#2563eb">
                <div className="icon-wrap">
                  <BsGraphUp />
                </div>
                <div className="details">
                  <div className="val">{summary?.percentage || 0}%</div>
                  <div className="lbl">Overall Percentage</div>
                  <div className="sub">Aggregated Marks Average</div>
                </div>
              </OverviewCard>

              <OverviewCard $bg="#fef3c7" $color="#d97706">
                <div className="icon-wrap">
                  <BsStarFill />
                </div>
                <div className="details">
                  <div className="val">{summary?.totalSubjects || 0}</div>
                  <div className="lbl">Subjects Evaluated</div>
                  <div className="sub">Examination Records</div>
                </div>
              </OverviewCard>

              <OverviewCard $bg="#f5f3ff" $color="#7c3aed">
                <div className="icon-wrap">
                  <BsBook />
                </div>
                <div className="details">
                  <div className="val">{summary?.totalCredits || 0}</div>
                  <div className="lbl">Total Credits Earned</div>
                  <div className="sub">Academic Credit Ledger</div>
                </div>
              </OverviewCard>
            </OverviewGrid>

            <MainGrid>
              {/* Detailed Genuine Grade Ledger */}
              <Card>
                <div className="card-header">
                  <h3>
                    <BsBook /> Course Grades Ledger
                  </h3>
                  <span className="badge">Verified Records ({results.length})</span>
                </div>

                <ResultsTable>
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Course Title</th>
                      <th>Semester</th>
                      <th>Credits</th>
                      <th>Marks</th>
                      <th>Grade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => {
                      const isPassed = r.grade !== "F";
                      return (
                        <tr key={r._id || r.subjectCode}>
                          <td>
                            <code>{r.subjectCode}</code>
                          </td>
                          <td>
                            <strong>{r.subjectName}</strong>
                          </td>
                          <td>{r.semester || "Semester 1"}</td>
                          <td>{r.credits || 3}</td>
                          <td>
                            {r.marksObtained} / {r.totalMarks || 100}
                          </td>
                          <td>
                            <span
                              className={`grade-badge ${
                                r.grade === "A+" || r.grade === "A"
                                  ? "a-plus"
                                  : r.grade === "F"
                                  ? "f"
                                  : ""
                              }`}
                            >
                              {r.grade || "N/A"}
                            </span>
                          </td>
                          <td>
                            {isPassed ? (
                              <span
                                style={{
                                  color: "#059669",
                                  fontWeight: 700,
                                  fontSize: "12px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <BsCheckCircleFill /> PASS
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "#dc2626",
                                  fontWeight: 700,
                                  fontSize: "12px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <BsXCircleFill /> ARREAR
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </ResultsTable>
              </Card>

              {/* Semester Breakdown / Trend */}
              <Card>
                <div className="card-header">
                  <h3>
                    <BsGraphUp /> Semester SGPA Breakdown
                  </h3>
                </div>

                {summary?.semesterBreakdown && summary.semesterBreakdown.length > 0 ? (
                  <TrendBar>
                    {summary.semesterBreakdown.map((s, idx) => (
                      <div key={idx} className="sem-row">
                        <span className="sem-label">{s.semester}</span>
                        <div className="progress-bar-wrap">
                          <div
                            className="fill"
                            style={{ width: `${Math.min(100, (s.sgpa / 10) * 100)}%` }}
                          />
                        </div>
                        <span className="gpa-val">{s.sgpa}</span>
                      </div>
                    ))}
                  </TrendBar>
                ) : (
                  <div style={{ color: "#94a3b8", fontSize: "13px", padding: "20px 0" }}>
                    No semester trend data available.
                  </div>
                )}
              </Card>
            </MainGrid>
          </>
        )}
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default StudentPerformanceSection;