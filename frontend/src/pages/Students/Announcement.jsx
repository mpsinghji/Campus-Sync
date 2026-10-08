import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
import styled from "styled-components";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../../constants/url";
import { formatDateTimeDDMMYYYY } from "../../utils/dateUtils";
import {
  BsMegaphone,
  BsSearch,
  BsCalendar3,
  BsPerson,
  BsArrowCounterclockwise,
  BsTag,
} from "react-icons/bs";

const Container = styled.div`
  display: flex;
  padding-left: 250px;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;

  *, *::before, *::after {
    box-sizing: border-box;
  }

  @media screen and (max-width: 768px) {
    padding-left: 0;
    flex-direction: column;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 24px 32px;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;

  h1 {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p {
    font-size: 13px;
    color: #64748b;
    margin: 0;
  }
`;

// Compact filter & search toolbar
const Toolbar = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const SearchInputWrap = styled.div`
  position: relative;
  flex: 1 1 240px;
  max-width: 360px;
  min-width: 200px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 14px;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 13px;
    color: #0f172a;
    background: #f8fafc;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #3b82f6;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;

  button {
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    color: #475569;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    &.active {
      background: #2563eb;
      color: #ffffff;
      border-color: #2563eb;
      font-weight: 600;
    }
  }
`;

const AnnouncementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
`;

// Compact, high-density Announcement Card
const AnnouncementCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid
    ${(props) =>
      props.$category === "Academic"
        ? "#10b981"
        : props.$category === "Exam" || props.$category === "Examination"
        ? "#f59e0b"
        : props.$category === "Urgent"
        ? "#ef4444"
        : props.$category === "Events"
        ? "#8b5cf6"
        : "#3b82f6"};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-bottom: 10px;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  }

  .top-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    flex-wrap: wrap;
    gap: 8px;

    .tag-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .date-str {
      font-size: 11px;
      font-weight: 500;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .title {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 5px;
    line-height: 1.3;
  }

  .body {
    font-size: 13px;
    color: #334155;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .bottom-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid #f1f5f9;
    font-size: 11px;
    color: #64748b;

    span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: ${(props) => props.$bg || "#eff6ff"};
  color: ${(props) => props.$color || "#2563eb"};
  border: 1px solid ${(props) => props.$border || "#bfdbfe"};
`;

const EmptyState = styled.div`
  padding: 50px 20px;
  text-align: center;
  color: #64748b;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  .icon {
    font-size: 38px;
    color: #94a3b8;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: #334155;
    margin: 0 0 4px 0;
  }

  p {
    font-size: 13px;
    margin: 0;
  }
`;

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
      setLoading(true);
      let batch = "";
      let email = "";
      let rollno = "";

      const raw = Cookies.get("studentData") || localStorage.getItem("studentData");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const u = parsed.user || parsed;
          batch = u.batch || "";
          email = u.email || "";
          rollno = u.rollno || "";
        } catch (e) {}
      }

      const queryParams = new URLSearchParams({
        role: "student",
        batch,
        email,
        rollno,
      });

      const response = await axios.get(
        `${BACKEND_URL}api/v1/announcements/getall?${queryParams.toString()}`
      );
      if (response.data?.announcements) {
        setAnnouncements(response.data.announcements);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Error fetching announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set();
    announcements.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ["all", ...Array.from(set)];
  }, [announcements]);

  // Filtered announcements (strictly ordered by time, newest first)
  const filteredAnnouncements = useMemo(() => {
    return [...announcements]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .filter((item) => {
        const q = search.toLowerCase().trim();
        const matchSearch =
          !q ||
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.announcement && item.announcement.toLowerCase().includes(q)) ||
          (item.createdBy && item.createdBy.toLowerCase().includes(q));

        const matchCategory =
          selectedCategory === "all" ||
          (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

        return matchSearch && matchCategory;
      });
  }, [announcements, search, selectedCategory]);

  return (
    <Container>
      <Sidebar />
      <Content>
        <Header>
          <h1>
            <BsMegaphone style={{ color: "#2563eb" }} /> Announcements & Circulars
          </h1>
          <p>Official notices, departmental circulars, and campus updates</p>
        </Header>

        {/* Compact Search & Category Filter Toolbar */}
        <Toolbar>
          <SearchInputWrap>
            <BsSearch />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchInputWrap>

          <CategoryTabs>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? "active" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "All Notices" : cat}
              </button>
            ))}

            <button
              onClick={fetchAnnouncements}
              title="Refresh Announcements"
              style={{ padding: "6px 9px", display: "inline-flex", alignItems: "center" }}
            >
              <BsArrowCounterclockwise />
            </button>
          </CategoryTabs>
        </Toolbar>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading announcements...
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <EmptyState>
            <div className="icon">
              <BsMegaphone />
            </div>
            <h3>No Announcements Found</h3>
            <p>
              {announcements.length === 0
                ? "No active announcements for your batch or cohort at this time."
                : "No announcements matched your search filter."}
            </p>
          </EmptyState>
        ) : (
          <AnnouncementsGrid>
            {filteredAnnouncements.map((item) => (
              <AnnouncementCard key={item._id} $category={item.category || "General"}>
                <div className="top-meta">
                  <div className="tag-row">
                    <Badge $bg="#f1f5f9" $color="#334155" $border="#e2e8f0">
                      <BsTag style={{ fontSize: "10px" }} />
                      {item.category || "General"}
                    </Badge>
                  </div>
                  <div className="date-str">
                    <BsCalendar3 style={{ fontSize: "10px" }} />
                    {item.createdAt ? formatDateTimeDDMMYYYY(item.createdAt) : item.date || "Recent Notice"}
                  </div>
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
                            {isExpanded ? "▴ Show Short Summary" : "▾ Read Full Announcement"}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="bottom-info">
                  <span>
                    <BsPerson style={{ fontSize: "11px" }} />
                    {item.createdBy || "Institutional Administration"}
                  </span>
                  <span>
                    Audience: {item.targetAudience === "all" ? "Campus-Wide" : item.targetAudience || "Cohort"}
                  </span>
                </div>
              </AnnouncementCard>
            ))}
          </AnnouncementsGrid>
        )}
      </Content>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default AnnouncementSection;

