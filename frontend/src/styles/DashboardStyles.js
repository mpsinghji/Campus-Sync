import styled from "styled-components";

export const AdminDashboardContainer = styled.div`
  display: flex;
  padding-left: 250px;
  width: 100%;
  min-height: 100vh;
  background-color: #f8fafc;
  box-sizing: border-box;
  font-family: "Inter", "Segoe UI", sans-serif;

  @media screen and (max-width: 768px) {
    padding-left: 0;
  }
`;

export const Content = styled.div`
  flex: 1;
  padding: 28px 36px;
  width: 100%;
  box-sizing: border-box;
`;

export const TopContent = styled.div`
  display: flex;
  gap: 20px;
  flex: 1; 
`;

export const BottomContent = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 20px;
  position: relative; /* Changed from absolute for better layout control */
  left: 0;
  width: 100%; /* Ensure the container spans the full width */
  justify-content: space-between; /* Adjust spacing between graphs */
`;


export const Section = styled.section`
  // margin-bottom: 40px;
  flex: 1; 
`;

export const SectionTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  color: #333333; 
`;

export const CardContainer = styled.div`
  display: flex;
  gap: 20px;
`;

export const Card = styled.div`
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
  flex: 1;
  max-width: 250px;
  &:hover {
    transform: translateY(-5px);
  }
`;

export const CardTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
  color: #007bff; 
`;

export const CardContent = styled.p`
  font-size: 16px;
  color: #555555;
`;

export const StudentDashboardContainer = styled.div`
  display: flex;
  padding-left: 250px;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f8fafc;
  font-family: "Inter", "Segoe UI", sans-serif;

  @media screen and (max-width: 768px) {
    padding-left: 0;
  }
`;

export const TeacherDashboardContainer = styled.div`
  display: flex;
  padding-left: 250px;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f8fafc;
  font-family: "Inter", "Segoe UI", sans-serif;

  @media screen and (max-width: 768px) {
    padding-left: 0;
  }
`;

// New styles for events
export const EventList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const EventItem = styled.li`
  font-family: Arial, sans-serif;
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  background-color: #f9f9f9;
  h3 {
    margin: 0;
    font-size: 1.2em;
  }
  p {
    margin: 5px 0;
  }
`;
