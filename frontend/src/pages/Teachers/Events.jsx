import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import {
  EventCalendarContainer,
  Content,
  Events,
  Event,
  AddEventForm,
  EventInput,
  AddEventButton,
  ErrorText,
} from "../../styles/EventCalendarStyles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EventSection = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    date: "",
  });
  const [error, setError] = useState(null);

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

  const addEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://campus-sync-ez7y.onrender.com/api/v1/events", {
        name: newEvent.name,
        description: newEvent.description,
        date: newEvent.date,
      });
      setEvents([...events, response.data.event]);
      setNewEvent({
        name: "",
        description: "",
        date: "",
      });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error adding event");
      }
    }
  };

  return (
    <>
    <EventCalendarContainer>
      <Sidebar />
      <Content>
        <h1>Events & Calendar</h1>
        <h2>Add New Event</h2>
        <AddEventForm onSubmit={addEvent}>
          <EventInput
            type="text"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            placeholder="Enter Event Name"
          />

          <EventInput
            type="text"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
            placeholder="Enter Event Description"
          />

          <EventInput
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          />

          <AddEventButton type="submit">Add Event</AddEventButton>
        </AddEventForm>
        {error && <ErrorText>{error}</ErrorText>}
        <Events>
          <h2>Events</h2>
          {events.map((event, index) => (
            <Event key={index}>
              <h3>{event.name}</h3>
              <p>{event.description}</p>
              <p>{new Date(event.date).toLocaleDateString()}</p>
            </Event>
          ))}
        </Events>
      </Content>
    </EventCalendarContainer>
    <ToastContainer />
    </>
  );
};

export default EventSection;
