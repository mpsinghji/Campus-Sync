import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../../constants/url";
import { formatDateTimeDDMMYYYY } from "../../utils/dateUtils";

const Container = styled.div`
  display: flex;
  padding-left: 240px;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: "Inter", "Segoe UI", sans-serif;

  @media screen and (max-width: 768px) {
    padding-left: 0;
    flex-direction: column;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 6px 0;
  }

  p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 28px;
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  input,
  select,
  textarea {
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #1abc9c;
      box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.15);
    }
  }
`;

const SubmitButton = styled.button`
  background: #1abc9c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 11px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #16a085;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const AnnouncementCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  margin-bottom: 16px;

  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .title {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
  }

  .body {
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    font-size: 12px;
    color: #94a3b8;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => props.$bg || "#e0f2fe"};
  color: ${(props) => props.$color || "#0369a1"};
`;

const CheckAnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    category: "Academic",
    targetAudience: "students",
    targetBatch: "Batch 2024",
    announcement: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchAnnouncements = async () => {
    try {
      let email = "";
      const teacherCookie = Cookies.get("teacherData");
      if (teacherCookie) {
        try {
          email = JSON.parse(teacherCookie)?.email || "";
        } catch (e) {}
      }

      const res = await axios.get(
        `${BACKEND_URL}api/v1/announcements/getall?role=teacher&email=${encodeURIComponent(email)}`
      );
      if (res.data?.announcements) {
        const sorted = [...res.data.announcements].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setAnnouncements(sorted);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.announcement.trim()) {
      toast.error("Announcement content cannot be empty.");
      return;
    }

    setSubmitting(true);
    try {
      const teacherCookie = Cookies.get("teacherData");
      const authorName = teacherCookie ? JSON.parse(teacherCookie)?.name || "Faculty Member" : "Faculty Member";

      const res = await axios.post(`${BACKEND_URL}api/v1/announcements`, {
        ...formData,
        createdBy: authorName,
      });

      if (res.data?.success) {
        toast.success("Announcement broadcast successfully!");
        setFormData({
          title: "",
          category: "Academic",
          targetAudience: "students",
          targetBatch: "Batch 2024",
          announcement: "",
        });
        fetchAnnouncements();
      }
    } catch (error) {
      toast.error("Error sending announcement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Sidebar />
      <Content>
        <Header>
          <h1>Faculty Announcements & Circulars</h1>
          <p>Broadcast updates to your students or review official institutional notices</p>
        </Header>

        {/* POST ANNOUNCEMENT */}
        <Card>
          <CardTitle>📢 Issue Class / Batch Notice</CardTitle>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <label>Notice Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Lab Assignment Submission Deadline"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Target Audience</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                >
                  <option value="students">All Students</option>
                  <option value="batch">Specific Batch</option>
                  <option value="all">Entire Campus</option>
                </select>
              </FormGroup>

              {formData.targetAudience === "batch" && (
                <FormGroup>
                  <label>Select Batch</label>
                  <select
                    value={formData.targetBatch}
                    onChange={(e) => setFormData({ ...formData, targetBatch: e.target.value })}
                  >
                    <option value="Batch 2024">Batch 2024</option>
                    <option value="Batch 2025">Batch 2025</option>
                    <option value="Batch 2023">Batch 2023</option>
                  </select>
                </FormGroup>
              )}
            </FormGrid>

            <FormGroup style={{ marginBottom: "16px" }}>
              <label>Announcement Details</label>
              <textarea
                rows={3}
                placeholder="Enter assignment notice, schedule alert, or classroom instructions..."
                value={formData.announcement}
                onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
                required
              />
            </FormGroup>

            <SubmitButton type="submit" disabled={submitting}>
              {submitting ? "Broadcasting..." : "🚀 Broadcast to Students"}
            </SubmitButton>
          </form>
        </Card>

        {/* ANNOUNCEMENT FEED */}
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "16px" }}>
          Notice Board ({announcements.length})
        </h2>

        {announcements.map((item) => (
          <AnnouncementCard key={item._id}>
            <div className="meta">
              <Badge $bg="#f1f5f9" $color="#475569">
                📁 {item.category || "Notice"}
              </Badge>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                {item.createdAt ? formatDateTimeDDMMYYYY(item.createdAt) : "Recent"}
              </span>
            </div>

            <div className="title">{item.title || "Campus Notice"}</div>
            <div className="body">
              {(() => {
                const text = item.announcement || "";
                const isLong = text.length > 120;
                const isExpanded = expandedIds.has(item._id);
                const display = isLong && !isExpanded ? text.slice(0, 120) + "..." : text;
                return (
                  <>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>{display}</p>
                    {isLong && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(item._id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563eb",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: "6px 0 0 0",
                          display: "inline-block",
                          textDecoration: "underline",
                        }}
                      >
                        {isExpanded ? "▴ Show Short Summary" : "▾ Read Full Notice"}
                      </button>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="footer">
              <span>Author: {item.createdBy || "Administrator"}</span>
              <span>Target: {item.targetAudience === "batch" ? item.targetBatch : item.targetAudience}</span>
            </div>
          </AnnouncementCard>
        ))}
      </Content>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default CheckAnnouncementSection;
