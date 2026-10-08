import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";
import Cookies from "js-cookie";
import { formatDateDDMMYYYY } from "../../utils/dateUtils";
import {
  BsBook,
  BsSearch,
  BsCheckCircleFill,
  BsClockHistory,
  BsExclamationTriangleFill,
  BsXCircleFill,
  BsPlusCircle,
} from "react-icons/bs";

const PageContainer = styled.div`
  display: flex;
  padding-left: 250px;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f8fafc;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media screen and (max-width: 768px) {
    padding-left: 0;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 30px 36px;
  max-width: 1300px;
  box-sizing: border-box;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    font-size: 26px;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p {
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
  }
`;

const TabNav = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 10px;
`;

const TabButton = styled.button`
  background: ${(props) => (props.$active ? "#1abc9c" : "transparent")};
  color: ${(props) => (props.$active ? "#ffffff" : "#475569")};
  border: none;
  border-radius: 8px;
  padding: 9px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#16a085" : "#f1f5f9")};
  }
`;

const ReminderBanner = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 24px;
  color: #92400e;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 14px;
  width: 100%;
  max-width: 420px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);

  svg {
    color: #94a3b8;
    margin-right: 10px;
  }

  input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 13px;
    color: #1e293b;
  }
`;

// Catalog Grid
const CatalogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
`;

const BookCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.06);
    border-color: #cbd5e1;
  }

  .title {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .author {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 14px;
  }

  .meta-row {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;

    .stock {
      font-size: 12px;
      font-weight: 600;
      color: ${(props) => (props.$available > 0 ? "#059669" : "#dc2626")};
    }

    button {
      background: ${(props) => (props.$available > 0 ? "#1abc9c" : "#94a3b8")};
      color: #ffffff;
      border: none;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: ${(props) => (props.$available > 0 ? "pointer" : "not-allowed")};
      transition: background 0.2s ease;

      &:hover {
        background: ${(props) => (props.$available > 0 ? "#16a085" : "#94a3b8")};
      }
    }
  }
`;

// Borrow Table
const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 14px 18px;
    text-align: left;
    font-size: 13px;
  }

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const StatusChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => props.$bg || "#f1f5f9"};
  color: ${(props) => props.$color || "#475569"};
`;

// Borrow Request Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 26px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
  }

  p {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 18px;
  }

  .form-group {
    margin-bottom: 18px;

    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
    }

    select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      color: #1e293b;
      outline: none;
    }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    button {
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .cancel-btn {
      background: #f1f5f9;
      color: #475569;
      border: none;
    }

    .submit-btn {
      background: #1abc9c;
      color: #ffffff;
      border: none;

      &:hover {
        background: #16a085;
      }
    }
  }
`;

