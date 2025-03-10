import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  EventCalendarContainer,
  Content,
  Event,
  Events
} from "../../styles/EventCalendarStyles.js";
import Sidebar from "./Sidebar.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentEventSection = () => {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        "https://campus-sync-ez7y.onrender.com/api/v1/events/getall"
      );
      setEvents(response.data.events || []);
    } catch (error) {
      toast.error("Error fetching events");
    }
  };

  useEffect(() => {
    fetchEvents();
    toast.success("Events fetched successfully");
  }, []);

  const formatDateToLocal = (date) => {
    const localDate = new Date(date);
    const day = String(localDate.getDate()).padStart(2, '0'); // Adds leading zero if needed
    const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Adds leading zero and months are 0-indexed
    const year = localDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <EventCalendarContainer>
        <Sidebar />
        <Content>
          <h1>Event Calendar</h1>
          <Events>
            {events.map((event) => (
              <Event key={event._id}>
                <h2>{event.name}</h2>
                <p>{event.description}</p>
                <p>{formatDateToLocal(event.date)}</p> {/* Display the formatted date */}
              </Event>
            ))}
          </Events>
        </Content>
      </EventCalendarContainer>
      <ToastContainer />
    </>
  );
};

export default StudentEventSection;
