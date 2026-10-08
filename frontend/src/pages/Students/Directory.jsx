import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { BACKEND_URL } from "../../constants/url";
import { BsSearch, BsPeople, BsPersonBadge, BsEnvelope, BsTelephone, BsMortarboard } from "react-icons/bs";
import Cookies from "js-cookie";

const DirectoryContainer = styled.div`
  padding: 30px 40px;
  padding-left: 250px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
`;

const HeaderSection = styled.div`
  margin-bottom: 28px;
`;

const PageTitle = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PageSubtitle = styled.p`
  font-size: 15px;
  color: #64748b;
  margin: 0;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 300px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 18px;
  font-size: 15px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const SearchBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #2563eb;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1d4ed8;
  }
`;

const TabButton = styled.button`
  padding: 11px 22px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.$active ? "#0f172a" : "#e2e8f0")};
  color: ${(props) => (props.$active ? "#ffffff" : "#475569")};

  &:hover {
    background: ${(props) => (props.$active ? "#0f172a" : "#cbd5e1")};
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const UserCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }
`;

const AvatarCircle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${(props) => props.$bg || "#e0e7ff"};
  color: ${(props) => props.$color || "#3730a3"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 14px;
`;

const UserName = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  background: ${(props) => props.$bg || "#f1f5f9"};
  color: ${(props) => props.$color || "#475569"};
  margin-bottom: 12px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 6px;

  svg {
    flex-shrink: 0;
    color: #94a3b8;
  }
`;

const StudentDirectory = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDirectory();
  }, []);

  const fetchDirectory = async () => {
    try {
      setLoading(true);
      const [studentsRes, teachersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}api/v1/student/directory`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}api/v1/teacher/directory`, { withCredentials: true }),
      ]);
      setStudents(studentsRes.data?.students || []);
      setTeachers(teachersRes.data?.teachers || []);
    } catch (err) {
      console.error("Error loading campus directory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery.trim().toLowerCase());
  };

  const currentList = activeTab === "students" ? students : teachers;
  const filteredList = currentList.filter((item) => {
    if (!submittedQuery) return true;
    const nameMatch = (item.name || "").toLowerCase().includes(submittedQuery);
    const emailMatch = (item.email || "").toLowerCase().includes(submittedQuery);
    const deptMatch = (item.department || "").toLowerCase().includes(submittedQuery);
    const batchMatch = (item.batch || "").toLowerCase().includes(submittedQuery);
    const rollMatch = (item.rollno || "").toLowerCase().includes(submittedQuery);
    return nameMatch || emailMatch || deptMatch || batchMatch || rollMatch;
  });

  return (
    <DirectoryContainer>
      <HeaderSection>
        <PageTitle>
          <BsPeople style={{ color: "#2563eb" }} /> Campus Directory & Peer Network
        </PageTitle>
        <PageSubtitle>
          Browse fellow enrolled students, batch mates, and academic department faculty members.
        </PageSubtitle>
      </HeaderSection>

      <FilterBar>
        <div style={{ display: "flex", gap: "8px" }}>
          <TabButton
            $active={activeTab === "students"}
            onClick={() => setActiveTab("students")}
          >
            🎓 Classmates & Batch ({students.length})
          </TabButton>
          <TabButton
            $active={activeTab === "teachers"}
            onClick={() => setActiveTab("teachers")}
          >
            👨‍🏫 Faculty Directory ({teachers.length})
          </TabButton>
        </div>

        <SearchWrapper as="form" onSubmit={handleSearchSubmit}>
          <SearchInput
            type="text"
            placeholder={`Search ${activeTab} by name, roll, email, or department...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchBtn type="submit">
            <BsSearch /> Search
          </SearchBtn>
        </SearchWrapper>
      </FilterBar>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading directory records...
        </div>
      ) : filteredList.length === 0 ? (
        <div style={{ padding: "50px", textAlign: "center", color: "#64748b", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
          No records found matching "{submittedQuery}". Try refining your search query.
        </div>
      ) : (
        <CardsGrid>
          {filteredList.map((item) => {
            const initial = (item.name || "?").charAt(0).toUpperCase();
            return (
              <UserCard key={item._id}>
                <AvatarCircle
                  $bg={activeTab === "students" ? "#dbeafe" : "#fef3c7"}
                  $color={activeTab === "students" ? "#1e40af" : "#92400e"}
                >
                  {initial}
                </AvatarCircle>
                <UserName>{item.name || "Unnamed Member"}</UserName>
                <Badge
                  $bg={activeTab === "students" ? "#eff6ff" : "#fefce8"}
                  $color={activeTab === "students" ? "#1d4ed8" : "#854d0e"}
                >
                  {activeTab === "students" ? (item.batch || "Student") : (item.designation || item.responsibility || "Faculty")}
                </Badge>

                {item.rollno && (
                  <DetailRow>
                    <BsPersonBadge /> Roll: {item.rollno}
                  </DetailRow>
                )}
                <DetailRow>
                  <BsMortarboard /> {item.department || "General Academics"}
                </DetailRow>
                {item.email && (
                  <DetailRow>
                    <BsEnvelope /> {item.email}
                  </DetailRow>
                )}
                {item.semester && (
                  <DetailRow>
                    <BsPeople /> {item.semester} (Sec {item.section || "A"})
                  </DetailRow>
                )}
              </UserCard>
            );
          })}
        </CardsGrid>
      )}
    </DirectoryContainer>
  );
};

export default StudentDirectory;
