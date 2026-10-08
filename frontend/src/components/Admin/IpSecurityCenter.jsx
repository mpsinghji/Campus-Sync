import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { toast } from "react-toastify";
import { BACKEND_URL } from "../../constants/url";
import {
  BsShieldCheck,
  BsShieldLock,
  BsShieldShaded,
  BsExclamationTriangle,
  BsSearch,
  BsArrowClockwise,
  BsLock,
  BsUnlock,
  BsInfoCircle,
  BsCheckCircleFill,
  BsClockHistory,
} from "react-icons/bs";

const CenterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const MetricCard = styled.div`
  background: #ffffff;
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${(props) => props.$color || "#3b82f6"};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  .value {
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1;
  }

  .sub {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 6px;
  }
`;

const SubTabBar = styled.div`
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 2px;
  flex-wrap: wrap;
`;

const SubTabBtn = styled.button`
  background: ${(props) => (props.$active ? "#0f172a" : "transparent")};
  color: ${(props) => (props.$active ? "#ffffff" : "#475569")};
  border: none;
  padding: 9px 18px;
  border-radius: 8px 8px 0 0;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$active ? "#0f172a" : "#f1f5f9")};
  }
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 280px;

  input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 13px;
    outline: none;

    &:focus {
      border-color: #3b82f6;
    }
  }

  svg {
    position: absolute;
    left: 12px;
    color: #94a3b8;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;

  select {
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #334155;
    background: #fff;
    outline: none;
  }
`;

const ActionButton = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
  border: 1px solid
    ${(props) =>
      props.$variant === "danger"
        ? "#ef4444"
        : props.$variant === "warning"
        ? "#f59e0b"
        : props.$variant === "success"
        ? "#10b981"
        : "#cbd5e1"};
  background: ${(props) =>
    props.$variant === "danger"
      ? "#ef4444"
      : props.$variant === "warning"
      ? "#f59e0b"
      : props.$variant === "success"
      ? "#10b981"
      : "#ffffff"};
  color: ${(props) => (props.$variant ? "#ffffff" : "#334155")};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TableCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;

  thead {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;

    th {
      padding: 12px 16px;
      font-weight: 700;
      color: #475569;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;

      &:hover {
        background: #f8fafc;
      }
    }

    td {
      padding: 14px 16px;
      color: #1e293b;
      vertical-align: middle;
    }
  }
`;

const RiskBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${(props) => {
    switch (props.$level?.toLowerCase()) {
      case "critical":
        return "#fee2e2";
      case "high":
        return "#ffedd5";
      case "medium":
        return "#fef9c3";
      case "low":
        return "#e0f2fe";
      default:
        return "#dcfce7";
    }
  }};
  color: ${(props) => {
    switch (props.$level?.toLowerCase()) {
      case "critical":
        return "#991b1b";
      case "high":
        return "#9a3412";
      case "medium":
        return "#854d0e";
      case "low":
        return "#0369a1";
      default:
        return "#166534";
    }
  }};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: ${(props) => {
    if (props.$status === "banned") return "#7f1d1d";
    if (props.$status === "blocked") return "#f97316";
    if (props.$status === "expired") return "#64748b";
    if (props.$status === "removed") return "#94a3b8";
    return "#10b981";
  }};
  color: #ffffff;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
`;

const ModalBox = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 26px 30px;
  width: 90%;
  max-width: ${(props) => props.$width || "520px"};
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  border: 1px solid #e2e8f0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
  }

  input,
  select,
  textarea {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    color: #0f172a;

    &:focus {
      border-color: #10b981;
    }
  }