const StudentLibrary = () => {
  const [activeTab, setActiveTab] = useState("myLoans"); // "myLoans" | "catalog"
  const [catalogBooks, setCatalogBooks] = useState([]);
  const [myLoans, setMyLoans] = useState([]);
  const [search, setSearch] = useState("");
  const [overdueCount, setOverdueCount] = useState(0);
  const [totalLateFee, setTotalLateFee] = useState(0);

  // Apply to Borrow Modal
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState(null);
  const [borrowDuration, setBorrowDuration] = useState("14");
  const [submittingBorrow, setSubmittingBorrow] = useState(false);

  // Active student ID
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    try {
      const raw = Cookies.get("studentData");
      if (raw) {
        const parsed = JSON.parse(raw);
        const sid = parsed.user?._id || parsed.user?.id || parsed.id;
        if (sid) setStudentId(sid);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchCatalog();
    if (studentId) {
      fetchStudentLoans();
    }
  }, [studentId]);

  const fetchCatalog = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/library/getall`);
      if (res.data?.books) {
        setCatalogBooks(res.data.books);
      }
    } catch (err) {
      console.error("Error fetching library catalog:", err);
    }
  };

  const fetchStudentLoans = async () => {
    if (!studentId) return;
    try {
      const res = await axios.get(`${BACKEND_URL}api/v1/library/student/${studentId}`);
      if (res.data?.success) {
        setMyLoans(res.data.books || []);
        setOverdueCount(res.data.overdueCount || 0);
        setTotalLateFee(res.data.totalLateFee || 0);
      }
    } catch (err) {
      console.error("Error fetching student loans:", err);
    }
  };

  const handleOpenBorrowModal = (book) => {
    if ((book.availableQuantity || 0) <= 0) {
      toast.error(`"${book.bookname}" is currently out of stock.`);
      return;
    }
    setSelectedBookForBorrow(book);
    setBorrowDuration("14");
  };

  const handleSubmitBorrowRequest = async (e) => {
    e.preventDefault();
    if (!selectedBookForBorrow || !studentId) {
      toast.error("Please login and select a book.");
      return;
    }

    setSubmittingBorrow(true);
    try {
      const res = await axios.post(`${BACKEND_URL}api/v1/library/request`, {
        bookId: selectedBookForBorrow._id,
        studentId: studentId,
        durationDays: parseInt(borrowDuration, 10),
      });

      toast.success(res.data.message || "Borrow request sent to librarian!");
      setSelectedBookForBorrow(null);
      fetchCatalog();
      fetchStudentLoans();
      setActiveTab("myLoans");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit borrow request.");
    } finally {
      setSubmittingBorrow(false);
    }
  };

  const filteredCatalog = catalogBooks.filter(
    (b) =>
      b.bookname?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <Content>
        <HeaderSection>
          <div>
            <h1>
              <BsBook style={{ color: "#1abc9c" }} /> Campus Central Library
            </h1>
            <p>Search academic titles, apply to borrow textbooks, and track your active loans.</p>
          </div>
        </HeaderSection>

        {/* Overdue Alert */}
        {overdueCount > 0 && (
          <ReminderBanner>
            <BsExclamationTriangleFill style={{ fontSize: "20px", color: "#d97706" }} />
            <div>
              <strong>Overdue Notice:</strong> You have {overdueCount} book(s) past the return due date
              (Accrued fine: ₹{totalLateFee}). Please visit the library counter to return them or settle fees.
            </div>
          </ReminderBanner>
        )}

        <TabNav>
          <TabButton
            $active={activeTab === "myLoans"}
            onClick={() => setActiveTab("myLoans")}
          >
            📋 My Loans & Borrow Requests ({myLoans.length})
          </TabButton>
          <TabButton
            $active={activeTab === "catalog"}
            onClick={() => setActiveTab("catalog")}
          >
            📚 Browse & Borrow Catalog ({catalogBooks.length})
          </TabButton>
        </TabNav>

        {/* TAB 1: My Loans & Requests */}
        {activeTab === "myLoans" && (
          <div>
            {myLoans.length > 0 ? (
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Request / Issue Date</th>
                      <th>Return Due Date</th>
                      <th>Status</th>
                      <th>Late Fine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLoans.map((item) => {
                      let statusBadge = (
                        <StatusChip $bg="#dcfce7" $color="#16a34a">
                          <BsCheckCircleFill /> Active Loan
                        </StatusChip>
                      );

                      if (item.status === "Requested") {
                        statusBadge = (
                          <StatusChip $bg="#fef3c7" $color="#b45309">
                            <BsClockHistory /> Pending Librarian Approval
                          </StatusChip>
                        );
                      } else if (item.status === "Returned") {
                        statusBadge = (
                          <StatusChip $bg="#f1f5f9" $color="#64748b">
                            <BsCheckCircleFill /> Returned
                          </StatusChip>
                        );
                      } else if (item.status === "Rejected") {
                        statusBadge = (
                          <StatusChip $bg="#fee2e2" $color="#dc2626" title={item.rejectionReason}>
                            <BsXCircleFill /> Request Declined
                          </StatusChip>
                        );
                      } else if (item.isOverdue) {
                        statusBadge = (
                          <StatusChip $bg="#fee2e2" $color="#dc2626">
                            <BsExclamationTriangleFill /> Overdue ({item.overdueDays}d)
                          </StatusChip>
                        );
                      }

                      return (
                        <tr key={item._id}>
                          <td><strong>{item.bookname}</strong></td>
                          <td>{item.author || "N/A"}</td>
                          <td>
                            {item.issueDate
                              ? formatDateDDMMYYYY(item.issueDate)
                              : formatDateDDMMYYYY(item.createdAt)}
                          </td>
                          <td>
                            {item.dueDate ? formatDateDDMMYYYY(item.dueDate) : "Pending"}
                          </td>
                          <td>{statusBadge}</td>
                          <td>
                            {item.isOverdue ? (
                              <span style={{ color: "#dc2626", fontWeight: 700 }}>
                                ₹{item.calculatedLateFee}
                              </span>
                            ) : (
                              <span style={{ color: "#059669" }}>₹0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableContainer>
            ) : (
              <div
                style={{
                  background: "#ffffff",
                  padding: "40px",
                  borderRadius: "14px",
                  textAlign: "center",
                  border: "1px solid #e2e8f0",
                  color: "#64748b",
                }}
              >
                <BsBook style={{ fontSize: "36px", color: "#cbd5e1", marginBottom: "12px" }} />
                <h3>No borrowed books found</h3>
                <p style={{ marginTop: "6px", fontSize: "13px" }}>
                  Switch to the "Browse & Borrow Catalog" tab above to apply for textbooks!
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Catalog with Apply to Borrow button */}
        {activeTab === "catalog" && (
          <div>
            <SearchBar>
              <BsSearch />
              <input
                type="text"
                placeholder="Search catalog by title, author or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </SearchBar>

            <CatalogGrid>
              {filteredCatalog.map((book) => {
                const isAvailable = (book.availableQuantity || 0) > 0;
                return (
                  <BookCard key={book._id} $available={book.availableQuantity || 0}>
                    <div className="title">{book.bookname}</div>
                    <div className="author">By {book.author}</div>
                    <div className="meta-row">
                      <span className="stock">
                        {isAvailable ? `✓ In Stock (${book.availableQuantity} copies)` : "Out of stock"}
                      </span>
                      <button
                        disabled={!isAvailable}
                        onClick={() => handleOpenBorrowModal(book)}
                      >
                        {isAvailable ? "Apply to Borrow" : "Unavailable"}
                      </button>
                    </div>
                  </BookCard>
                );
              })}
            </CatalogGrid>
          </div>
        )}

        {/* Apply Borrow Modal */}
        {selectedBookForBorrow && (
          <ModalOverlay onClick={() => setSelectedBookForBorrow(null)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <h3>Apply to Borrow Book</h3>
              <p>
                Submit an official request to loan <strong>"{selectedBookForBorrow.bookname}"</strong> by {selectedBookForBorrow.author}.
              </p>

              <form onSubmit={handleSubmitBorrowRequest}>
                <div className="form-group">
                  <label>Loan Duration</label>
                  <select
                    value={borrowDuration}
                    onChange={(e) => setBorrowDuration(e.target.value)}
                  >
                    <option value="7">7 Days (Standard Reading)</option>
                    <option value="14">14 Days (Recommended - 2 Weeks)</option>
                    <option value="21">21 Days (Exam Preparation - 3 Weeks)</option>
                    <option value="30">30 Days (Semester Project)</option>
                  </select>
                </div>

                <div className="actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setSelectedBookForBorrow(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={submittingBorrow}
                  >
                    {submittingBorrow ? "Submitting..." : "Submit Borrow Request"}
                  </button>
                </div>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}
      </Content>
      <ToastContainer />
    </PageContainer>
  );
};

export default StudentLibrary;
