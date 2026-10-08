import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Sidebar from "./Sidebar.jsx";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../../constants/url";
import { formatDateDDMMYYYY } from "../../utils/dateUtils";
import {
  BsCalendarEvent,
  BsGeoAlt,
  BsClock,
  BsSearch,
  BsFilter,
  BsPeople,
  BsCalendarCheck,
  BsBookmarkStar,
  BsTrophy,
  BsBriefcase,
  BsChevronLeft,
  BsChevronRight,
  BsCheckCircle,
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

const MetricsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 26px;
`;

const MetricTile = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);

  .icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${(props) => props.$bg || "#f0fdf4"};
    color: ${(props) => props.$color || "#16a34a"};
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

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;

  @media screen and (max-width: 1150px) {
    grid-template-columns: 1fr;
  }
`;

// Left Column: Interactive Mini Calendar & Agenda
const CalendarSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MiniCalendarCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);

  .cal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .nav-btns {
      display: flex;
      gap: 6px;

      button {
        background: #f1f5f9;
        border: none;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #475569;

        &:hover {
          background: #e2e8f0;
        }
      }
    }
  }

  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    text-align: center;

    .day {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      border-radius: 8px;
      cursor: pointer;
      position: relative;
      transition: all 0.15s;

      &:hover {
        background: #f1f5f9;
      }

      &.has-event {
        background: #ecfdf5;
        color: #059669;
        font-weight: 700;

        &::after {
          content: "";
          position: absolute;
          bottom: 3px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #10b981;
        }
      }

      &.selected {
        background: #0f766e !important;
        color: white !important;

        &::after {
          background: white !important;
        }
      }

      &.muted {
        color: #cbd5e1;
        pointer-events: none;
      }
    }
  }
`;

const QuickFilterCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);

  h4 {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    button {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: #f8fafc;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        background: #f1f5f9;
        color: #0f172a;
      }

      &.active {
        background: #ecfdf5;
        color: #059669;
        border-color: #a7f3d0;
      }

      .badge {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }
`;

