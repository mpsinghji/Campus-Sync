import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import {
  AnnouncementContainer,
  SidebarContainer,
  Content,
  AnnouncementHeader,
  AnnouncementList,
  AnnouncementItem,
  AnnouncementTitle,
} from '../../styles/AnnouncementStyles'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
    toast.success('Announcements fetched successfully');
  }, []);
  
  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('https://campus-sync-ez7y.onrender.com/api/v1/announcements/getall');
      setAnnouncements(response.data.announcements.reverse());
    } catch (error) {
      toast.error('Error fetching announcements');
    }
  };

  return (
    <>
    <AnnouncementContainer>
      <SidebarContainer>
        <Sidebar />
      </SidebarContainer>
      <Content>
        <AnnouncementHeader>Announcements</AnnouncementHeader>
        <AnnouncementList>
          {announcements.map((announcement) => (
            <AnnouncementItem key={announcement._id}>
              <AnnouncementTitle>{announcement.announcement}</AnnouncementTitle>
            </AnnouncementItem>
          ))}
        </AnnouncementList>
      </Content>
    </AnnouncementContainer>
    <ToastContainer />
    </>
  );
};

export default AnnouncementSection;
