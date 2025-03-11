import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  AnnouncementContainer,
  Content,
  Title,
  AnnouncementForm,
  FormGroup,
  Label,
  TextArea,
  Button,
  AnnouncementList,
  AnnouncementItem,
  AnnouncementContent,
} from "../../styles/AnnouncementStyles";
import { BACKEND_URL } from "../../constants/url";

const CheckAnnouncementSection = () => {
  const [announcement, setAnnouncement] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}api/v1/announcements/getall`
      );
      setAnnouncements(response.data.announcements.reverse());
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    toast.success('Announcements fetched successfully');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BACKEND_URL}api/v1/announcements`,
        {
          announcement: announcement,
        }
      );
      setAnnouncement("");
      fetchAnnouncements();
    } catch (error) {
      toast.error('Error sending announcement');
    }
  };

  return (
    <>
    <AnnouncementContainer>
      <Sidebar />
      <Content>
        <Title>Announcement</Title>
        <AnnouncementForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="announcement">Announcement:</Label>
            <TextArea
              id="announcement"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              required
              rows={4}
              cols={50}
            />
          </FormGroup>
          <Button type="submit">Send Announcement</Button>
        </AnnouncementForm>

        <h2>Announcements</h2>
        <AnnouncementList>
          {announcements.map((announcement) => (
            <AnnouncementItem key={announcement._id}>
              <AnnouncementContent>
                {announcement.announcement}
              </AnnouncementContent>
            </AnnouncementItem>
          ))}
        </AnnouncementList>
      </Content>
    </AnnouncementContainer>
    <ToastContainer />
    </>
  );
};

export default CheckAnnouncementSection;
