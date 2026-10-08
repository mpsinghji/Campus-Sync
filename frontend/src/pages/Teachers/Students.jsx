import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import {
  StudentsContainer,
  Content,
  StudentsContent,
  StudentsHeader,
  StudentList,
  StudentItem,
  StudentInfo,
  NoStudentsMessage,
} from "../../styles/StudentsStyles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";

const StudentSection = () => {
  const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}api/v1/student`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          setError("Data fetched is not an array.");
        }
      } catch (err) {
        setError("Failed to fetch students.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const batches = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.batch).filter(Boolean)));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesBatch = selectedBatch === "all" || student.batch === selectedBatch;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (student.name || "").toLowerCase().includes(q) ||
        (student.rollno || "").toLowerCase().includes(q) ||
        (student.email || "").toLowerCase().includes(q) ||
        (student.batch || "").toLowerCase().includes(q);
      return matchesBatch && matchesSearch;
    });
  }, [students, selectedBatch, searchQuery]);

  if (loading) {
    return <div>Loading students...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Sidebar />
      <StudentsContainer>
        <Content>
          <StudentsContent>
            <StudentsHeader>Teacher - Students by Batch</StudentsHeader>

            {/* Filter Bar */}
            <div
              style={{
                display: "flex",
                gap: "15px",
                marginBottom: "20px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e0",
                  fontSize: "14px",
                  background: "#fff",
                }}
              >
                <option value="all">All Batches ({students.length} Students)</option>
                {batches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search name, roll no, or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e0",
                  fontSize: "14px",
                  minWidth: "250px",
                  outline: "none",
                }}
              />
            </div>

            {filteredStudents.length > 0 ? (
              <StudentList>
                {filteredStudents.map((student) => (
                  <StudentItem key={student._id}>
                    <StudentInfo>
                      <div>
                        <span className="label">Name:</span> {student.name || "N/A"}
                      </div>
                      <div>
                        <span className="label">Roll Number:</span> {student.rollno}
                      </div>
                      <div>
                        <span className="label">Batch:</span>{" "}
                        <span
                          style={{
                            background: "#EDF2F7",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {student.batch || "General"}
                        </span>
                      </div>
                      <div>
                        <span className="label">Email:</span> {student.email}
                      </div>
                      <div>
                        <span className="label">Phone:</span> {student.mobileno || "N/A"}
                      </div>
                    </StudentInfo>
                  </StudentItem>
                ))}
              </StudentList>
            ) : (
              <NoStudentsMessage>No students found for this filter.</NoStudentsMessage>
            )}
          </StudentsContent>
        </Content>
      </StudentsContainer>
      <ToastContainer />
    </>
  );
};

export default StudentSection;