// Right Column: Events Feed & Search
const EventsFeedSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Toolbar = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;

  .search-wrapper {
    position: relative;
    flex: 1;
    min-width: 240px;

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

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
`;

const EventCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.07);
    border-color: #0f766e;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;

    .date-badge {
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 700;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .countdown {
      font-size: 11px;
      font-weight: 700;
      color: #059669;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 6px;
    }
  }

  h3 {
    font-size: 16px;
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

  .meta-list {
    border-top: 1px solid #f1f5f9;
    padding-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: #475569;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;

      svg {
        color: #0f766e;
        font-size: 13px;
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f1f5f9;
    padding-top: 10px;

    .tag {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
    }

    button.rsvp-btn {
      background: #0f766e;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;

      &:hover {
        background: #0d655e;
      }
    }
  }
`;

const StudentEventSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let batch = "";
      let section = "";

      const studentCookie = Cookies.get("studentData");
      if (studentCookie) {
        try {
          const parsed = JSON.parse(studentCookie);
          batch = parsed.batch || "";
          section = parsed.section || "";
        } catch (e) {}
      }

      const params = new URLSearchParams({
        role: "student",
        batch,
        section,
      });

      const response = await axios.get(
        `${BACKEND_URL}api/v1/events/getall?${params.toString()}`
      );
      setEvents(response.data.events || []);
    } catch (error) {
      toast.error("Error fetching campus events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const categorizedEvents = useMemo(() => {
    return events.filter((ev) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        ev.name?.toLowerCase().includes(q) ||
        ev.description?.toLowerCase().includes(q) ||
        ev.location?.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "all" ||
        (selectedCategory === "tech" &&
          (ev.name?.toLowerCase().includes("tech") ||
            ev.name?.toLowerCase().includes("hackathon") ||
            ev.name?.toLowerCase().includes("docker") ||
            ev.description?.toLowerCase().includes("coding"))) ||
        (selectedCategory === "placement" &&
          (ev.name?.toLowerCase().includes("placement") ||
            ev.name?.toLowerCase().includes("infosys") ||
            ev.name?.toLowerCase().includes("wipro"))) ||
        (selectedCategory === "sports" &&
          (ev.name?.toLowerCase().includes("football") ||
            ev.name?.toLowerCase().includes("sports"))) ||
        (selectedCategory === "social" &&
          (ev.name?.toLowerCase().includes("blood") ||
            ev.name?.toLowerCase().includes("mental") ||
            ev.name?.toLowerCase().includes("alumni")));

      return matchesSearch && matchesCat;
    });
  }, [events, searchQuery, selectedCategory]);

  const formatDate = (dateStr) => {
    return formatDateDDMMYYYY(dateStr);
  };

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Completed";
    if (diff === 0) return "Today!";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  };

  // Calendar dates generation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const eventDaysInCurrentMonth = useMemo(() => {
    const set = new Set();
    events.forEach((ev) => {
      if (ev.date) {
        const d = new Date(ev.date);
        if (d.getFullYear() === year && d.getMonth() === month) {
          set.add(d.getDate());
        }
      }
    });
    return set;
  }, [events, year, month]);

  return (
    <Container>
      <Sidebar />
      <Content>
        <Header>
          <div className="title-group">
            <h1>
              <BsCalendarEvent style={{ color: "#0f766e" }} /> Campus Events & Calendar
            </h1>
            <p>Interactive schedule of fests, placement drives, workshops & activities</p>
          </div>
        </Header>

        {/* Metrics Banner */}
        <MetricsBar>
          <MetricTile $bg="#ecfdf5" $color="#059669">
            <div className="icon-wrap">
              <BsCalendarCheck />
            </div>
            <div className="details">
              <div className="val">{events.length}</div>
              <div className="lbl">Total Events</div>
            </div>
          </MetricTile>

          <MetricTile $bg="#eff6ff" $color="#2563eb">
            <div className="icon-wrap">
              <BsBookmarkStar />
            </div>
            <div className="details">
              <div className="val">
                {events.filter((e) => new Date(e.date) >= new Date()).length}
              </div>
              <div className="lbl">Upcoming</div>
            </div>
          </MetricTile>

          <MetricTile $bg="#fef3c7" $color="#d97706">
            <div className="icon-wrap">
              <BsTrophy />
            </div>
            <div className="details">
              <div className="val">TechUtsav</div>
              <div className="lbl">Featured Fest</div>
            </div>
          </MetricTile>

          <MetricTile $bg="#f5f3ff" $color="#7c3aed">
            <div className="icon-wrap">
              <BsBriefcase />
            </div>
            <div className="details">
              <div className="val">2 Drives</div>
              <div className="lbl">Recruitments</div>
            </div>
          </MetricTile>
        </MetricsBar>

        <MainLayout>
          {/* Left Column: Mini Calendar & Quick Categories */}
          <CalendarSidebar>
            <MiniCalendarCard>
              <div className="cal-header">
                <h3>
                  {currentMonthDate.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <div className="nav-btns">
                  <button
                    onClick={() =>
                      setCurrentMonthDate(new Date(year, month - 1, 1))
                    }
                  >
                    <BsChevronLeft />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentMonthDate(new Date(year, month + 1, 1))
                    }
                  >
                    <BsChevronRight />
                  </button>
                </div>
              </div>

              <div className="weekdays">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              <div className="days-grid">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="day muted" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const hasEvent = eventDaysInCurrentMonth.has(dayNum);
                  const isSelected = selectedDay === dayNum;

                  return (
                    <div
                      key={`day-${dayNum}`}
                      className={`day ${hasEvent ? "has-event" : ""} ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() =>
                        setSelectedDay(selectedDay === dayNum ? null : dayNum)
                      }
                      title={hasEvent ? `Events on day ${dayNum}` : ""}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>
            </MiniCalendarCard>

            <QuickFilterCard>
              <h4>Event Categories</h4>
              <div className="category-list">
                <button
                  className={selectedCategory === "all" ? "active" : ""}
                  onClick={() => setSelectedCategory("all")}
                >
                  <span>🌟 All Events</span>
                  <span className="badge">{events.length}</span>
                </button>
                <button
                  className={selectedCategory === "tech" ? "active" : ""}
                  onClick={() => setSelectedCategory("tech")}
                >
                  <span>⚡ Hackathons & Tech</span>
                  <span className="badge">3</span>
                </button>
                <button
                  className={selectedCategory === "placement" ? "active" : ""}
                  onClick={() => setSelectedCategory("placement")}
                >
                  <span>💼 Placement & Industry</span>
                  <span className="badge">2</span>
                </button>
                <button
                  className={selectedCategory === "sports" ? "active" : ""}
                  onClick={() => setSelectedCategory("sports")}
                >
                  <span>⚽ Sports Tournaments</span>
                  <span className="badge">1</span>
                </button>
                <button
                  className={selectedCategory === "social" ? "active" : ""}
                  onClick={() => setSelectedCategory("social")}
                >
                  <span>🤝 Health & NSS</span>
                  <span className="badge">2</span>
                </button>
              </div>
            </QuickFilterCard>
          </CalendarSidebar>

          {/* Right Column: Events Grid */}
          <EventsFeedSection>
            <Toolbar>
              <div className="search-wrapper">
                <BsSearch />
                <input
                  type="text"
                  placeholder="Search events, workshops, venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Toolbar>

            {loading ? (
              <p style={{ color: "#64748b", padding: "20px" }}>Loading events...</p>
            ) : categorizedEvents.length > 0 ? (
              <EventsGrid>
                {categorizedEvents.map((event) => (
                  <EventCard key={event._id}>
                    <div className="card-top">
                      <span className="date-badge">
                        📅 {formatDate(event.date)}
                      </span>
                      <span className="countdown">
                        {getDaysLeft(event.date)}
                      </span>
                    </div>

                    <h3>{event.name}</h3>
                    <p className="desc">{event.description}</p>

                    <div className="meta-list">
                      <div className="meta-item">
                        <BsGeoAlt />
                        <span>{event.location || "Campus Premises"}</span>
                      </div>
                      <div className="meta-item">
                        <BsPeople />
                        <span>
                          Target: {event.targetAudience === "all" ? "All Students & Staff" : event.targetAudience}
                        </span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <span className="tag">
                        {event.batch ? event.batch : "Open to All"}
                      </span>
                      <button
                        className="rsvp-btn"
                        onClick={() =>
                          toast.success(`Registered for ${event.name}! Details sent to your calendar.`, {
                            autoClose: 2000,
                          })
                        }
                      >
                        <BsCheckCircle /> RSVP / Save
                      </button>
                    </div>
                  </EventCard>
                ))}
              </EventsGrid>
            ) : (
              <div
                style={{
                  background: "white",
                  padding: "40px",
                  borderRadius: "14px",
                  textAlign: "center",
                  color: "#64748b",
                  border: "1px dashed #cbd5e1",
                }}
              >
                No events found matching your filter criteria.
              </div>
            )}
          </EventsFeedSection>
        </MainLayout>
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default StudentEventSection;
