import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import {
  BsAward,
  BsGraphUp,
  BsCheckCircleFill,
  BsPrinter,
  BsStarFill,
  BsBook,
  BsMortarboard,
  BsHourglassSplit,
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
      line-height: 1.2;
    }
    .lbl {
      font-size: 12px;
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
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media screen and (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge {
      background: #eff6ff;
      color: #1e40af;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
  }
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    text-align: left;
    padding: 10px 14px;
    border-bottom: 2px solid #e2e8f0;
    font-size: 12px;
  }

  td {
    padding: 12px 14px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  tr:hover td {
    background: #f8fafc;
  }

  .grade-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 800;
    font-size: 11px;
    background: #ecfdf5;
    color: #065f46;
  }

  .grade-badge.a-plus {
    background: #dbeafe;
    color: #1e40af;
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
      width: 60px;
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

const StudentPerformanceSection = () => {
  const [studentInfo, setStudentInfo] = useState({
    name: "Student",
    department: "Computer Science",
    batch: "Batch 2023",
  });

  useEffect(() => {
    const cookie = Cookies.get("studentData");
    if (cookie) {
      try {
        const parsed = JSON.parse(cookie);
        setStudentInfo({
          name: parsed.name || "Student",
          department: parsed.department || "Computer Science",
          batch: parsed.batch || "Batch 2023",
        });
      } catch (e) {}
    }
  }, []);

  const semesterResults = [
    {
      code: "CS301",
      subject: "Data Structures & Algorithms",
      credits: 4,
      internal: 28,
      external: 64,
      total: 92,
      grade: "A+",
      point: 10,
    },
    {
      code: "CS302",
      subject: "Operating Systems",
      credits: 4,
      internal: 26,
      external: 61,
      total: 87,
      grade: "A",
      point: 9,
    },
    {
      code: "CS303",
      subject: "Database Management Systems",
      credits: 4,
      internal: 29,
      external: 63,
      total: 92,
      grade: "A+",
      point: 10,
    },
    {
      code: "CS304",
      subject: "Computer Networks",
      credits: 3,
      internal: 25,
      external: 58,
      total: 83,
      grade: "A",
      point: 9,
    },
    {
      code: "CS305",
      subject: "Web Technologies Lab",
      credits: 2,
      internal: 48,
      external: 47,
      total: 95,
      grade: "O",
      point: 10,
    },
    {
      code: "CS306",
      subject: "Discrete Mathematics",
      credits: 3,
      internal: 24,
      external: 55,
      total: 79,
      grade: "B+",
      point: 8,
    },
  ];

  const trends = [
    { sem: "Sem 1", gpa: 8.2 },
    { sem: "Sem 2", gpa: 8.4 },
    { sem: "Sem 3", gpa: 8.75 },
    { sem: "Sem 4", gpa: 8.9 },
    { sem: "Sem 5", gpa: 9.15 },
  ];

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
        </Header>

        {/* Overview Tiles */}
        <OverviewGrid>
          <OverviewCard $bg="#ecfdf5" $color="#059669">
            <div className="icon-wrap">
              <BsAward />
            </div>
            <div className="details">
              <div className="val">8.84</div>
              <div className="lbl">Cumulative CGPA</div>
              <div className="sub">First Class with Distinction</div>
            </div>
          </OverviewCard>

          <OverviewCard $bg="#eff6ff" $color="#2563eb">
            <div className="icon-wrap">
              <BsGraphUp />
            </div>
            <div className="details">
              <div className="val">9.15</div>
              <div className="lbl">Current Semester SGPA</div>
              <div className="sub">Semester 5 Examination</div>
            </div>
          </OverviewCard>

          <OverviewCard $bg="#fef3c7" $color="#d97706">
            <div className="icon-wrap">
              <BsStarFill />
            </div>
            <div className="details">
              <div className="val">Rank #4</div>
              <div className="lbl">Department Standing</div>
              <div className="sub">Top 5% of cohort</div>
            </div>
          </OverviewCard>

          <OverviewCard $bg="#f5f3ff" $color="#7c3aed">
            <div className="icon-wrap">
              <BsBook />
            </div>
            <div className="details">
              <div className="val">102 / 140</div>
              <div className="lbl">Credits Completed</div>
              <div className="sub">73% Degree Progress</div>
            </div>
          </OverviewCard>
        </OverviewGrid>

        <MainGrid>
          {/* Left: Detailed Grade Ledger */}
          <Card>
            <div className="card-header">
              <h3>
                <BsBook /> Semester 5 Course Grades Ledger
              </h3>
              <span className="badge">Verified by Exam Cell</span>
            </div>

            <ResultsTable>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Title</th>
                  <th>Credits</th>
                  <th>Internal</th>
                  <th>External</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {semesterResults.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <code>{r.code}</code>
                    </td>
                    <td>
                      <strong>{r.subject}</strong>
                    </td>
                    <td>{r.credits}</td>
                    <td>{r.internal}/30</td>
                    <td>{r.external}/70</td>
                    <td>{r.total}/100</td>
                    <td>
                      <span className={`grade-badge ${r.grade === "A+" ? "a-plus" : ""}`}>
                        {r.grade}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#059669", fontWeight: 700, fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <BsCheckCircleFill /> PASS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ResultsTable>
          </Card>

          {/* Right: Semester Progress Trend */}
          <Card>
            <div className="card-header">
              <h3>
                <BsGraphUp /> GPA Progression
              </h3>
            </div>

            <TrendBar>
              {trends.map((t, idx) => (
                <div key={idx} className="sem-row">
                  <span className="sem-label">{t.sem}</span>
                  <div className="progress-bar-wrap">
                    <div
                      className="fill"
                      style={{ width: `${(t.gpa / 10) * 100}%` }}
                    />
                  </div>
                  <span className="gpa-val">{t.gpa}</span>
                </div>
              ))}
            </TrendBar>

            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                marginTop: "20px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              🎯 <strong>Academic Advisory:</strong> Consistent upward trend in GPA from Semester 1 through 5. Eligible for placement honors and master’s fast-track.
            </div>
          </Card>
        </MainGrid>
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default StudentPerformanceSection;