import React, { useState, useEffect, useMemo } from "react";
import AdminSidebar from "./Sidebar";
import axios from "axios";
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
  max-width: 1000px;
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
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
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
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #16a085;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const AnnouncementList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AnnouncementCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  border-left: 5px solid
    ${(props) => {
      if (props.$category === "Finance & Accounts") return "#e11d48";
      if (props.$isTargeted) return "#0f766e";
      if (props.$isSent) return "#2563eb";
      return "#64748b";
    }};
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .top-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .badges {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .title {
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .body {
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .dispatch-info {
    margin-top: 12px;
    padding: 10px 14px;
    background: ${(props) => (props.$isSent ? "#f0fdf4" : "#f8fafc")};
    border-radius: 8px;
    border: 1px solid ${(props) => (props.$isSent ? "#bbf7d0" : "#e2e8f0")};
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #334155;
    flex-wrap: wrap;
    gap: 8px;
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
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: ${(props) => props.$bg || "#e0f2fe"};
  color: ${(props) => props.$color || "#0369a1"};
`;

const AdminAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    targetAudience: "all",
    targetBatch: "Batch 2024",
    targetEmail: "",
    targetRollno: "",
    targetEmailsInput: "",
    announcement: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedTab, setFeedTab] = useState("all"); // "all" | "sent" | "targeted" | "finance" | "broadcast"
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredAnnouncements = useMemo(() => {
    return [...announcements]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .filter((item) => {
        if (feedTab === "sent") {
          return Boolean(item.createdBy);
        }
        if (feedTab === "targeted") {
          return (
            item.targetAudience === "bunch_emails" ||
            item.targetAudience === "single_student" ||
            item.targetAudience === "single_teacher" ||
            item.targetAudience === "batch"
          );
        }
        if (feedTab === "finance") {
          return item.category === "Finance & Accounts";
        }
        if (feedTab === "broadcast") {
          return item.targetAudience === "all" || !item.targetAudience;
        }
        return true;
      });
  }, [announcements, feedTab]);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/announcements/getall`);
      if (response.data?.announcements) {
        setAnnouncements(response.data.announcements);
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
      const adminData = Cookies.get("adminData");
      const creatorName = adminData ? JSON.parse(adminData)?.name || "Administrator" : "Administrator";

      const res = await axios.post(`${BACKEND_URL}api/v1/announcements`, {
        ...formData,
        targetEmails: formData.targetAudience === "bunch_emails" ? formData.targetEmailsInput : undefined,
        createdBy: creatorName,
      });

      if (res.data?.success) {
        toast.success("Broadcast announcement created successfully!");
        setFormData({
          title: "",
          category: "General",
          targetAudience: "all",
          targetBatch: "Batch 2024",
          targetEmail: "",
          targetRollno: "",
          targetEmailsInput: "",
          announcement: "",
        });
        fetchAnnouncements();
      } else {
        toast.error(res.data?.message || "Failed to create announcement.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error posting announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const getAudienceLabel = (item) => {
    switch (item.targetAudience) {
      case "students":
        return { text: "👥 All Students", bg: "#dbeafe", color: "#1d4ed8" };
      case "teachers":
        return { text: "👨‍🏫 Faculty Only", bg: "#f3e8ff", color: "#7e22ce" };
      case "admins":
        return { text: "🛡️ Administrators", bg: "#fee2e2", color: "#b91c1c" };
      case "batch":
        return { text: `🎯 Batch: ${item.targetBatch || "All Batches"}`, bg: "#fef3c7", color: "#b45309" };
      case "bunch_emails":
        return {
          text: `🎯 Bunch Emails (${item.targetEmails?.length || 0} Recipients)`,
          bg: "#ccfbf1",
          color: "#0f766e",
        };
      case "single_student":
        return {
          text: `🎯 Single Student (${item.targetEmail || item.targetRollno || "Direct"})`,
          bg: "#ccfbf1",
          color: "#0f766e",
        };
      case "single_teacher":
        return { text: `🎯 Single Faculty (${item.targetEmail})`, bg: "#fdf4ff", color: "#a21caf" };
      default:
        return { text: "🌐 Campus-Wide (Everyone)", bg: "#e2e8f0", color: "#334155" };
    }
  };

  return (
    <Container>
      <AdminSidebar />
      <Content>
        <Header>
          <h1>Broadcast & Targeted Announcements</h1>
          <p>
            Publish institutional notices targeted to specific cohorts, academic batches, faculty, or individual students.
          </p>
        </Header>

        {/* CREATE ANNOUNCEMENT FORM */}
        <Card>
          <CardTitle>📢 Publish New Announcement</CardTitle>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <label>Announcement Subject / Title</label>
                <input
                  type="text"
                  placeholder="e.g. End Semester Exam Schedule Released"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="General">General Notice</option>
                  <option value="Academic">Academic Affairs</option>
                  <option value="Examination">Examinations & Schedules</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                  <option value="Events & Culture">Campus Events & Fest</option>
                  <option value="Urgent">⚠️ Urgent / Important</option>
                </select>
              </FormGroup>

              <FormGroup>
                <label>Target Audience</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                >
                  <option value="all">Campus-Wide (All Users)</option>
                  <option value="bunch_emails">🎯 Bunch of Emails (Target Specific Users)</option>
                  <option value="batch">Specific Batch Cohort</option>
                  <option value="students">All Enrolled Students</option>
                  <option value="teachers">All Faculty / Teachers</option>
                  <option value="admins">Institutional Administrators Only</option>
                </select>
              </FormGroup>

              {formData.targetAudience === "bunch_emails" && (
                <FormGroup style={{ gridColumn: "1 / -1" }}>
                  <label>Target Bunch of Emails * (Separate by commas or spaces)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. aarav@example.com, diya@example.com, professor@example.com"
                    value={formData.targetEmailsInput}
                    onChange={(e) => setFormData({ ...formData, targetEmailsInput: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Only users matching these specific email addresses will receive this announcement.
                  </span>
                </FormGroup>
              )}

              {formData.targetAudience === "batch" && (
                <FormGroup>
                  <label>Select Target Batch</label>
                  <select
                    value={formData.targetBatch}
                    onChange={(e) => setFormData({ ...formData, targetBatch: e.target.value })}
                  >
                    <option value="Batch 2024">Batch 2024</option>
                    <option value="Batch 2025">Batch 2025</option>
                    <option value="Batch 2023">Batch 2023</option>
                    <option value="Batch 2022">Batch 2022</option>
                  </select>
                </FormGroup>
              )}
            </FormGrid>

            <FormGroup style={{ marginBottom: "18px" }}>
              <label>Announcement Details</label>
              <textarea
                rows={4}
                placeholder="Write your comprehensive message or circular here..."
                value={formData.announcement}
                onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
                required
              />
            </FormGroup>

            <SubmitButton type="submit" disabled={submitting}>
              {submitting ? "Publishing..." : "🚀 Publish & Broadcast Notice"}
            </SubmitButton>
          </form>
        </Card>

        {/* ANNOUNCEMENT FEED HEADER & TABS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px 0" }}>
              Announcements & Dispatches ({announcements.length})
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              Differentiate sent broadcasts from targeted fee notices and cohort circulars.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Notices" },
              { id: "sent", label: "📤 Sent Outbox" },
              { id: "targeted", label: "🎯 Targeted / Cohorts" },
              { id: "finance", label: "💰 Accounts & Fee Dues" },
              { id: "broadcast", label: "🌐 Campus Broadcasts" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFeedTab(tab.id)}
                style={{
                  background: feedTab === tab.id ? "#0f766e" : "white",
                  color: feedTab === tab.id ? "white" : "#475569",
                  border: "1px solid",
                  borderColor: feedTab === tab.id ? "#0f766e" : "#cbd5e1",
                  borderRadius: "6px",
                  padding: "7px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnnouncementList>
          {filteredAnnouncements.length === 0 ? (
            <Card style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
              <h3 style={{ margin: "0 0 4px 0", color: "#1e293b" }}>No announcements found</h3>
              <p style={{ margin: 0, fontSize: "13px" }}>
                No announcements match the selected filter category ({feedTab}).
              </p>
            </Card>
          ) : (
            filteredAnnouncements.map((item) => {
              const aud = getAudienceLabel(item);
              const isTargeted = item.targetAudience && item.targetAudience !== "all";
              const isFinance = item.category === "Finance & Accounts";

              return (
                <AnnouncementCard
                  key={item._id}
                  $category={item.category}
                  $isTargeted={isTargeted}
                  $isSent={true}
                >
                  <div className="top-meta">
                    <div className="badges">
                      <Badge
                        $bg={isFinance ? "#fee2e2" : "#f1f5f9"}
                        $color={isFinance ? "#b91c1c" : "#475569"}
                      >
                        📁 {item.category || "General"}
                      </Badge>
                      <Badge $bg={aud.bg} $color={aud.color}>
                        {aud.text}
                      </Badge>
                      <Badge $bg="#dcfce7" $color="#15803d">
                        📤 Sent Dispatch
                      </Badge>
                    </div>
                    <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                      🕒 {item.createdAt ? formatDateTimeDDMMYYYY(item.createdAt) : "Recently"}
                    </span>
                  </div>

                  <div className="title">{item.title || "Campus Notice"}</div>
                  <div className="body">
                    {(() => {
                      const text = item.announcement || "";
                      const isLong = text.length > 130;
                      const isExpanded = expandedIds.has(item._id);
                      const display = isLong && !isExpanded ? text.slice(0, 130) + "..." : text;
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
                              {isExpanded ? "▴ Show Short Summary" : "▾ Read Full Announcement"}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {item.targetEmails && item.targetEmails.length > 0 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#0f766e",
                        marginTop: "10px",
                        background: "#f0fdf4",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      🎯 <strong>Targeted Email Outbox ({item.targetEmails.length} recipients):</strong>{" "}
                      {item.targetEmails.join(", ")}
                    </div>
                  )}

                  <div className="dispatch-info">
                    <div>
                      <strong>📤 Sender:</strong> {item.createdBy || "Institutional Administration"}
                    </div>
                    <div>
                      <strong>📡 Status:</strong>{" "}
                      <span style={{ color: "#16a34a", fontWeight: 700 }}>
                        ✓ Dispatched & Live in Student Portals
                      </span>
                    </div>
                  </div>

                  <div className="footer">
                    <span>
                      Audience Scope:{" "}
                      {item.targetAudience === "all" ? "Whole Campus" : "Direct / Targeted"}
                    </span>
                    <span>Ref ID: {item._id?.slice(-8) || "ANNC"}</span>
                  </div>
                </AnnouncementCard>
              );
            })
          )}
        </AnnouncementList>
      </Content>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default AdminAnnouncement;
