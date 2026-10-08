import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";
import { BACKEND_URL } from "../../constants/url";
import { formatDateDDMMYYYY } from "../../utils/dateUtils";
import {
  BsBook,
  BsClock,
  BsSearch,
  BsCheckCircle,
  BsUpload,
  BsFileEarmarkText,
  BsCalendarCheck,
  BsExclamationCircle,
  BsAward,
  BsPerson,
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
  margin-bottom: 26px;
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
  display: flex;
  align-items: center;
  gap: 14px;

  .icon-box {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${(props) => props.$bg || "#ecfdf5"};
    color: ${(props) => props.$color || "#059669"};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
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
  }
`;

const Toolbar = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 18px;
  margin-bottom: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;

  .tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    button {
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s;

      &.active {
        background: #0f766e;
        color: white;
      }

      &:not(.active) {
        background: #f1f5f9;
        color: #475569;
        &:hover {
          background: #e2e8f0;
        }
      }
    }
  }

  .search {
    position: relative;
    min-width: 250px;

    input {
      width: 100%;
      padding: 9px 12px 9px 34px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;

      &:focus {
        border-color: #0f766e;
        box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
      }
    }

    svg {
      position: absolute;
      left: 11px;
      top: 11px;
      color: #94a3b8;
    }
  }
`;

const AssignmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 22px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
    border-color: #0f766e;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;

    .badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      span.sub-badge {
        background: #eff6ff;
        color: #1e40af;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
      }

      span.dept-badge {
        background: #ecfdf5;
        color: #065f46;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
      }
    }

    .due-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 20px;
      white-space: nowrap;
      background: ${(props) => (props.$isUrgent ? "#fee2e2" : "#fef3c7")};
      color: ${(props) => (props.$isUrgent ? "#dc2626" : "#92400e")};
      border: 1px solid ${(props) => (props.$isUrgent ? "#fca5a5" : "#fde68a")};
    }
  }

  h3 {
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    line-height: 1.35;
  }

  p.desc {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta-footer {
    border-top: 1px solid #f1f5f9;
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #64748b;

    .author {
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: 600;
      color: #475569;
    }

    .actions {
      display: flex;
      gap: 8px;

      button {
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.15s;
      }

      button.submit-btn {
        background: #0f766e;
        color: white;
        border: none;
        &:hover {
          background: #0d655e;
        }
      }
    }
  }
`;

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      let student = {};
      const studentCookie = Cookies.get("studentData");
      if (studentCookie) {
        try {
          student = JSON.parse(studentCookie);
        } catch (e) {}
      }
      const queryParams = new URLSearchParams({
        batch: student.batch || "",
        department: student.department || "",
        section: student.section || "",
        semester: student.semester || "",
        studentEmail: student.email || "",
        studentRollno: student.rollno || "",
      });
      const response = await axios.get(
        `${BACKEND_URL}api/v1/assignments/getall?${queryParams.toString()}`
      );
      setAssignments((response.data.assignments || []).reverse());
    } catch (error) {
      toast.error("Error fetching assignments");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.subject?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeTab === "urgent") {
        if (!item.dueDate) return false;
        const diffDays = Math.ceil(
          (new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return diffDays >= 0 && diffDays <= 7;
      }

      return true;
    });
  }, [assignments, searchQuery, activeTab]);

  const urgentCount = useMemo(() => {
    return assignments.filter((a) => {
      if (!a.dueDate) return false;
      const diff = Math.ceil(
        (new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return diff >= 0 && diff <= 7;
    }).length;
  }, [assignments]);

  const getDueLabel = (d) => {
    if (!d) return "No Deadline";
    const diff = Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Past Due";
    if (diff === 0) return "Due Today!";
    if (diff === 1) return "Due Tomorrow";
    return `Due in ${diff}d`;
  };

  return (
    <Container>
      <Sidebar />
      <Content>
        <Header>
          <div className="title-group">
            <h1>
              <BsBook style={{ color: "#0f766e" }} /> Coursework & Assignments
            </h1>
            <p>Track academic homework, problem sets and laboratory reports</p>
          </div>
        </Header>

        {/* Top Metric Tiles */}
        <StatsGrid>
          <StatCard $bg="#ecfdf5" $color="#059669">
            <div className="icon-box">
              <BsCalendarCheck />
            </div>
            <div className="details">
              <div className="val">{assignments.length}</div>
              <div className="lbl">Active Assignments</div>
            </div>
          </StatCard>

          <StatCard $bg="#fff1f2" $color="#e11d48">
            <div className="icon-box">
              <BsClock />
            </div>
            <div className="details">
              <div className="val">{urgentCount} Due Soon</div>
              <div className="lbl">Within 7 Days</div>
            </div>
          </StatCard>

          <StatCard $bg="#eff6ff" $color="#2563eb">
            <div className="icon-box">
              <BsCheckCircle />
            </div>
            <div className="details">
              <div className="val">Submitted</div>
              <div className="lbl">92% Compliance</div>
            </div>
          </StatCard>

          <StatCard $bg="#f5f3ff" $color="#7c3aed">
            <div className="icon-box">
              <BsAward />
            </div>
            <div className="details">
              <div className="val">Grade Impact</div>
              <div className="lbl">30% Internal Marks</div>
            </div>
          </StatCard>
        </StatsGrid>

        <Toolbar>
          <div className="tabs">
            <button
              className={activeTab === "all" ? "active" : ""}
              onClick={() => setActiveTab("all")}
            >
              All Coursework ({assignments.length})
            </button>
            <button
              className={activeTab === "urgent" ? "active" : ""}
              onClick={() => setActiveTab("urgent")}
            >
              ⏰ Due Soon ({urgentCount})
            </button>
          </div>

          <div className="search">
            <BsSearch />
            <input
              type="text"
              placeholder="Search by topic, subject or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </Toolbar>

        {loading ? (
          <p style={{ color: "#64748b", padding: "30px 0" }}>Loading assignments...</p>
        ) : filteredAssignments.length > 0 ? (
          <AssignmentsGrid>
            {filteredAssignments.map((assignment) => {
              const diffDays = assignment.dueDate
                ? Math.ceil(
                    (new Date(assignment.dueDate) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 99;
              const isUrgent = diffDays >= 0 && diffDays <= 4;

              return (
                <Card key={assignment._id} $isUrgent={isUrgent}>
                  <div>
                    <div className="card-top">
                      <div className="badges-row">
                        <span className="sub-badge">
                          📚 {assignment.subject || "General"}
                        </span>
                        <span className="dept-badge">
                          🏛️ {assignment.department || "Academic"}
                        </span>
                      </div>
                      <span className="due-pill">
                        {getDueLabel(assignment.dueDate)}
                      </span>
                    </div>

                    <h3 style={{ marginTop: "10px" }}>{assignment.title}</h3>
                    <p className="desc">{assignment.description}</p>
                    {assignment.dueDate && (
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px", fontWeight: 500 }}>
                        📅 Due Date: {formatDateDDMMYYYY(assignment.dueDate)}
                      </div>
                    )}
                  </div>

                  <div className="meta-footer">
                    <div className="author">
                      <BsPerson />
                      <span>{assignment.teacherName || "Faculty Instructor"}</span>
                    </div>

                    <div className="actions">
                      <button
                        className="submit-btn"
                        onClick={() =>
                          toast.success(`Solution portal opened for: "${assignment.title}"`, {
                            autoClose: 2000,
                          })
                        }
                      >
                        <BsUpload /> Submit Work
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </AssignmentsGrid>
        ) : (
          <div
            style={{
              background: "#ffffff",
              padding: "40px",
              borderRadius: "14px",
              textAlign: "center",
              color: "#64748b",
              border: "1px dashed #cbd5e1",
            }}
          >
            ✓ No assignments matching current filter criteria.
          </div>
        )}
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default StudentAssignments;