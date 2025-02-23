import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import {
  StudentDashboardContainer,
  Content,
  Section,
  SectionTitle,
  AttendanceContainer,
  AttendanceCard,
  CardTitle,
  CardContent,
  Table,
  TableRow,
  TableData,
} from "../../styles/AttendanceStyles";
import Cookies from "js-cookie";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // const token = localStorage.getItem("studenttoken"); // Use 'studenttoken' instead of 'token'
        const token = Cookies.get("studentToken");
        console.log("Token being sent:", token); // Log token to ensure it's being passed

        const response = await axios.get(
          "http://localhost:5000/api/v1/attendance/my-attendance",
          {
            headers: {
              studenttoken: token, // Pass token as 'studenttoken' in headers
            },
          }
        );

        if (response.data.success) {
          console.log("Attendance data:", response.data.attendanceRecords); // Log the response data
          setAttendanceData(response.data.attendanceRecords); // Update the state with the data
          setLoading(false); // Set loading to false after data is fetched
        } else {
          console.log("No attendance records found");
          setLoading(false); // Set loading to false if no records are found
        }
      } catch (error) {
        console.error("Error fetching attendance", error);
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchAttendance();
  }, []);

  if (loading) {
    return <p>Loading attendance data...</p>;
  }

  return (
    <StudentDashboardContainer>
      <Sidebar />
      <Content>
        <Section>
          <SectionTitle>Attendance</SectionTitle>
          <AttendanceContainer>
            <AttendanceCard>
              <CardTitle>Attendance Summary</CardTitle>
              <CardContent>
                <Table>
                  <thead>
                    <TableRow>
                      {/* <TableHeader>Date</TableHeader> */}
                      {/* <TableHeader>Status</TableHeader> */}
                    </TableRow>
                  </thead>
                  <tbody>
                    {attendanceData.length > 0 ? (
                      attendanceData.map((attendance, index) => (
                        <TableRow key={index}>
                          <TableData>{attendance.date}</TableData>
                          <TableData>{attendance.status}</TableData>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableData colSpan="2">
                          No attendance data available
                        </TableData>
                      </TableRow>
                    )}
                  </tbody>
                </Table>
              </CardContent>
            </AttendanceCard>
          </AttendanceContainer>
        </Section>
      </Content>
    </StudentDashboardContainer>
  );
};

export default Attendance;
