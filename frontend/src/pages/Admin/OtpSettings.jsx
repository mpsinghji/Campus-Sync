import React, { useState, useEffect } from "react";
import AdminSidebar from "./Sidebar";
import styled from "styled-components";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../../constants/url";
import { BsShieldLock, BsShieldCheck, BsShieldExclamation, BsKey, BsClockHistory, BsPersonCheck } from "react-icons/bs";

const Container = styled.div`
  display: flex;
  padding-left: 240px;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: "Inter", "Segoe UI", sans-serif;

  @media screen and (max-width: 768px) {
    padding-left: 0;
    flex-direction: column;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 30px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 25px;

  h1 {
    font-size: 26px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 6px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  margin-bottom: 25px;
`;

const StatusBanner = styled.div`
  background: ${(props) => (props.bypass ? "#fef3c7" : "#ecfdf5")};
  border: 1px solid ${(props) => (props.bypass ? "#fde68a" : "#a7f3d0")};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;

  .info {
    display: flex;
    align-items: center;
    gap: 15px;

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: ${(props) => (props.bypass ? "#f59e0b" : "#10b981")};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    h3 {
      margin: 0 0 4px 0;
      font-size: 17px;
      color: ${(props) => (props.bypass ? "#92400e" : "#065f46")};
    }

    p {
      margin: 0;
      font-size: 13px;
      color: ${(props) => (props.bypass ? "#b45309" : "#047857")};
    }
  }
`;

const ToggleSwitch = styled.button`
  background: ${(props) => (props.active ? "#ef4444" : "#10b981")};
  color: white;
  border: none;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  input,
  select {
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #1abc9c;
      box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.15);
    }
  }
`;

const Button = styled.button`
  background: ${(props) => (props.danger ? "#ef4444" : props.secondary ? "#64748b" : "#1ABC9C")};
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  margin-top: 15px;

  th {
    padding: 12px 14px;
    background: #f1f5f9;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
  }

  td {
    padding: 12px 14px;
    font-size: 14px;
    border-bottom: 1px solid #edf2f7;
    color: #334155;
  }
`;

const WarningBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  margin-top: 40px;

  h2 {
    margin-top: 0;
    font-size: 20px;
  }
