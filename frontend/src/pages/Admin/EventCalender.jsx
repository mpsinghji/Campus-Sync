import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  EventCalendarContainer,
  Content,
  CalendarContainer,
  Events,
  Event,
  AddEventForm,
  EventInput,
  AddEventButton,
  ErrorText,
} from '../../styles/EventCalendarStyles';
import AdminSidebar from './Sidebar.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACKEND_URL } from '../../constants/url';
const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ name: '', description: '', date: '' });
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/v1/events/getall`);
      setEvents(response.data.events.reverse() || []);
    } catch (error) {
      toast.error('Error fetching events');
    }
  };
  
  useEffect(() => {
    fetchEvents();
    toast.success('Events fetched successfully');
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const addEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}api/v1/events`, newEvent);
      setEvents([...events, response.data.event]);
      setNewEvent({ name: '', description: '', date: '' });
      toast.success('Event added successfully');
    } catch (error) {
      toast.error('Error adding event');
    }
  };

  return (
    <>
    <EventCalendarContainer>
      <AdminSidebar />
      <Content>
        <h1>Events & Calendar</h1>
        <h2>Add New Event</h2>
        <AddEventForm onSubmit={addEvent}>
          <EventInput
            type="text"
            name="name"
            value={newEvent.name}
            onChange={handleInputChange}
            placeholder="Event Name"
          />
          <EventInput
            type="text"
            name="description"
            value={newEvent.description}
            onChange={handleInputChange}
            placeholder="Event Description"
          />
          <EventInput
            type="datetime-local"
            name="date"
            value={newEvent.date}
            onChange={handleInputChange}
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
              <small>{new Date(event.date).toLocaleString()}</small>
            </Event>
          ))}
        </Events>
      </Content>
    </EventCalendarContainer>
    <ToastContainer />
    </>
  );
};

export default EventCalendar;