`;

const IpSecurityCenter = () => {
  const [subTab, setSubTab] = useState("activity"); // "activity" | "rules" | "audit"
  const [overview, setOverview] = useState({
    totalUniqueIps: 0,
    activeIps: 0,
    blockedIps: 0,
    bannedIps: 0,
    temporaryBlocks: 0,
    rateLimitedIps: 0,
    suspiciousIps: 0,
    securityEventsToday: 0,
    currentSuperAdminIp: "",
  });
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Live Activity State
  const [activity, setActivity] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Active Rules State
  const [rules, setRules] = useState([]);
  const [rulesStatus, setRulesStatus] = useState("all");
  const [loadingRules, setLoadingRules] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Modals
  const [detailsModalIp, setDetailsModalIp] = useState(null);
  const [ipDetails, setIpDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [blockModalData, setBlockModalData] = useState(null); // { ip: "" }
  const [blockDuration, setBlockDuration] = useState("30");
  const [blockReason, setBlockReason] = useState("");
  const [blockNotes, setBlockNotes] = useState("");
  const [confirmSelfBlock, setConfirmSelfBlock] = useState(false);
  const [savingBlock, setSavingBlock] = useState(false);

  const [banModalData, setBanModalData] = useState(null); // { ip: "" }
  const [banReason, setBanReason] = useState("");
  const [banNotes, setBanNotes] = useState("");
  const [banConfirmPhrase, setBanConfirmPhrase] = useState("");
  const [savingBan, setSavingBan] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (subTab === "activity") {
      fetchActivity();
    } else if (subTab === "rules") {
      fetchRules();
    } else if (subTab === "audit") {
      fetchAuditLogs();
    }
  }, [subTab, page, filterStatus, filterRisk, rulesStatus]);

  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      const res = await axios.get(
        `${BACKEND_URL}api/v1/admin/master/ip-security/overview`,
        { withCredentials: true }
      );
      if (res.data?.data) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load IP security overview:", err);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchActivity = async () => {
    try {
      setLoadingActivity(true);
      const res = await axios.get(
        `${BACKEND_URL}api/v1/admin/master/ip-security/activity`,
        {
          params: { page, limit: 10, search, status: filterStatus, risk: filterRisk },
          withCredentials: true,
        }
      );
      if (res.data?.data) {
        setActivity((res.data.data.activity || []).slice(0, 10));
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      toast.error("Failed to fetch IP activity.");
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchRules = async () => {
    try {
      setLoadingRules(true);
      const res = await axios.get(
        `${BACKEND_URL}api/v1/admin/master/ip-security/rules`,
        {
          params: { status: rulesStatus },
          withCredentials: true,
        }
      );
      if (res.data?.data) {
        setRules(res.data.data.rules || []);
      }
    } catch (err) {
      toast.error("Failed to load IP rules.");
    } finally {
      setLoadingRules(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const res = await axios.get(
        `${BACKEND_URL}api/v1/admin/master/ip-security/audit-logs`,
        { withCredentials: true }
      );
      if (res.data?.data) {
        setAuditLogs(res.data.data.logs || []);
      }
    } catch (err) {
      toast.error("Failed to load IP audit logs.");
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleOpenDetails = async (ip) => {
    setDetailsModalIp(ip);
    setLoadingDetails(true);
    try {
      const res = await axios.get(
        `${BACKEND_URL}api/v1/admin/master/ip-security/details/${ip}`,
        { withCredentials: true }
      );
      if (res.data?.data) {
        setIpDetails(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load IP details.");
      setDetailsModalIp(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenBlockModal = (ip) => {
    setBlockModalData({ ip });
    setBlockDuration("30");
    setBlockReason("Suspicious traffic / rate-limit violations");
    setBlockNotes("");
    setConfirmSelfBlock(false);
  };

  const handleExecuteBlock = async (e) => {
    e.preventDefault();
    if (!blockModalData?.ip) return;
    setSavingBlock(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}api/v1/admin/master/ip-security/block`,
        {
          ip: blockModalData.ip,
          durationMinutes: Number(blockDuration),
          reason: blockReason,
          notes: blockNotes,
          confirmSelfBlock,
        },
        { withCredentials: true }
      );
      toast.success(res.data?.message || `IP ${blockModalData.ip} blocked.`);
      setBlockModalData(null);
      fetchOverview();
      if (subTab === "activity") fetchActivity();
      if (subTab === "rules") fetchRules();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to block IP.");
    } finally {
      setSavingBlock(false);
    }
  };

  const handleOpenBanModal = (ip) => {
    setBanModalData({ ip });
    setBanReason("Repeated abuse / unauthorized penetration attempts");
    setBanNotes("");
    setBanConfirmPhrase("");
  };

  const handleExecuteBan = async (e) => {
    e.preventDefault();
    if (!banModalData?.ip) return;
    const requiredPhrase = `BAN ${banModalData.ip.trim()}`;
    if (banConfirmPhrase.trim() !== requiredPhrase) {
      toast.error(`Confirmation mismatch! Type: "${requiredPhrase}"`);
      return;
    }
    setSavingBan(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}api/v1/admin/master/ip-security/ban`,
        {
          ip: banModalData.ip,
          reason: banReason,
          notes: banNotes,
          confirmationPhrase: banConfirmPhrase.trim(),
        },
        { withCredentials: true }
      );
      toast.success(res.data?.message || `IP ${banModalData.ip} permanently banned.`);
      setBanModalData(null);
      fetchOverview();
      if (subTab === "activity") fetchActivity();
      if (subTab === "rules") fetchRules();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to ban IP.");
    } finally {
      setSavingBan(false);
    }
  };

  const handleUnblock = async (ip) => {
    const reason = window.prompt(
      `Enter reason to unblock / restore access for IP ${ip}:`,
      "Manual Superadmin override"
    );
    if (reason === null) return;
    try {
      const res = await axios.post(
        `${BACKEND_URL}api/v1/admin/master/ip-security/unblock`,
        { ip, reason: reason || "Manual unblock" },
        { withCredentials: true }
      );
      toast.success(res.data?.message || `IP ${ip} unblocked.`);
      fetchOverview();
      if (subTab === "activity") fetchActivity();
      if (subTab === "rules") fetchRules();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unblock IP.");
    }
  };

  const handleResetRateLimit = async (ip) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}api/v1/admin/master/ip-security/reset-rate-limit`,
        { ip },
        { withCredentials: true }
      );
      toast.success(res.data?.message || `Rate limit reset for IP ${ip}`);
      if (subTab === "activity") fetchActivity();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset rate limit.");
    }
  };

  return (
    <CenterContainer>
      {/* 1. Overview Statistics */}
      <MetricsGrid>
        <MetricCard $color="#0ea5e9">
          <div className="label">Total Unique IPs</div>
          <div className="value">{overview.totalUniqueIps}</div>
          <div className="sub">Recorded interacting IPs</div>
        </MetricCard>
        <MetricCard $color="#10b981">
          <div className="label">Active IPs (24h)</div>
          <div className="value">{overview.activeIps}</div>
          <div className="sub">Seen in last 24 hours</div>
        </MetricCard>
        <MetricCard $color="#f59e0b">
          <div className="label">Temporarily Blocked</div>
          <div className="value">{overview.blockedIps}</div>
          <div className="sub">Active temporary restrictions</div>
        </MetricCard>
        <MetricCard $color="#ef4444">
          <div className="label">Permanently Banned</div>
          <div className="value">{overview.bannedIps}</div>
          <div className="sub">Survives server restart</div>
        </MetricCard>
        <MetricCard $color="#8b5cf6">
          <div className="label">Rate-Limited IPs</div>
          <div className="value">{overview.rateLimitedIps}</div>
          <div className="sub">Exceeded login/OTP quota</div>
        </MetricCard>
        <MetricCard $color="#ec4899">
          <div className="label">Suspicious IPs</div>
          <div className="value">{overview.suspiciousIps}</div>
          <div className="sub">Path probe / scanning hits</div>
        </MetricCard>
        <MetricCard $color="#6366f1">
          <div className="label">Security Events Today</div>
          <div className="value">{overview.securityEventsToday}</div>
          <div className="sub">Logged authentication & access</div>
        </MetricCard>
        <MetricCard $color="#14b8a6">
          <div className="label">Your Current IP</div>
          <div className="value" style={{ fontSize: "16px", wordBreak: "break-all" }}>
            {overview.currentSuperAdminIp === "127.0.0.1" ? "127.0.0.1 (Localhost)" : (overview.currentSuperAdminIp || "127.0.0.1")}
          </div>
          <div className="sub">Active network connection</div>
        </MetricCard>
      </MetricsGrid>

      {/* 2. Sub-tab Selection */}
      <SubTabBar>
        <SubTabBtn
          $active={subTab === "activity"}
          onClick={() => {
            setSubTab("activity");
            setPage(1);
          }}
        >
          <BsShieldCheck /> Live IP Activity & Risk
        </SubTabBtn>
        <SubTabBtn
          $active={subTab === "rules"}
          onClick={() => {
            setSubTab("rules");
            setPage(1);
          }}
        >
          <BsLock /> Active Firewall Blocks & Rules ({overview.blockedIps + overview.bannedIps})
        </SubTabBtn>
        <SubTabBtn
          $active={subTab === "audit"}
          onClick={() => {
            setSubTab("audit");
            setPage(1);
          }}
        >
          <BsClockHistory /> Immutable Audit Log
        </SubTabBtn>
      </SubTabBar>

      {/* 3. SUBTAB 1: Live IP Activity */}
      {subTab === "activity" && (
        <>
          <ControlBar>
            <SearchBox>
              <BsSearch />
              <input
                type="text"
                placeholder="Search by IP or associated account email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </SearchBox>

            <FilterGroup>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="normal">Normal</option>
                <option value="blocked">Temporarily Blocked</option>
                <option value="banned">Permanently Banned</option>
                <option value="rate_limited">Rate Limited</option>
              </select>

              <select
                value={filterRisk}
                onChange={(e) => {
                  setFilterRisk(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Risk Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
              </select>

              <ActionButton onClick={fetchActivity}>
                <BsArrowClockwise /> Refresh
              </ActionButton>
            </FilterGroup>
          </ControlBar>

          <TableCard>
            <Table>
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Associated Account(s)</th>
                  <th>Last Seen</th>
                  <th>Requests</th>
                  <th>Failed Auth</th>
                  <th>Rate Limits</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingActivity ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      Loading real IP security activity...
                    </td>
                  </tr>
                ) : activity.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      <BsShieldCheck style={{ fontSize: "28px", color: "#10b981", display: "block", margin: "0 auto 8px" }} />
                      No matching IP activity records found.
                    </td>
                  </tr>
                ) : (
                  activity.slice(0, 10).map((item) => (
                    <tr key={item.ip}>
                      <td>
                        <strong>{item.ip}</strong>
                        {item.ip === "127.0.0.1" || item.ip === "::1" ? (
                          <div style={{ marginTop: "4px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            <span
                              style={{
                                background: "#f1f5f9",
                                color: "#475569",
                                fontSize: "10px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontWeight: 700,
                              }}
                            >
                              DEV / LOCALHOST
                            </span>
                            {item.isCurrentSuperAdmin && (
                              <span
                                style={{
                                  background: "#ecfdf5",
                                  color: "#059669",
                                  fontSize: "10px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontWeight: 700,
                                }}
                              >
                                YOU
                              </span>
                            )}
                          </div>
                        ) : item.isCurrentSuperAdmin ? (
                          <span
                            style={{
                              marginLeft: "6px",
                              background: "#ecfdf5",
                              color: "#059669",
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontWeight: 700,
                            }}
                          >
                            YOU
                          </span>
                        ) : null}
                      </td>
                      <td>
                        {item.accounts.length > 0 ? (
                          item.accounts.slice(0, 2).map((acc, idx) => {
                            const email = typeof acc === "object" ? acc.email : acc;
                            const name = typeof acc === "object" ? acc.name : null;
                            const role = typeof acc === "object" ? acc.role : null;
                            return (
                              <div key={idx} style={{ fontSize: "12px", color: "#334155", marginBottom: "4px" }}>
                                <div style={{ fontWeight: 600, color: "#0f172a" }}>
                                  {name || email}
                                </div>
                                {name && <div style={{ fontSize: "11px", color: "#64748b" }}>{email}</div>}
                                {role && (
                                  <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "3px", background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>
                                    {role}
                                  </span>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>No authenticated account</span>
                        )}
                        {item.accounts.length > 2 && (
                          <small style={{ color: "#64748b", display: "block" }}>+{item.accounts.length - 2} more</small>
                        )}
                      </td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {item.lastSeen ? new Date(item.lastSeen).toLocaleString() : "N/A"}
                      </td>
                      <td>
                        <strong>{item.requestCount}</strong>
                      </td>
                      <td style={{ color: item.failedAuthCount > 0 ? "#e11d48" : "#64748b", fontWeight: item.failedAuthCount > 0 ? 700 : 400 }}>
                        {item.failedAuthCount}
                      </td>
                      <td style={{ color: item.rateLimitHits > 0 ? "#d97706" : "#64748b", fontWeight: item.rateLimitHits > 0 ? 700 : 400 }}>
                        {item.rateLimitHits}
                      </td>
                      <td>
                        <RiskBadge $level={item.risk}>{item.risk}</RiskBadge>
                      </td>
                      <td>
                        <StatusBadge $status={item.status}>{item.status}</StatusBadge>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <ActionButton onClick={() => handleOpenDetails(item.ip)} title="Deep-dive inspect IP">
                            Inspect
                          </ActionButton>
                          {item.status === "blocked" || item.status === "banned" ? (
                            <ActionButton $variant="success" onClick={() => handleUnblock(item.ip)}>
                              <BsUnlock /> Unblock
                            </ActionButton>
                          ) : (
                            <>
                              <ActionButton $variant="warning" onClick={() => handleOpenBlockModal(item.ip)}>
                                <BsLock /> Block
                              </ActionButton>
                              <ActionButton $variant="danger" onClick={() => handleOpenBanModal(item.ip)}>
                                Ban
                              </ActionButton>
                            </>
                          )}
                          {item.rateLimitHits > 0 && (
                            <ActionButton onClick={() => handleResetRateLimit(item.ip)} title="Reset rate limit cooldown">
                              Reset
                            </ActionButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableCard>
        </>
      )}

      {/* 4. SUBTAB 2: Active Firewall Blocks & Rules */}
      {subTab === "rules" && (
        <>
          <ControlBar>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>
              Active and Historical Firewall Rules
            </div>
            <FilterGroup>
              <select value={rulesStatus} onChange={(e) => setRulesStatus(e.target.value)}>
                <option value="all">All Rules</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired</option>
                <option value="removed">Removed</option>
              </select>
              <ActionButton onClick={fetchRules}>
                <BsArrowClockwise /> Refresh
              </ActionButton>
            </FilterGroup>
          </ControlBar>

          <TableCard>
            <Table>
              <thead>
                <tr>
                  <th>Target IP / Range</th>
                  <th>Rule Type</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Source</th>
                  <th>Created At</th>
                  <th>Expires At</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingRules ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      Loading firewall rules...
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      <BsCheckCircleFill style={{ fontSize: "28px", color: "#10b981", display: "block", margin: "0 auto 8px" }} />
                      No firewall restriction rules found.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr key={rule._id}>
                      <td>
                        <strong>{rule.ip}</strong>
                        {rule.cidr && <small style={{ color: "#64748b", marginLeft: "4px" }}>({rule.cidr})</small>}
                      </td>
                      <td>
                        <span style={{ textTransform: "capitalize", fontWeight: 600 }}>
                          {rule.type?.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <StatusBadge $status={rule.status}>{rule.status}</StatusBadge>
                      </td>
                      <td style={{ maxWidth: "260px" }}>{rule.reason}</td>
                      <td>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                          {rule.source}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {new Date(rule.createdAt).toLocaleString()}
                      </td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {rule.expiresAt ? new Date(rule.expiresAt).toLocaleString() : "Permanent"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {rule.status === "active" && (
                          <ActionButton $variant="success" onClick={() => handleUnblock(rule.ip)}>
                            <BsUnlock /> Remove Rule
                          </ActionButton>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableCard>
        </>
      )}

      {/* 5. SUBTAB 3: Immutable Audit Log */}
      {subTab === "audit" && (
        <>
          <ControlBar>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>
              Superadmin Immutable Security Audit Trail
            </div>
            <ActionButton onClick={fetchAuditLogs}>
              <BsArrowClockwise /> Refresh
            </ActionButton>
          </ControlBar>

          <TableCard>
            <Table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Type</th>
                  <th>Target IP</th>
                  <th>Executed By</th>
                  <th>Reason</th>
                  <th>Duration / Scope</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {loadingAudit ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      Loading immutable audit trail...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      No administrative security actions recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <strong>{log.action}</strong>
                      </td>
                      <td>
                        <code>{log.targetIp}</code>
                      </td>
                      <td>{log.performedBy}</td>
                      <td>{log.reason}</td>
                      <td>{log.duration || "N/A"}</td>
                      <td>
                        <span style={{ color: log.result === "SUCCESS" ? "#059669" : "#e11d48", fontWeight: 700 }}>
                          {log.result}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableCard>
        </>
      )}

      {/* MODAL: IP Details Deep-dive */}
      {detailsModalIp && (
        <ModalOverlay onClick={() => setDetailsModalIp(null)}>
          <ModalBox $width="720px" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <BsShieldShaded /> Deep-Dive Security Inspection: {detailsModalIp}
            </h3>

            {loadingDetails || !ipDetails ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "30px" }}>Loading IP telemetry...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(detailsModalIp === "127.0.0.1" || detailsModalIp === "::1") && (
                  <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: "10px 14px", borderRadius: "8px", color: "#334155", fontSize: "12px" }}>
                    🖥️ <strong>Localhost / Development Traffic:</strong> This address is local loopback ({detailsModalIp}). In a production deployment behind a reverse proxy (Vercel, Cloudflare, Render), this will resolve to the real external client IP address.
                  </div>
                )}
                {ipDetails.isCurrentSuperAdmin && (
                  <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "10px 14px", borderRadius: "8px", color: "#065f46", fontSize: "12px" }}>
                    ⚠️ <strong>Notice:</strong> This IP corresponds to your current active session connection.
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                    <small style={{ color: "#64748b", fontWeight: 700 }}>RISK SCORE</small>
                    <div><RiskBadge $level={ipDetails.risk}>{ipDetails.risk}</RiskBadge></div>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                    <small style={{ color: "#64748b", fontWeight: 700 }}>STATUS</small>
                    <div><StatusBadge $status={ipDetails.currentStatus}>{ipDetails.currentStatus}</StatusBadge></div>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                    <small style={{ color: "#64748b", fontWeight: 700 }}>TOTAL REQUESTS</small>
                    <div style={{ fontSize: "18px", fontWeight: 800 }}>{ipDetails.stats.totalRequests}</div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, margin: "8px 0" }}>Associated User Accounts</h4>
                  {ipDetails.stats.accounts.length > 0 ? (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {ipDetails.stats.accounts.map((acc, i) => {
                        const email = typeof acc === "object" ? acc.email : acc;
                        const name = typeof acc === "object" ? acc.name : null;
                        const role = typeof acc === "object" ? acc.role : null;
                        return (
                          <span
                            key={i}
                            style={{
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <strong>{name || email}</strong>
                            {name && <small style={{ color: "#64748b" }}>({email})</small>}
                            {role && (
                              <span
                                style={{
                                  background: "#e2e8f0",
                                  padding: "1px 5px",
                                  borderRadius: "3px",
                                  fontSize: "10px",
                                  fontWeight: 600,
                                }}
                              >
                                {role}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>No authenticated account associated.</span>
                  )}
                </div>

                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, margin: "8px 0" }}>Recent Security & HTTP Events (Last 50)</h4>
                  <div style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                    <Table>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Event</th>
                          <th>Method & Path</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ipDetails.recentEvents.map((ev) => (
                          <tr key={ev._id}>
                            <td style={{ fontSize: "11px", color: "#64748b" }}>
                              {new Date(ev.timestamp).toLocaleTimeString()}
                            </td>
                            <td>
                              <span style={{ fontSize: "11px", fontWeight: 700 }}>{ev.eventType}</span>
                            </td>
                            <td style={{ fontSize: "12px" }}>
                              <code>{ev.method} {ev.path}</code>
                            </td>
                            <td>
                              <span style={{ color: ev.statusCode >= 400 ? "#ef4444" : "#10b981", fontWeight: 700 }}>
                                {ev.statusCode}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                  <ActionButton onClick={() => setDetailsModalIp(null)}>Close</ActionButton>
                </div>
              </div>
            )}
          </ModalBox>
        </ModalOverlay>
      )}

      {/* MODAL: Temporary Block */}
      {blockModalData && (
        <ModalOverlay onClick={() => setBlockModalData(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <BsLock /> Apply Temporary IP Block
            </h3>

            <form onSubmit={handleExecuteBlock}>
              <FormGroup>
                <label>Target IP Address</label>
                <input type="text" value={blockModalData.ip} readOnly />
              </FormGroup>

              {blockModalData.ip === overview.currentSuperAdminIp && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "8px", color: "#991b1b", fontSize: "12px", marginBottom: "14px" }}>
                  ⚠️ <strong>DANGER:</strong> This IP matches your current network connection!
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={confirmSelfBlock}
                      onChange={(e) => setConfirmSelfBlock(e.target.checked)}
                      required
                    />
                    I confirm I intentionally want to block my own connection IP.
                  </label>
                </div>
              )}

              <FormGroup>
                <label>Block Duration</label>
                <select value={blockDuration} onChange={(e) => setBlockDuration(e.target.value)}>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="360">6 hours</option>
                  <option value="720">12 hours</option>
                  <option value="1440">24 hours</option>
                  <option value="10080">7 days</option>
                </select>
              </FormGroup>

              <FormGroup>
                <label>Reason for Block</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Excessive failed logins / rate-limit exhaustion"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Internal Audit Notes</label>
                <textarea
                  rows={2}
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  placeholder="Optional context for other administrators"
                />
              </FormGroup>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
                <ActionButton type="button" onClick={() => setBlockModalData(null)}>
                  Cancel
                </ActionButton>
                <ActionButton type="submit" $variant="warning" disabled={savingBlock}>
                  {savingBlock ? "Applying Block..." : "Confirm & Block IP"}
                </ActionButton>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* MODAL: Permanent Ban */}
      {banModalData && (
        <ModalOverlay onClick={() => setBanModalData(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px 0", color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>
              <BsExclamationTriangle /> Permanently Ban IP: {banModalData.ip}
            </h3>

            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
              Permanently banning this IP will drop all traffic from it across the entire platform. This restriction persists across server restarts until manually revoked.
            </p>

            <form onSubmit={handleExecuteBan}>
              <FormGroup>
                <label>Reason for Permanent Ban</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="e.g. Malicious intrusion / abusive DDoS attack"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Internal Audit Notes</label>
                <textarea
                  rows={2}
                  value={banNotes}
                  onChange={(e) => setBanNotes(e.target.value)}
                  placeholder="Case notes or incident tickets"
                />
              </FormGroup>

              <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", padding: "12px", borderRadius: "8px", margin: "14px 0" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#991b1b" }}>
                  To confirm permanent ban, type <code>BAN {banModalData.ip.trim()}</code> below:
                </label>
                <input
                  type="text"
                  style={{ width: "100%", marginTop: "6px", padding: "8px", border: "1px solid #fca5a5", borderRadius: "6px" }}
                  placeholder={`BAN ${banModalData.ip.trim()}`}
                  value={banConfirmPhrase}
                  onChange={(e) => setBanConfirmPhrase(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
                <ActionButton type="button" onClick={() => setBanModalData(null)}>
                  Cancel
                </ActionButton>
                <ActionButton
                  type="submit"
                  $variant="danger"
                  disabled={savingBan || banConfirmPhrase.trim() !== `BAN ${banModalData.ip.trim()}`}
                >
                  {savingBan ? "Applying Ban..." : "Execute Permanent Ban"}
                </ActionButton>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </CenterContainer>
  );
};

export default IpSecurityCenter;
