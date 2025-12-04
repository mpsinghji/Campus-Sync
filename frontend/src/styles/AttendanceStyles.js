import styled from 'styled-components';

export const AttendanceContainer = styled.div`
  display: flex;
  padding-left: 40px;
  font-family: "Arial", sans-serif;


  @media screen and (max-width: 768px) {
    flex-direction: column;
    padding-left: 0;
  }
`;

export const Content = styled.div`
  flex: 1;
`;

export const AttendanceContent = styled.div`
  padding: 20px;
`;

export const AttendanceHeader = styled.h2`
  font-size: 30px;
  margin-bottom: 20px;
`;

export const AttendanceList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const AttendanceItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

export const StudentName = styled.span`
  flex: 1;
`;

export const CheckboxLabel = styled.label`
  margin-right: 10px;
`;

export const Divider = styled.hr`
  margin-top: 5px;
  border: 0;
  border-top: 1px solid #ccc;
`;

export const SubmitButton = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;


export const SidebarContainer = styled.div`
  flex: 0 0 250px; /* Sidebar width */
`;

export const AttendanceDate = styled.span`
  font-weight: bold;
`;

export const AttendanceStatus = styled.span`
  margin-left: 10px;
  color: ${({ present }) => (present ? 'green' : 'red')};
`;
export const AttendanceCard = styled.div`
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
  flex: 1;
  max-width: 500px;
  margin: 0 auto;
  &:hover {
    transform: translateY(-5px);
  }
`;
export const CardContent = styled.p`
  font-size: 16px;
  color: #555555;
`;
export const CardTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
  color: #007bff;
`;
export const Section = styled.section`
  margin-bottom: 40px;
  flex: 1;
`;
export const SectionTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  color: #333333; 
`;


// Table Container
export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;  // Ensures horizontal scrolling if the table is too wide
  margin-top: 20px;
`;

// Table styles
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;  // Ensures table borders are merged together
  background-color: #fff;
`;

// Table Header styles
export const TableHeader = styled.thead`
  background-color: #1a252f;  // Blue background for header
  color: #fff;
`;

// Table Row styles
export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;  // Alternating row colors for better readability
  }

  &:hover {
    // background-color: #f1f1f1;  // Hover effect for rows
  }
`;

// Table Header Cell styles
export const TableHeaderCell = styled.th`
  padding: 12px;
  text-align: left;
  font-size: 16px;
  color: #02fdd3;
`;

// Table Body Cell styles
export const TableCell = styled.td`
  padding: 12px;
  text-align: left;
  font-size: 14px;
  border-bottom: 1px solid #ddd;  // Adds a bottom border to each cell
`;

export const TableData = styled.td`
  padding: 8px;
  text-align: center;
  border: 1px solid #ddd;
  font-size: 14px;
  background-color: #f9f9f9;
`;
export const StudentDashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`;