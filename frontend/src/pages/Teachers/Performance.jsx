import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import styled from "styled-components";
import axios from "axios";
import { BACKEND_URL } from "../../constants/url";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const PerformanceContainer = styled.div`
  display: flex;
  padding-left: 250px;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media screen and (max-width: 768px) {
    padding-left: 0;
    flex-direction: column;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Header = styled.div`
  margin-bottom: 24px;
  h1 {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 6px 0;
  }
  p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const MetricCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  .label {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .value {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
  }
`;

const TableCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  .table-title {
    padding: 16px 20px;
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    text-align: left;
    padding: 12px 16px;
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  tr:last-child td {
    border-bottom: none;
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

const CheckPerformanceSection = () => {
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resultsRes, analyticsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}api/v1/results`, { withCredentials: true }),
          axios.get(`${BACKEND_URL}api/v1/results/analytics`, { withCredentials: true }),
        ]);

        if (resultsRes.data?.success) {
          setResults(resultsRes.data.results || []);
        }
        if (analyticsRes.data?.success) {
          setAnalytics(analyticsRes.data);
        }
      } catch (err) {
        console.error("Error loading performance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <PerformanceContainer>
        <Sidebar />
        <Content>
          <Header>
            <h1>Academic Performance & Evaluations</h1>
            <p>Faculty oversight of student examination results and departmental score analytics.</p>
          </Header>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              Loading academic evaluation data...
            </div>
          ) : results.length === 0 ? (
            <EmptyState>
              <div className="icon">📈</div>
              <h3>No academic performance records are available yet.</h3>
              <p>Evaluated student examination records will appear here once entered and submitted.</p>
            </EmptyState>
          ) : (
            <>
              <MetricsGrid>
                <MetricCard>
                  <div className="label">Evaluated Records</div>
                  <div className="value">{results.length}</div>
                </MetricCard>
                <MetricCard>
                  <div className="label">Overall Score Average</div>
                  <div className="value">{analytics?.overallAveragePercentage || 0}%</div>
                </MetricCard>
                <MetricCard>
                  <div className="label">Top Performer GPA</div>
                  <div className="value">{analytics?.toppers?.[0]?.gpa || "N/A"}</div>
                </MetricCard>
              </MetricsGrid>

              <TableCard>
                <div className="table-title">Individual Student Evaluation Records</div>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Subject</th>
                      <th>Semester</th>
                      <th>Marks</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r._id}>
                        <td><code>{r.studentRollno}</code></td>
                        <td><strong>{r.studentName}</strong></td>
                        <td>{r.subjectName} ({r.subjectCode})</td>
                        <td>{r.semester}</td>
                        <td>{r.marksObtained} / {r.totalMarks}</td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: r.grade === "F" ? "#dc2626" : "#059669",
                            }}
                          >
                            {r.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </TableCard>
            </>
          )}
        </Content>
      </PerformanceContainer>
      <ToastContainer />
    </>
  );
};

export default CheckPerformanceSection;
