import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./Sidebar.jsx";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";
import { formatDateDDMMYYYY } from "../../utils/dateUtils";

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
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
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
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 18px;
`;

const EventCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .date-badge {
    background: #e0f2fe;
    color: #0369a1;
    font-weight: 600;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 20px;
    width: fit-content;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
    margin: 0 0 14px 0;
  }

  .meta {
    border-top: 1px solid #f1f5f9;
    padding-top: 10px;
    font-size: 12px;
    color: #94a3b8;
    display: flex;
    justify-content: space-between;
  }
`;

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    date: "",
    targetAudience: "all",
    batch: "Batch 2024",
    section: "A",
    location: "Main Auditorium",
  });
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/events/getall`);
      setEvents(response.data.events || []);
    } catch (error) {
      toast.error("Error fetching events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const addEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date) {
      toast.error("Event name and date are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...newEvent,
        targetEmails: newEvent.targetAudience === "bunch_emails" ? newEvent.targetEmailsInput : undefined,
      };
      const response = await axios.post(`${BACKEND_URL}api/v1/events`, payload);
      if (response.data?.success) {
        toast.success("Event scheduled successfully!");
        setNewEvent({
          name: "",
          description: "",
          date: "",
          targetAudience: "all",
          batch: "Batch 2024",
          section: "A",
          location: "Main Auditorium",
          targetEmailsInput: "",
        });
        fetchEvents();
      }
    } catch (error) {
      toast.error("Error scheduling event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <AdminSidebar />
      <Content>
        <Header>
          <h1>Events & Campus Calendar</h1>
          <p>Schedule academic events, webinars, festivals, and cohort-specific seminars</p>
        </Header>

        {/* ADD EVENT FORM */}
        <Card>
          <CardTitle>📅 Schedule New Event</CardTitle>
          <form onSubmit={addEvent}>
            <FormGrid>
              <FormGroup>
                <label>Event Title</label>
                <input
                  type="text"
                  name="name"
                  value={newEvent.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Annual Tech Symposium 2024"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Target Audience</label>
                <select
                  name="targetAudience"
                  value={newEvent.targetAudience}
                  onChange={handleInputChange}
                >
                  <option value="all">Campus-Wide (Everyone)</option>
                  <option value="bunch_emails">🎯 Bunch of Emails (Target Specific Users)</option>
                  <option value="batch">Specific Batch</option>
                  <option value="section">Specific Batch & Section</option>
                  <option value="teachers">Faculty Only</option>
                </select>
              </FormGroup>

              {newEvent.targetAudience === "bunch_emails" && (
                <FormGroup style={{ gridColumn: "1 / -1" }}>
                  <label>Target Email Addresses * (Separate by commas or spaces)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. rahul@example.com, student2@example.com, professor@example.com"
                    value={newEvent.targetEmailsInput || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, targetEmailsInput: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Only invited students and faculty with these emails will see this calendar event.
                  </span>
                </FormGroup>
              )}

              {(newEvent.targetAudience === "batch" || newEvent.targetAudience === "section") && (
                <FormGroup>
                  <label>Select Batch</label>
                  <select name="batch" value={newEvent.batch} onChange={handleInputChange}>
                    <option value="Batch 2024">Batch 2024</option>
                    <option value="Batch 2025">Batch 2025</option>
                    <option value="Batch 2023">Batch 2023</option>
                  </select>
                </FormGroup>
              )}

              {newEvent.targetAudience === "section" && (
                <FormGroup>
                  <label>Select Section</label>
                  <select name="section" value={newEvent.section} onChange={handleInputChange}>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </FormGroup>
              )}

              <FormGroup>
                <label>Campus Venue / Location</label>
                <input
                  type="text"
                  name="location"
                  value={newEvent.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Auditorium / Seminar Hall 2"
                />
              </FormGroup>
            </FormGrid>

            <FormGroup style={{ marginBottom: "16px" }}>
              <label>Event Description</label>
              <textarea
                rows={3}
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                placeholder="Details about guest speakers, agenda, or student prerequisites..."
                required
              />
            </FormGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Event"}
            </SubmitButton>
          </form>
        </Card>

        {/* EVENTS LIST */}
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "16px" }}>
          Scheduled Events ({events.length})
        </h2>

        <EventsGrid>
          {events.length === 0 ? (
            <Card style={{ textAlign: "center", color: "#64748b", gridColumn: "1 / -1" }}>
              No events scheduled yet.
            </Card>
          ) : (
            events.map((event) => (
              <EventCard key={event._id}>
                <div>
                  <div className="date-badge">
                    🗓️ {formatDateDDMMYYYY(event.date)} at{" "}
                    {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <h3>{event.name}</h3>
                  <p>{event.description}</p>
                </div>

                <div className="meta">
                  <span>📍 {event.location || "Campus Venue"}</span>
                  <span>
                    🎯{" "}
                    {event.targetAudience === "batch"
                      ? event.batch
                      : event.targetAudience === "section"
                      ? `${event.batch} (${event.section})`
                      : "Campus-Wide"}
                  </span>
                </div>
              </EventCard>
            ))
          )}
        </EventsGrid>
      </Content>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default EventCalendar;
