import styled from "styled-components";

export const FeesContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
  padding-left: 250px;
  width: 100%;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f8fafc;
`;
  export const FeesHeader = styled.h1`
  align-items: left;
`;

export const FeesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  `;
  
  export const FeesTableHead = styled.thead`
  background-color: #f5f5f5;
`;

export const FeesTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

export const FeesTableHeader = styled.th`
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
`;

export const FeesTableData = styled.td`
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
`;

export const FeesPayButton = styled.button`
  background-color: #007bff;
  border: none;
  color: white;
  padding: 6px 16px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  border-radius: 8px;
  cursor: pointer;
`;