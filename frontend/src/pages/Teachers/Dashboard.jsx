import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import {
  TeacherDashboardContainer,
  Content,
  Section,
  SectionTitle,
  CardContainer,
  Card,
  CardTitle,
  CardContent,
  EventItem,
  EventList,
} from "../../styles/DashboardStyles";
import axios from "axios";
import { useState, useEffect } from "react";

const TeacherDashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.teacher);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student count
        const studentResponse = await axios.get("https://campus-sync-ez7y.onrender.com/api/v1/student/count", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTotalStudents(studentResponse.data.totalStudents);

        // Fetch events
        const eventsResponse = await axios.get("https://campus-sync-ez7y.onrender.com/api/v1/events/getall", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEvents(eventsResponse.data.events || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <TeacherDashboardContainer>
      <Sidebar />
      <Content>
        <Section>
          <SectionTitle>Overview</SectionTitle>
          <CardContainer>
            <Card>
              <CardTitle>Total Students</CardTitle>
              <CardContent>{totalStudents}</CardContent>
            </Card>
          </CardContainer>
        </Section>

        <Section>
          <SectionTitle>Upcoming Events</SectionTitle>
          <EventList>
            {events.map((event) => (
              <EventItem key={event._id}>
                <h3>{event.name}</h3>
                <p>{event.description}</p>
                <p>{new Date(event.date).toLocaleDateString()}</p>
              </EventItem>
            ))}
          </EventList>
        </Section>
      </Content>
    </TeacherDashboardContainer>
  );
};

export default TeacherDashboard;
