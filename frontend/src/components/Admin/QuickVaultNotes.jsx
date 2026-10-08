import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import toastOptions from "../../constants/toast";
import {
  BsClipboard,
  BsCheckCircleFill,
  BsChevronDown,
  BsChevronUp,
} from "react-icons/bs";

const NoteContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #059669;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;

  .title-group {
    display: flex;
    align-items: center;
    gap: 8px;

    .icon {
      font-size: 16px;
    }

    h4 {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .badge {
      font-size: 11px;
      background: #ecfdf5;
      color: #059669;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
    }
  }

  .toggle-btn {
    background: none;
    border: none;
    color: #64748b;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;

    &:hover {
      color: #0f172a;
    }
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 6px;
  margin: 12px 0 10px 0;
  flex-wrap: wrap;

  button {
    background: ${(props) => (props.$active ? "#0f766e" : "#f1f5f9")};
    color: ${(props) => (props.$active ? "#ffffff" : "#475569")};
    border: 1px solid ${(props) => (props.$active ? "#0f766e" : "#e2e8f0")};
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      background: ${(props) => (props.$active ? "#0f766e" : "#e2e8f0")};
    }
  }
`;

const MiniTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-top: 6px;

  th {
    text-align: left;
    font-weight: 600;
    color: #64748b;
    padding: 6px 8px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 11px;
    text-transform: uppercase;
  }

  td {
    padding: 6px 8px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  tr:hover td {
    background: #f8fafc;
  }

  code {
    background: #f1f5f9;
    color: #0f766e;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-weight: 600;
    font-size: 11px;
  }

  button.copy-btn {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    margin-left: 6px;
    vertical-align: middle;
    padding: 2px;

    &:hover {
      color: #059669;
    }
  }
`;

const ROLES_DATA = [
  { role: "Super Admin", category: "admin", pass: "admin123", email: "admin@campus-sync.com" },
  { role: "Other Admins", category: "admin", pass: "admin123", email: "registrar.admin@campus-sync.com" },
  { role: "Librarians", category: "staff", pass: "librarian123", email: "librarian@campussync.edu.in" },
  { role: "Exam Controllers", category: "staff", pass: "examctrl123", email: "examcontroller@campussync.edu.in" },
  { role: "Event Coordinators", category: "staff", pass: "coord123", email: "eventcoordinator@campussync.edu.in" },
  { role: "Student Registrars", category: "staff", pass: "registrar123", email: "registrar@campussync.edu.in" },
  { role: "Teachers (Faculty)", category: "teacher", pass: "teacher123", email: "arjun.sharma.cse@campussync.edu.in" },
  { role: "All Students", category: "student", pass: "student123", email: "priya.sharma1@campussync.edu.in" },
];

const QuickVaultNotes = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeSlice, setActiveSlice] = useState("all");
  const [copiedKey, setCopiedKey] = useState(null);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text}`, { ...toastOptions, autoClose: 1200 });
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const filtered = ROLES_DATA.filter(
    (item) => activeSlice === "all" || item.category === activeSlice
  );

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [activeSlice]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const slicedRoles = filtered.length > pageSize ? filtered.slice((page - 1) * pageSize, page * pageSize) : filtered;

  return (
    <NoteContainer>
      <NoteHeader onClick={() => setIsOpen(!isOpen)}>
        <div className="title-group">
          <span className="icon">📝</span>
          <h4>Quick Note: System Roles & Passwords</h4>
          <span className="badge">Cheat Sheet</span>
        </div>
        <div className="toggle-btn">
          {isOpen ? <BsChevronUp /> : <BsChevronDown />}
          <span>{isOpen ? "Hide" : "Show"}</span>
        </div>
      </NoteHeader>

      {isOpen && (
        <>
          <FilterTabs>
            <button
              $active={activeSlice === "all"}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlice("all");
              }}
            >
              All ({ROLES_DATA.length})
            </button>
            <button
              $active={activeSlice === "admin"}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlice("admin");
              }}
            >
              Admins
            </button>
            <button
              $active={activeSlice === "staff"}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlice("staff");
              }}
            >
              Staff Officers
            </button>
            <button
              $active={activeSlice === "teacher"}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlice("teacher");
              }}
            >
              Faculty
            </button>
            <button
              $active={activeSlice === "student"}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlice("student");
              }}
            >
              Students
            </button>
          </FilterTabs>

          <MiniTable>
            <thead>
              <tr>
                <th>Role</th>
                <th>Password</th>
                <th>Universal / Sample Email</th>
              </tr>
            </thead>
            <tbody>
              {slicedRoles.map((r, i) => (
                <tr key={i}>
                  <td>
                    <strong>{r.role}</strong>
                  </td>
                  <td>
                    <code>{r.pass}</code>
                    <button
                      className="copy-btn"
                      title="Copy Password"
                      onClick={() => copyText(r.pass, `p_${i}`)}
                    >
                      {copiedKey === `p_${i}` ? (
                        <BsCheckCircleFill style={{ color: "#059669" }} />
                      ) : (
                        <BsClipboard />
                      )}
                    </button>
                  </td>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#475569" }}>
                      {r.email}
                    </span>
                    <button
                      className="copy-btn"
                      title="Copy Email"
                      onClick={() => copyText(r.email, `e_${i}`)}
                    >
                      {copiedKey === `e_${i}` ? (
                        <BsCheckCircleFill style={{ color: "#059669" }} />
                      ) : (
                        <BsClipboard />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </MiniTable>

          {filtered.length > 10 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
                paddingTop: "8px",
                borderTop: "1px solid #f1f5f9",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              <span>
                Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    fontSize: "11px",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    opacity: page === 1 ? 0.5 : 1,
                  }}
                >
                  Prev
                </button>
                <span style={{ padding: "3px 6px", fontWeight: 600, color: "#0f172a" }}>
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    fontSize: "11px",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    opacity: page === totalPages ? 0.5 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </NoteContainer>
  );
};

export default QuickVaultNotes;
