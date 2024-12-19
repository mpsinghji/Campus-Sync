import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import {
  StudentDashboardContainer,
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
import Loading from "../../components/Loading/loading.jsx";

const StudentDashboard = () => {
  const [assignmentCount, setAssignmentCount] = useState(null);
  const [announcementCount, setAnnouncementCount] = useState(null);
  const [eventCount, setEventCount] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (url, setter, field) => {
    try {
      // Uncomment and use the appropriate token retrieval method
      // const token = localStorage.getItem("studenttoken");
      // if (!token) {
      //   throw new Error("No token found. Please log in.");
      // }
      
      const response = await axios.get(url, {
        // Uncomment if using token
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });

      // Log the response for debugging
      console.log(`Fetched data from ${url}:`, response.data);

      setter(response.data[field] || response.data); // Default to data if field is missing
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error.message);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchData("http://localhost:5000/api/v1/assignments/count", setAssignmentCount, "count"),
        fetchData("http://localhost:5000/api/v1/announcements/count", setAnnouncementCount, "count"),
        fetchData("http://localhost:5000/api/v1/events/count", setEventCount, "count"),
        fetchData("http://localhost:5000/api/v1/events/getall", setEvents, "events"),
      ]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <StudentDashboardContainer>
      <Sidebar />
      <Content>
        <Section>
          <SectionTitle>Overview</SectionTitle>
          <CardContainer>
            <Card>
              <CardTitle>Assignments</CardTitle>
              <CardContent>
                {assignmentCount !== null ? assignmentCount : "No data available"}
              </CardContent>
            </Card>
            <Card>
              <CardTitle>Announcements</CardTitle>
              <CardContent>
                {announcementCount !== null ? announcementCount : "No data available"}
              </CardContent>
            </Card>
            <Card>
              <CardTitle>Events</CardTitle>
              <CardContent>
                {eventCount !== null ? eventCount : "No data available"}
              </CardContent>
            </Card>
          </CardContainer>
        </Section>

        <Section>
          <SectionTitle>Upcoming Events</SectionTitle>
          <EventList>
            {events.length > 0 ? (
              events.map((event) => (
                <EventItem key={event._id}>
                  <h3>{event.name}</h3>
                  <p>{event.description}</p>
                  <p>{new Date(event.date).toLocaleDateString()}</p>
                </EventItem>
              ))
            ) : (
              <p>No upcoming events.</p>
            )}
          </EventList>
        </Section>
      </Content>
    </StudentDashboardContainer>
  );
};

export default StudentDashboard;
