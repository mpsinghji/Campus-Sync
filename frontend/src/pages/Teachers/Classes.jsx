import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import styled from "styled-components";
import axios from "axios";
import { BACKEND_URL } from "../../constants/url";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Container = styled.div`
  display: flex;
  padding-left: 250px;
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

const FilterCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const FilterItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  select, input {
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 13px;
    outline: none;
    background: white;

    &:focus {
      border-color: #2563eb;
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
  }

  .day-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 12px;
    font-weight: 700;
    border-radius: 6px;
    margin-bottom: 10px;
  }

  .time {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .subject {
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 12px;
  }

  .meta {
    font-size: 13px;
    color: #475569;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tags {
    display: flex;
    gap: 6px;
    margin-top: 14px;
    flex-wrap: wrap;

    span {
      font-size: 11px;
      padding: 3px 8px;
      background: #f1f5f9;
      color: #334155;
      border-radius: 4px;
      font-weight: 600;
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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TeacherClasses = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}api/v1/timetable?mySchedule=true`, {
          withCredentials: true,
        });
        if (res.data?.success && Array.isArray(res.data.schedules)) {
          setSchedules(res.data.schedules);
        } else {
          setSchedules([]);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load class schedules");
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      if (filterDay !== "all" && s.day !== filterDay) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (s.subject || "").toLowerCase().includes(q) ||
          (s.room || "").toLowerCase().includes(q) ||
          (s.department || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [schedules, filterDay, searchQuery]);

  return (
    <>
      <Container>
        <Sidebar />
        <Content>
          <Header>
            <h1>My Assigned Teaching Timetable</h1>
            <p>View your scheduled lectures, laboratory periods, and venue assignments.</p>
          </Header>

          <FilterCard>
            <FilterItem>
              <label>Day:</label>
              <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
                <option value="all">All Days</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FilterItem>

            <FilterItem style={{ flex: 1, minWidth: "220px" }}>
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search subject, room, or dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </FilterItem>
          </FilterCard>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              Loading assigned timetable...
            </div>
          ) : schedules.length === 0 ? (
            <EmptyState>
              <div className="icon">🗓️</div>
              <h3>No timetable has been assigned yet.</h3>
              <p>Your institutional teaching timetable will appear here once configured by administration.</p>
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState>
              <div className="icon">🔍</div>
              <h3>No classes found</h3>
              <p>No class schedules match your selected filters.</p>
            </EmptyState>
          ) : (
            <Grid>
              {filtered.map((slot) => (
                <Card key={slot._id || slot.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="day-badge">{slot.day}</span>
                    <span className="time">⏰ {slot.timeSlot}</span>
                  </div>
                  <div className="subject">{slot.subject}</div>
                  <div className="meta">🏫 <strong>Venue:</strong> {slot.room}</div>
                  <div className="meta">🏛️ <strong>Dept:</strong> {slot.department}</div>
                  <div className="tags">
                    <span>{slot.type || "Lecture"}</span>
                    <span>{slot.section || "Section A"}</span>
                    {slot.group && slot.group !== "All" && <span>{slot.group}</span>}
                  </div>
                </Card>
              ))}
            </Grid>
          )}
        </Content>
      </Container>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default TeacherClasses;
