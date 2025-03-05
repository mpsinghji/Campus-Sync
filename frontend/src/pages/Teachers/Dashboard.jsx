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
import { checkTeacherAuth } from "../../redux/Actions/teacherActions";

const TeacherDashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.teacher);

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = async () => {
      const teacherToken = localStorage.getItem('teacherToken');
      if (!teacherToken) {
        navigate('/choose-user');
        return;
      }
      await dispatch(checkTeacherAuth());
    };

    checkAuth();
  }, [dispatch, navigate]);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/choose-user');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch student count
        const studentResponse = await axios.get("http://localhost:5000/api/v1/student/count", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTotalStudents(studentResponse.data.totalStudents);

        // Fetch events
        const eventsResponse = await axios.get("http://localhost:5000/api/v1/events/getall", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEvents(eventsResponse.data.events || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (error.response?.status === 401) {
          // If unauthorized, redirect to login
          navigate('/choose-user');
        }
      }
    };

    fetchData();
  }, [isAuthenticated, token, navigate]);

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