`;

const OtpSettings = () => {
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    bypassAll: false,
    bypassedEmails: [],
    secretOtp: "999999",
    secretOtpEnabled: true,
    secretOtpExpiresAt: null,
    secretOtpDurationHours: 0,
    isSecretOtpExpired: false,
    sessionTimeoutDays: 7,
    lateFeePerDay: 10,
  });

  // Edit secret OTP form state
  const [newSecretOtp, setNewSecretOtp] = useState("");
  const [durationHours, setDurationHours] = useState(0);
  const [updatingOtp, setUpdatingOtp] = useState(false);

  // Session & Policy configuration
  const [sessionTimeoutDays, setSessionTimeoutDays] = useState(7);
  const [sessionTimeoutUnit, setSessionTimeoutUnit] = useState("days");
  const [sessionTimeoutValue, setSessionTimeoutValue] = useState(7);
  const [lateFeeFlatAfterDue, setLateFeeFlatAfterDue] = useState(500);
  const [lateFeeGraceDays, setLateFeeGraceDays] = useState(7);
  const [lateFeePerDay, setLateFeePerDay] = useState(10);
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Email bypass list state
  const [emailToBypass, setEmailToBypass] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);

  const SUPER_ADMIN = "admin@campus-sync.com";

  useEffect(() => {
    try {
      const adminCookie = Cookies.get("adminData");
      if (adminCookie) {
        const parsed = JSON.parse(adminCookie);
        setCurrentUserEmail(parsed.email || "");
      }
    } catch (e) {
      console.error("Error reading admin cookie:", e);
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}api/v1/security/otp-settings`);
      if (res.data && res.data.settings) {
        setSettings(res.data.settings);
        setNewSecretOtp(res.data.settings.secretOtp || "999999");
        setDurationHours(res.data.settings.secretOtpDurationHours || 0);
        setSessionTimeoutDays(res.data.settings.sessionTimeoutDays || 7);
        setSessionTimeoutUnit(res.data.settings.sessionTimeoutUnit || "days");
        setSessionTimeoutValue(res.data.settings.sessionTimeoutValue || res.data.settings.sessionTimeoutDays || 7);
        setLateFeeFlatAfterDue(res.data.settings.lateFeeFlatAfterDue || 500);
        setLateFeeGraceDays(res.data.settings.lateFeeGraceDays || 7);
        setLateFeePerDay(res.data.settings.lateFeePerDay || 10);
      }
    } catch (err) {
      console.error("Failed to load OTP settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGlobalBypass = async () => {
    const nextBypass = !settings.bypassAll;
    try {
      const res = await axios.put(`${BACKEND_URL}api/v1/security/otp-settings`, {
        adminEmail: currentUserEmail,
        bypassAll: nextBypass,
      });
      toast.success(
        nextBypass
          ? "⚠️ Global OTP Bypass ACTIVATED: All logins will bypass OTP!"
          : "✓ Global OTP Bypass DEACTIVATED: Standard OTP restored!"
      );
      setSettings(res.data.settings);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update global bypass.");
    }
  };

  const handleUpdateSecretOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(newSecretOtp.trim())) {
      toast.error("Secret OTP must be exactly 6 digits.");
      return;
    }

    setUpdatingOtp(true);
    try {
      const res = await axios.put(`${BACKEND_URL}api/v1/security/otp-settings`, {
        adminEmail: currentUserEmail,
        secretOtp: newSecretOtp.trim(),
        secretOtpEnabled: true,
        durationHours: parseInt(durationHours, 10),
      });
      toast.success("Master Secret OTP updated successfully!");
      setSettings(res.data.settings);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update Secret OTP.");
    } finally {
      setUpdatingOtp(false);
    }
  };

  const handleAddBypassedEmail = async (e) => {
    e.preventDefault();
    if (!emailToBypass.trim()) return;

    setAddingEmail(true);
    try {
      const res = await axios.post(`${BACKEND_URL}api/v1/security/bypass-email`, {
        adminEmail: currentUserEmail,
        emailToAdd: emailToBypass.trim(),
      });
      toast.success(res.data.message);
      setEmailToBypass("");
      fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add email to bypass list.");
    } finally {
      setAddingEmail(false);
    }
  };

  const handleUpdateSessionPolicy = async (e) => {
    e.preventDefault();
    setSavingPolicy(true);
    try {
      const val = parseInt(sessionTimeoutValue, 10) || 1;
      const equivDays = sessionTimeoutUnit === "hours" ? Math.max(1, Math.ceil(val / 24)) : val;

      const res = await axios.put(`${BACKEND_URL}api/v1/security/otp-settings`, {
        adminEmail: currentUserEmail,
        sessionTimeoutUnit,
        sessionTimeoutValue: val,
        sessionTimeoutDays: equivDays,
        lateFeeFlatAfterDue: parseInt(lateFeeFlatAfterDue, 10) || 0,
        lateFeeGraceDays: parseInt(lateFeeGraceDays, 10) || 0,
        lateFeePerDay: parseInt(lateFeePerDay, 10) || 0,
      });
      toast.success("Session limit & Late fee policy updated successfully!");
      if (res.data?.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update policies.");
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleRemoveBypassedEmail = async (email) => {
    try {
      const res = await axios.delete(`${BACKEND_URL}api/v1/security/bypass-email`, {
        data: {
          adminEmail: currentUserEmail,
          emailToRemove: email,
        },
      });
      toast.success(res.data.message);
      fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove email.");
    }
  };

  const isAuthorized = currentUserEmail.toLowerCase().trim() === SUPER_ADMIN.toLowerCase();

  return (
    <Container>
      <Content>
        <Header>
          <h1>
            <BsShieldLock style={{ color: "#1abc9c" }} /> Master OTP & Bypass Security Control
          </h1>
          <p>
            Exclusive control console reserved for Super Administrator ({SUPER_ADMIN}).
          </p>
        </Header>

        {!isAuthorized ? (
          <WarningBox>
            <h2>⛔ Access Restricted</h2>
            <p>
              You are logged in as <strong>{currentUserEmail || "Unknown Admin"}</strong>.
            </p>
            <p>
              Only the primary Super Administrator with email <strong>{SUPER_ADMIN}</strong> has
              authorization to toggle OTP bypasses or set Master Secret OTP keys.
            </p>
          </WarningBox>
        ) : (
          <>
            {/* Status Banner with Global Bypass Toggle */}
            <StatusBanner bypass={settings.bypassAll}>
              <div className="info">
                <div className="icon-box">
                  {settings.bypassAll ? <BsShieldExclamation /> : <BsShieldCheck />}
                </div>
                <div>
                  <h3>
                    {settings.bypassAll
                      ? "⚠️ GLOBAL OTP BYPASS IS ACTIVE"
                      : "✓ OTP Verification is Active for All Users"}
                  </h3>
                  <p>
                    {settings.bypassAll
                      ? "Any user can log in without entering a valid email OTP. Fast bypass is enabled site-wide."
                      : "All users must complete 6-digit OTP verification unless individually bypassed or using the Master Secret OTP."}
                  </p>
                </div>
              </div>

              <ToggleSwitch
                active={settings.bypassAll}
                onClick={handleToggleGlobalBypass}
              >
                {settings.bypassAll ? "Disable Global Bypass" : "Enable Global Bypass (Full Site)"}
              </ToggleSwitch>
            </StatusBanner>

            {/* Master Secret OTP Management */}
            <Card>
              <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                <BsKey style={{ color: "#1abc9c", fontSize: "20px" }} /> Master Secret OTP Configuration
              </h3>
              <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#64748b" }}>
                Entering this secret 6-digit code at any OTP login screen immediately authenticates that user, even if they never received an email OTP.
              </p>

              <form onSubmit={handleUpdateSecretOtp}>
                <Grid>
                  <FormGroup>
                    <label>Master Secret OTP (6 Digits) *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={newSecretOtp}
                      onChange={(e) => setNewSecretOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="e.g. 999999"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Validity / Expiry Duration</label>
                    <select
                      value={durationHours}
                      onChange={(e) => setDurationHours(e.target.value)}
                    >
                      <option value={0}>Permanent (No Expiry)</option>
                      <option value={1}>Valid for 1 Hour</option>
                      <option value={6}>Valid for 6 Hours</option>
                      <option value={12}>Valid for 12 Hours</option>
                      <option value={24}>Valid for 24 Hours (1 Day)</option>
                      <option value={72}>Valid for 3 Days</option>
                      <option value={168}>Valid for 7 Days (1 Week)</option>
                    </select>
                  </FormGroup>
                </Grid>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    <strong>Current Active Code:</strong>{" "}
                    <span style={{ fontFamily: "monospace", fontSize: "16px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", color: "#1e293b" }}>
                      {settings.secretOtp || "999999"}
                    </span>
                    {settings.secretOtpExpiresAt && (
                      <span style={{ marginLeft: "10px", color: settings.isSecretOtpExpired ? "#ef4444" : "#059669" }}>
                        ({settings.isSecretOtpExpired ? "EXPIRED" : `Expires: ${new Date(settings.secretOtpExpiresAt).toLocaleString()}`})
                      </span>
                    )}
                  </div>

                  <Button type="submit" disabled={updatingOtp}>
                    {updatingOtp ? "Saving..." : "Update Master Secret OTP"}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Session Timeout Limit & Library Policy Configuration */}
            <Card>
              <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                <BsClockHistory style={{ color: "#1abc9c", fontSize: "20px" }} /> User Session Time Limit & Library Overdue Fee Policy
              </h3>
              <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#64748b" }}>
                Configure global user session validity timeouts and automated overdue fee penalties for library book loans.
              </p>

              <form onSubmit={handleUpdateSessionPolicy}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "18px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                      User Session Time Limit
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="number"
                        min={1}
                        max={sessionTimeoutUnit === "hours" ? 168 : 60}
                        value={sessionTimeoutValue}
                        onChange={(e) => setSessionTimeoutValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                        }}
                        required
                      />
                      <select
                        value={sessionTimeoutUnit}
                        onChange={(e) => setSessionTimeoutUnit(e.target.value)}
                        style={{
                          padding: "10px 14px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          background: "#fff",
                        }}
                      >
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                    <small style={{ color: "#94a3b8", fontSize: "11px", display: "block", marginTop: "4px" }}>
                      Tokens & logins remain active for this duration (e.g. 1 hour or 7 days).
                    </small>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                      Late Fee Flat Penalty After Due Date (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10000}
                      value={lateFeeFlatAfterDue}
                      onChange={(e) => setLateFeeFlatAfterDue(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      required
                    />
                    <small style={{ color: "#94a3b8", fontSize: "11px", display: "block", marginTop: "4px" }}>
                      Flat fee applied after tuition due date passes (set by Superadmin).
                    </small>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                      Late Fee Grace Period (Days)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={lateFeeGraceDays}
                      onChange={(e) => setLateFeeGraceDays(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      required
                    />
                    <small style={{ color: "#94a3b8", fontSize: "11px", display: "block", marginTop: "4px" }}>
                      Days after due date before late fees start.
                    </small>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                      Library Overdue Fine (₹ / Day)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={lateFeePerDay}
                      onChange={(e) => setLateFeePerDay(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      required
                    />
                    <small style={{ color: "#94a3b8", fontSize: "11px", display: "block", marginTop: "4px" }}>
                      Auto-calculated per day overdue for students who haven't returned books.
                    </small>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button type="submit" disabled={savingPolicy}>
                    {savingPolicy ? "Saving Policy..." : "Save Session & Policy Settings"}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Specific User Bypass Management */}
            <Card>
              <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                <BsPersonCheck style={{ color: "#1abc9c", fontSize: "20px" }} /> User-Specific OTP Bypass List
              </h3>
              <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#64748b" }}>
                Grant specific email accounts permanent bypass access without having to disable OTP for the entire site.
              </p>

              <form onSubmit={handleAddBypassedEmail} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <input
                  type="email"
                  placeholder="Enter user email to bypass (student, teacher, or admin)..."
                  value={emailToBypass}
                  onChange={(e) => setEmailToBypass(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  required
                />
                <Button type="submit" disabled={addingEmail}>
                  {addingEmail ? "Adding..." : "+ Add to Bypass List"}
                </Button>
              </form>

              <Table>
                <thead>
                  <tr>
                    <th>Bypassed Email Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.bypassedEmails && settings.bypassedEmails.length > 0 ? (
                    settings.bypassedEmails.map((email) => (
                      <tr key={email}>
                        <td style={{ fontWeight: 600 }}>{email}</td>
                        <td>
                          <span style={{ background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                            OTP Bypassed
                          </span>
                        </td>
                        <td>
                          <Button
                            danger
                            style={{ padding: "4px 10px", fontSize: "12px" }}
                            onClick={() => handleRemoveBypassedEmail(email)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: "25px", color: "#94a3b8" }}>
                        No individual accounts currently bypassed. Use form above to add users.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </>
        )}
      </Content>
      <ToastContainer />
    </Container>
  );
};

export default OtpSettings;
