/**
 * ============================================================
 *  SECURE REAL-TIME CHAT APPLICATION — UPGRADED FRONTEND
 *  Student  : Samaila Bello | U22/CPS/1067
 *  Supervisor: Mr Abdullahi Musa Bello
 * ============================================================
 */

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { io } from "socket.io-client";

// ─────────────────────────────────────────────────────────────
// 1. CONFIG
// ─────────────────────────────────────────────────────────────
const SERVER = "https://chat-2-y7px.onrender.com/";
const API    = `${SERVER}/api`;

const token = () => localStorage.getItem("sc_token");

const http = {
  post: (url, body, auth = true) =>
    fetch(`${API}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth && token() ? { Authorization: `Bearer ${token()}` } : {}),
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  get: (url) =>
    fetch(`${API}${url}`, {
      headers: { Authorization: `Bearer ${token()}` },
    }).then((r) => r.json()),

  put: (url, body = {}) =>
    fetch(`${API}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
};

// ─────────────────────────────────────────────────────────────
// 2. AUTH CONTEXT
// ─────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [privateKey, setPK]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u  = localStorage.getItem("sc_user");
    const pk = localStorage.getItem("sc_pk");
    if (u) { setUser(JSON.parse(u)); if (pk) setPK(pk); }
    setLoading(false);
  }, []);

  const register = async (username, email, password) => {
    const res = await http.post("/auth/register", { username, email, password }, false);
    if (res.token) {
      localStorage.setItem("sc_token", res.token);
      localStorage.setItem("sc_user",  JSON.stringify(res.user));
      localStorage.setItem("sc_pk",    res.privateKey);
      setUser(res.user);
      setPK(res.privateKey);
    }
    return res;
  };

  const login = async (email, password) => {
    const res = await http.post("/auth/login", { email, password }, false);
    if (res.token) {
      localStorage.setItem("sc_token", res.token);
      localStorage.setItem("sc_user",  JSON.stringify(res.user));
      const pk = localStorage.getItem("sc_pk");
      if (pk) setPK(pk);
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try { await http.post("/auth/logout", {}); } catch {}
    localStorage.removeItem("sc_token");
    localStorage.removeItem("sc_user");
    setUser(null);
  };

  const toggleAnon = async () => {
    const res = await http.put("/auth/toggle-anonymous");
    if (res.isAnonymous !== undefined) {
      const updated = {
        ...user,
        isAnonymous:    res.isAnonymous,
        anonymousAlias: res.alias || user.anonymousAlias,
        username:       res.isAnonymous
                          ? (res.alias || user.anonymousAlias || user.username)
                          : (user.realUsername || user.username || "User"),
      };
      setUser(updated);
      localStorage.setItem("sc_user", JSON.stringify(updated));
    }
    return res;
  };

  return (
    <AuthCtx.Provider value={{ user, privateKey, loading, register, login, logout, toggleAnon }}>
      {children}
    </AuthCtx.Provider>
  );
}

const useAuth = () => useContext(AuthCtx);

// ─────────────────────────────────────────────────────────────
// 3. DESIGN TOKENS — Warm, Human-Friendly Palette
// ─────────────────────────────────────────────────────────────
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

const C = prefersDark ? {
  // === TELEGRAM DARK THEME ===
  bg:          "#0e1621",           // Main app bg
  bg2:         "#17212b",           // Secondary bg
  bg3:         "#242f3d",           // Tertiary bg
  border:      "#1c2733",           // Borders
  borderLight: "#2b3b4d",           // Lighter borders
  accent:      "#2b5278",           // Telegram blue accent (dark)
  accentHover: "#3a6d99",
  accentGlow:  "rgba(43,82,120,0.3)",
  green:       "#5dc452",           // Telegram green
  greenGlow:   "rgba(93,196,82,0.2)",
  purple:      "#7b2cbf",
  red:         "#e53935",
  orange:      "#ff8c00",
  text:        "#ffffff",           // Primary text
  textSec:     "#7f91a4",           // Secondary text
  muted:       "#5c6e82",           // Muted text
  sent:        "#2b5278",           // Sent message bubble (Telegram dark blue)
  sentText:    "#ffffff",
  recv:        "#182533",           // Received message bubble
  recvText:    "#ffffff",
  recvBorder:  "#1c2733",
  shadow:      "rgba(0,0,0,0.3)",
  cardBg:      "#17212b",           // Card backgrounds
  inputBg:     "#17212b",           // Input backgrounds
  hoverBg:     "#1e2d3d",           // Hover state
  sidebarBg:   "#17212b",           // Sidebar
  statusOnline:"#5dc452",           // Online indicator
  // Telegram-specific extras
  chatPattern: "#0e1621",
  msgSentBg:   "#2b5278",
  msgRecvBg:   "#182533",
  headerBg:    "#17212b",
  searchBg:    "#242f3d",
  listHover:   "#1e2d3d",
  divider:     "#1c2733",
} : {
  // === TELEGRAM LIGHT THEME ===
  bg:          "#e6ebee",           // Main app bg (Telegram light gray)
  bg2:         "#ffffff",
  bg3:         "#f1f1f1",
  border:      "#dfe1e5",           // Borders
  borderLight: "#e8e8e8",
  accent:      "#3390ec",           // Telegram blue
  accentHover: "#2481cc",
  accentGlow:  "rgba(51,144,236,0.15)",
  green:       "#4dcd5e",           // Telegram green
  greenGlow:   "rgba(77,205,94,0.15)",
  purple:      "#7b2cbf",
  red:         "#e53935",
  orange:      "#ff8c00",
  text:        "#000000",           // Primary text
  textSec:     "#707579",           // Secondary text
  muted:       "#8e9297",           // Muted text
  sent:        "#effdde",           // Sent message bubble (Telegram light green)
  sentText:    "#000000",
  recv:        "#ffffff",           // Received message bubble
  recvText:    "#000000",
  recvBorder:  "#dfe1e5",
  shadow:      "rgba(0,0,0,0.04)",
  cardBg:      "#ffffff",
  inputBg:     "#f1f3f4",
  hoverBg:     "#f5f5f5",
  sidebarBg:   "#ffffff",
  statusOnline:"#4dcd5e",
  // Telegram-specific extras
  chatPattern: "#e6ebee",
  msgSentBg:   "#effdde",
  msgRecvBg:   "#ffffff",
  headerBg:    "#ffffff",
  searchBg:    "#f1f3f4",
  listHover:   "#f5f5f5",
  divider:     "#dfe1e5",
};

// ─────────────────────────────────────────────────────────────
// 4. AUTH PAGE — Warm, Inviting Login
// ─────────────────────────────────────────────────────────────
function AuthPage() {
  const { login, register } = useAuth();

  const [tab,        setTab]       = useState("login");
  const [fStep,      setFStep]     = useState("email");
  const [form,       setForm]      = useState({ username: "", email: "", password: "" });
  const [fEmail,     setFEmail]    = useState("");
  const [fOtp,       setFOtp]      = useState("");
  const [fNewPass,   setFNewPass]  = useState("");
  const [fConfirm,   setFConfirm]  = useState("");
  const [resetToken, setResetToken] = useState("");
  const [err,        setErr]       = useState("");
  const [note,       setNote]      = useState("");
  const [busy,       setBusy]      = useState(false);
  const [showPass,   setShowPass]  = useState(false);
  const [showNew,    setShowNew]   = useState(false);
  const [showConf,   setShowConf]  = useState(false);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const getStrength = (p) => {
    if (!p) return { score: 0, label: "", color: "transparent", bars: 0 };
    let score = 0;
    if (p.length >= 6)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if      (score <= 1) return { score, label: "Too weak",  color: C.red,    bars: 1 };
    else if (score === 2) return { score, label: "Weak",      color: "#ff9f43", bars: 2 };
    else if (score === 3) return { score, label: "Fair",      color: "#ffd32a", bars: 3 };
    else if (score === 4) return { score, label: "Strong",    color: C.accent,  bars: 4 };
    else                  return { score, label: "Very strong", color: C.accent, bars: 5 };
  };

  const getReqs = (p) => [
    { label: "At least 6 characters",        met: p.length >= 6 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(p) },
    { label: "At least one number",           met: /[0-9]/.test(p) },
    { label: "At least one special character",met: /[^A-Za-z0-9]/.test(p) },
  ];

  const inp = {
    width: "100%", padding: "14px 18px",
    background: C.inputBg,
    border: `1.5px solid ${C.border}`,
    borderRadius: 14,
    color: C.text, fontFamily: "'Inter', sans-serif",
    fontSize: 15, outline: "none", marginBottom: 14,
    boxSizing: "border-box",
    transition: "border-color 0.25s, box-shadow 0.25s, transform 0.15s",
  };

  const PasswordInput = ({ value, onChange, onKeyDown, show, setShow, placeholder = "Password", name }) => (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <input
        type={show ? "text" : "password"}
        name={name || "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        style={{ ...inp, marginBottom: 0, paddingRight: 50 }}
        onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentGlow}`; e.target.style.transform = "scale(1.01)"; }}
        onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.transform = "scale(1)"; }}
      />
      <button onClick={() => setShow(!show)} type="button" style={{
        position: "absolute", right: 4, top: 4, bottom: 4,
        width: 42, background: "transparent", border: "none",
        color: show ? C.accent : C.muted, cursor: "pointer",
        fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 10,
        transition: "color 0.2s",
      }}>
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );

  const StrengthBar = ({ password }) => {
    if (!password) return null;
    const strength = getStrength(password);
    const reqs     = getReqs(password);
    return (
      <div style={{ marginBottom: 18, marginTop: -2, animation: "fadeIn 0.3s ease" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              flex: 1, height: 5, borderRadius: 10,
              background: i <= strength.bars ? strength.color : C.border,
              transition: "background .3s, transform .2s",
              transform: i <= strength.bars ? "scaleY(1.2)" : "scaleY(1)",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: strength.color, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 700 }}>
            {strength.label}
          </span>
          <span style={{ fontSize: 14, color: C.muted }}>{password.length} chars</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 14px", background: C.bg, borderRadius: 10 }}>
          {reqs.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, color: r.met ? C.accent : C.muted, transition: "color 0.3s" }}>
                {r.met ? "✓" : "○"}
              </span>
              <span style={{ fontSize: 13, color: r.met ? C.text : C.muted, transition: "color 0.3s" }}>
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const submit = async () => {
    setErr(""); setNote(""); setBusy(true);
    try {
      if (tab === "login") {
        const r = await login(form.email, form.password);
        if (!r.token) setErr(r.message || "Login failed");
      } else {
        const r = await register(form.username, form.email, form.password);
        if (r.token) setNote("✅ Welcome aboard! Your account is ready.");
        else setErr(r.message || "Registration failed");
      }
    } catch { setErr("Cannot connect to server. Is it running?"); }
    setBusy(false);
  };

  const sendOTP = async () => {
    if (!fEmail.trim()) { setErr("Enter your email"); return; }
    setErr(""); setBusy(true);
    try {
      const r = await fetch(`${SERVER}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fEmail.trim() }),
      }).then(r => r.json());
      setNote(r.message);
      setFStep("otp");
    } catch { setErr("Failed to send code. Is the server running?"); }
    setBusy(false);
  };

  const verifyOTP = async () => {
    if (!fOtp.trim()) { setErr("Enter the 6-digit code"); return; }
    setErr(""); setBusy(true);
    try {
      const r = await fetch(`${SERVER}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fEmail.trim(), otp: fOtp.trim() }),
      }).then(r => r.json());
      if (r.resetToken) {
        setResetToken(r.resetToken);
        setNote("✅ Code verified! Enter your new password.");
        setFStep("reset");
      } else { setErr(r.message || "Invalid code"); }
    } catch { setErr("Verification failed"); }
    setBusy(false);
  };

  const resetPassword = async () => {
    if (!fNewPass.trim())          { setErr("Enter a new password"); return; }
    if (fNewPass.length < 6)       { setErr("Password must be at least 6 characters"); return; }
    if (fNewPass !== fConfirm)     { setErr("Passwords do not match"); return; }
    setErr(""); setBusy(true);
    try {
      const r = await fetch(`${SERVER}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword: fNewPass }),
      }).then(r => r.json());
      if (r.message.includes("success")) {
        setFStep("done");
        setNote(r.message);
      } else { setErr(r.message); }
    } catch { setErr("Reset failed"); }
    setBusy(false);
  };

  const onEnter = (e) => { if (e.key === "Enter") tab === "forgot" ? (fStep === "email" ? sendOTP() : fStep === "otp" ? verifyOTP() : resetPassword()) : submit(); };

  const steps = ["email", "otp", "reset"];
  const stepLabels = ["Email", "Code", "New Password"];

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: C.bg,
      fontFamily: "'Inter', sans-serif",
      padding: "20px",
    }}>
      <div style={{
        width: 440, padding: "48px 40px",
        background: C.cardBg,
        borderRadius: 24,
        boxShadow: `0 4px 24px ${C.shadow}, 0 0 0 1px ${C.border}`,
        animation: "fadeInScale 0.5s ease",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${C.accent}, ${C.purple}, ${C.green})`,
        }} />

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 24,
            background: C.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, margin: "0 auto 20px",
            boxShadow: `0 12px 32px ${C.accentGlow}`,
            animation: "float 3s ease-in-out infinite",
          }}>💬</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.5px", marginBottom: 6 }}>SecureChat</div>
          <div style={{ fontSize: 14, color: C.muted, fontWeight: 400 }}>Private. Encrypted. Yours.</div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", background: C.bg, borderRadius: 14, padding: 5, marginBottom: 32, gap: 4 }}>
          {["login", "register", "forgot"].map((t) => (
            <button key={t} onClick={() => { setTab(t); setErr(""); setNote(""); setFStep("email"); }} style={{
              flex: 1, padding: "11px 0",
              background: tab === t ? C.cardBg : "none",
              border: "none",
              borderRadius: 12,
              boxShadow: tab === t ? `0 2px 12px ${C.shadow}` : "none",
              color: tab === t ? C.accent : C.muted,
              fontFamily: "'Inter', sans-serif", fontSize: 14,
              fontWeight: tab === t ? 700 : 500,
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}>
              {t === "forgot" ? "Reset" : t}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════
            LOGIN TAB
        ════════════════════════════════ */}
        {tab === "login" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 13, color: C.textSec, fontWeight: 600, marginBottom: 8, display: "block" }}>Email Address</label>
              <input style={inp} name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={set} onKeyDown={onEnter}
                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentGlow}`; e.target.style.transform = "scale(1.01)"; }}
                onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.transform = "scale(1)"; }} />
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 13, color: C.textSec, fontWeight: 600, marginBottom: 8, display: "block" }}>Password</label>
              <PasswordInput
                value={form.password}
                onChange={set}
                onKeyDown={onEnter}
                show={showPass} setShow={setShowPass}
                placeholder="Enter your password"
                name="password"
              />
            </div>
            <div style={{ textAlign: "right", marginBottom: 20 }}>
              <span onClick={() => { setTab("forgot"); setErr(""); setNote(""); }}
                style={{ fontSize: 13, color: C.accent, cursor: "pointer", fontWeight: 500 }}
                onMouseEnter={e => e.target.style.textDecoration = "underline"}
                onMouseLeave={e => e.target.style.textDecoration = "none"}>
                Forgot password?
              </span>
            </div>
            <button onClick={submit} disabled={busy} style={{
              width: "100%", padding: "15px",
              background: busy ? C.bg3 : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
              border: "none", color: busy ? C.muted : "#fff",
              fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700,
              borderRadius: 14, letterSpacing: "0.3px",
              cursor: busy ? "not-allowed" : "pointer",
              boxShadow: busy ? "none" : `0 6px 24px ${C.accentGlow}`,
              transition: "all 0.3s ease",
              transform: busy ? "scale(1)" : "scale(1)",
            }}
              onMouseEnter={e => { if (!busy) e.target.style.transform = "scale(1.02)"; e.target.style.boxShadow = `0 8px 30px ${C.accentGlow}`; }}
              onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = busy ? "none" : `0 6px 24px ${C.accentGlow}`; }}
            >{busy ? "Signing in..." : "Sign In →"}</button>
          </div>
        )}

        {/* ════════════════════════════════
            REGISTER TAB
        ════════════════════════════════ */}
        {tab === "register" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 13, color: C.textSec, fontWeight: 600, marginBottom: 8, display: "block" }}>Username</label>
              <input style={inp} name="username" placeholder="Choose a username"
                value={form.username} onChange={set} onKeyDown={onEnter}
                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentGlow}`; e.target.style.transform = "scale(1.01)"; }}
                onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.transform = "scale(1)"; }} />
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 13, color: C.textSec, fontWeight: 600, marginBottom: 8, display: "block" }}>Email Address</label>
              <input style={inp} name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={set} onKeyDown={onEnter}
                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentGlow}`; e.target.style.transform = "scale(1.01)"; }}
                onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.transform = "scale(1)"; }} />
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 13, color: C.textSec, fontWeight: 600, marginBottom: 8, display: "block" }}>Password</label>
              <PasswordInput
                value={form.password}
                onChange={set}
                onKeyDown={onEnter}
                show={showPass} setShow={setShowPass}
                placeholder="Create a strong password"
                name="password"
              />
            </div>
            <StrengthBar password={form.password} />
            <button onClick={submit} disabled={busy} style={{
              width: "100%", padding: "15px",
              background: busy ? C.bg3 : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
              border: "none", color: busy ? C.muted : "#fff",
              fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700,
              borderRadius: 14, letterSpacing: "0.3px",
              cursor: busy ? "not-allowed" : "pointer",
              boxShadow: busy ? "none" : `0 6px 24px ${C.accentGlow}`,
              transition: "all 0.3s ease",
            }}
              onMouseEnter={e => { if (!busy) e.target.style.transform = "scale(1.02)"; e.target.style.boxShadow = `0 8px 30px ${C.accentGlow}`; }}
              onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = busy ? "none" : `0 6px 24px ${C.accentGlow}`; }}
            >{busy ? "Creating account..." : "Create Account →"}</button>
          </div>
        )}

        {/* ════════════════════════════════
            FORGOT PASSWORD TAB
        ════════════════════════════════ */}
        {tab === "forgot" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            {/* Step indicator */}
            {fStep !== "done" && (
              <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
                {steps.map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: steps.indexOf(fStep) >= i ? `linear-gradient(135deg, ${C.accent}, ${C.purple})` : C.bg3,
                      border: `2px solid ${steps.indexOf(fStep) >= i ? C.accent : C.border}`,
                      color: steps.indexOf(fStep) >= i ? "#fff" : C.muted,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                      transition: "all 0.3s ease",
                    }}>{i + 1}</div>
                    <div style={{ fontSize: 11, color: steps.indexOf(fStep) >= i ? C.accent : C.muted, marginLeft: 8, fontWeight: steps.indexOf(fStep) >= i ? 600 : 400 }}>
                      {stepLabels[i]}
                    </div>
                    {i < 2 && <div style={{ flex: 1, height: 2, background: steps.indexOf(fStep) > i ? `linear-gradient(90deg, ${C.accent}, ${C.purple})` : C.border, margin: "0 10px", borderRadius: 1 }} />}
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Enter Email */}
            {fStep === "email" && (
              <>
                <div style={{ fontSize: 14, color: C.textSec, marginBottom: 20, lineHeight: 1.6 }}>
                  No worries! Enter your email and we'll send you a reset code.
                </div>
                <input style={inp} type="email" placeholder="your@email.com"
                  value={fEmail} onChange={e => setFEmail(e.target.value)} onKeyDown={onEnter}
                  onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentGlow}`; e.target.style.transform = "scale(1.01)"; }}
                  onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.transform = "scale(1)"; }} />
                <button onClick={sendOTP} disabled={busy} style={{
                  width: "100%", padding: "15px",
                  background: busy ? C.bg3 : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                  border: "none", color: busy ? C.muted : "#fff",
                  fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700,
                  borderRadius: 14, cursor: busy ? "not-allowed" : "pointer",
                  boxShadow: busy ? "none" : `0 6px 24px ${C.accentGlow}`,
                  transition: "all 0.3s ease",
                }}
                  onMouseEnter={e => { if (!busy) e.target.style.transform = "scale(1.02)"; }}
                  onMouseLeave={e => e.target.style.transform = "scale(1)"}
                >{busy ? "Sending..." : "Send Reset Code →"}</button>
              </>
            )}

            {/* Step 2: Enter OTP */}
            {fStep === "otp" && (
              <>
                <div style={{ fontSize: 14, color: C.textSec, marginBottom: 4, lineHeight: 1.6 }}>
                  Check your inbox <strong style={{ color: C.text }}>{fEmail}</strong>
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Enter the 6-digit code. It expires in 10 minutes.</div>
                <input style={{ ...inp, fontSize: 32, letterSpacing: "14px", textAlign: "center", fontWeight: 800, color: C.accent, padding: "16px 20px" }}
                  type="text" placeholder="000000" maxLength={6}
                  value={fOtp} onChange={e => setFOtp(e.target.value.replace(/\D/g, ""))} onKeyDown={onEnter}
                  onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentGlow}`; }}
                  onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }} />
                <button onClick={verifyOTP} disabled={busy} style={{
                  width: "100%", padding: "15px",
                  background: busy ? C.bg3 : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                  border: "none", color: busy ? C.muted : "#fff",
                  fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700,
                  borderRadius: 14, cursor: busy ? "not-allowed" : "pointer",
                  boxShadow: busy ? "none" : `0 6px 24px ${C.accentGlow}`,
                  transition: "all 0.3s ease",
                }}>{busy ? "Verifying..." : "Verify Code →"}</button>
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <span onClick={() => { setFStep("email"); setErr(""); setNote(""); }}
                    style={{ fontSize: 13, color: C.accent, cursor: "pointer", fontWeight: 500 }}
                    onMouseEnter={e => e.target.style.textDecoration = "underline"}
                    onMouseLeave={e => e.target.style.textDecoration = "none"}>
                    ← Resend code
                  </span>
                </div>
              </>
            )}

            {/* Step 3: New Password */}
            {fStep === "reset" && (
              <>
                <div style={{ fontSize: 14, color: C.textSec, marginBottom: 20, lineHeight: 1.6 }}>
                  Almost there! Create a strong new password.
                </div>
                <PasswordInput
                  value={fNewPass}
                  onChange={e => setFNewPass(e.target.value)}
                  onKeyDown={onEnter}
                  show={showNew} setShow={setShowNew}
                  placeholder="New password"
                />
                <StrengthBar password={fNewPass} />
                <PasswordInput
                  value={fConfirm}
                  onChange={e => setFConfirm(e.target.value)}
                  onKeyDown={onEnter}
                  show={showConf} setShow={setShowConf}
                  placeholder="Confirm new password"
                />
                {fConfirm && (
                  <div style={{ fontSize: 12, marginBottom: 14, marginTop: -8, color: fNewPass === fConfirm ? C.green : C.red, fontWeight: 600 }}>
                    {fNewPass === fConfirm ? "✓ Passwords match" : "✕ Passwords do not match"}
                  </div>
                )}
                <button onClick={resetPassword} disabled={busy} style={{
                  width: "100%", padding: "15px",
                  background: busy ? C.bg3 : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                  border: "none", color: busy ? C.muted : "#fff",
                  fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700,
                  borderRadius: 14, cursor: busy ? "not-allowed" : "pointer",
                  boxShadow: busy ? "none" : `0 6px 24px ${C.accentGlow}`,
                  transition: "all 0.3s ease",
                }}>{busy ? "Resetting..." : "Reset Password →"}</button>
              </>
            )}

            {/* Step 4: Done */}
            {fStep === "done" && (
              <div style={{ textAlign: "center", padding: "30px 0", animation: "fadeInScale 0.5s ease" }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 800, color: C.accent, marginBottom: 10 }}>
                  Password Reset!
                </div>
                <div style={{ fontSize: 14, color: C.textSec, marginBottom: 28 }}>
                  You can now log in with your new password.
                </div>
                <button onClick={() => { setTab("login"); setFStep("email"); setNote(""); setErr(""); }} style={{
                  width: "100%", padding: "15px",
                  background: C.accent,
                  border: "none", color: "#fff",
                  fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700,
                  borderRadius: 14, cursor: "pointer",
                  boxShadow: `0 6px 24px ${C.accentGlow}`,
                }}>Go to Login →</button>
              </div>
            )}
          </div>
        )}

        {err  && <div style={{ marginTop: 18, padding: "12px 16px", background: `${C.red}12`, border: `1px solid ${C.red}33`, borderRadius: 12, color: C.red, fontSize: 13, fontWeight: 500, animation: "fadeIn 0.3s ease" }}>{err}</div>}
        {note && tab !== "forgot" && <div style={{ marginTop: 18, padding: "12px 16px", background: `${C.green}12`, border: `1px solid ${C.green}33`, borderRadius: 12, color: C.green, fontSize: 13, fontWeight: 500, animation: "fadeIn 0.3s ease" }}>{note}</div>}
        {note && tab === "forgot" && fStep === "otp" && <div style={{ marginTop: 18, padding: "12px 16px", background: `${C.green}12`, border: `1px solid ${C.green}33`, borderRadius: 12, color: C.green, fontSize: 13, fontWeight: 500, animation: "fadeIn 0.3s ease" }}>{note}</div>}
        {note && tab === "forgot" && fStep === "reset" && <div style={{ marginTop: 18, padding: "12px 16px", background: `${C.green}12`, border: `1px solid ${C.green}33`, borderRadius: 12, color: C.green, fontSize: 13, fontWeight: 500, animation: "fadeIn 0.3s ease" }}>{note}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. CHAT PAGE — Real, Human, Beautiful
// ─────────────────────────────────────────────────────────────
function ChatPage() {
  const { user, logout, toggleAnon } = useAuth();

  const [users,        setUsers]      = useState([]);
  const [active,       setActive]     = useState(null);
  const [messages,     setMessages]   = useState([]);
  const [text,         setText]       = useState("");
  const [onlineIds,    setOnlineIds]  = useState([]);
  const [isTyping,     setIsTyping]   = useState(false);
  const [sending,      setSending]    = useState(false);
  const [toast,        setToast]      = useState(null);
  const [editingId,    setEditingId]  = useState(null);
  const [editText,     setEditText]   = useState("");
  const [showProfile,  setShowProfile]  = useState(false);
  const [profileForm,  setProfileForm]  = useState({ username: "", bio: "", avatar: null });
  const [profileBusy,  setProfileBusy]  = useState(false);
  const [currentUser,  setCurrentUser]  = useState(user);
  const [viewingUser,  setViewingUser]  = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchResults,setSearchResults]= useState(null);
  const [searching,    setSearching]    = useState(false);
  const [destructId,   setDestructId]   = useState(null);
  const destructTimer  = useRef(null);
  const [encryptionMsg,  setEncryptionMsg]  = useState(null);
  const [showBlockchain, setShowBlockchain] = useState(false);
  const [blockchainData, setBlockchainData] = useState([]);
  const [chainLoading,   setChainLoading]   = useState(false);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth <= 768);
  const [showSidebar,  setShowSidebar]  = useState(true);

  // ── Phase 1: Group Chat States ────────────────────────────
  const [chatMode,       setChatMode]      = useState("direct"); // "direct" | "group"
  const [groups,         setGroups]        = useState([]);
  const [activeGroup,    setActiveGroup]   = useState(null);
  const [groupMessages,  setGroupMessages] = useState([]);
  const [showCreateGroup,setShowCreateGroup] = useState(false);
  const [groupForm,      setGroupForm]     = useState({ name: "", description: "", members: [] });
  const [groupBusy,      setGroupBusy]     = useState(false);
  // ── Phase 4: Group typing ─────────────────────────────────
  const [groupTypers,    setGroupTypers]   = useState({}); // { userId: senderName }
  const groupTypingTimer = useRef(null);
  // ── Phase 5: Group info panel ────────────────────────────
  const [showGroupInfo,  setShowGroupInfo] = useState(false);

  const fileInputRef   = useRef(null);
  const [recording,    setRecording]    = useState(false);
  const [audioBlob,    setAudioBlob]    = useState(null);
  const mediaRecorder  = useRef(null);
  const audioChunks    = useRef([]);
  const [pinnedMsgs,   setPinnedMsgs]   = useState([]);
  const [showPinned,   setShowPinned]   = useState(false);
  const [replyTo,      setReplyTo]      = useState(null);

  const socket      = useRef(null);
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);
  const screenshotCooldown = useRef(false);
  const msgInputRef = useRef(null);

  const show = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Socket setup ──────────────────────────────────────────
  useEffect(() => {
    socket.current = io(SERVER);
    socket.current.emit("user_connected", user.id);

    socket.current.on("online_users",        (ids) => setOnlineIds(ids));
    socket.current.on("receive_message", (msg) => {
      setMessages((p) => [...p, { ...msg, plaintext: msg.plaintext || null, incoming: true }]);
      const senderId = msg.senderId?.toString();
      if (senderId && active && (active._id === senderId || active.id === senderId)) {
        http.put(`/messages/read/${msg.messageId}`);
        socket.current.emit("message_read", { messageId: msg.messageId, senderId });
      } else if (senderId) {
        setUnreadCounts((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
      }
    });
    socket.current.on("user_typing",         ({ senderId }) => {
      if (active && (active._id === senderId || active.id === senderId)) setIsTyping(true);
    });
    socket.current.on("user_stopped_typing", () => setIsTyping(false));

    socket.current.on("screenshot_alert", ({ at }) => {
      const time = at ? new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
      show(`📸 Screenshot detected by other user${time ? ` at ${time}` : ""}`, "warn");
    });

    socket.current.on("message_deleted", ({ messageId }) => {
      setMessages((p) => p.filter((m) => (m._id || m.messageId) !== messageId));
    });
    socket.current.on("message_edited", ({ messageId, newText }) => {
      setMessages((p) => p.map((m) =>
        (m._id || m.messageId) === messageId
          ? { ...m, plaintext: newText, isEdited: true }
          : m
      ));
    });

    socket.current.on("message_reacted", ({ messageId, reactions }) => {
      setMessages((p) => p.map((m) =>
        (m._id || m.messageId) === messageId ? { ...m, reactions } : m
      ));
    });

    socket.current.on("message_seen", ({ messageId }) => {
      setMessages((p) => p.map((m) =>
        (m._id || m.messageId) === messageId ? { ...m, isRead: true } : m
      ));
    });

    socket.current.on("user_anonymous_changed", ({ userId, isAnonymous, alias }) => {
      setUsers((prev) => prev.map((u) =>
        (u._id === userId || u.id === userId)
          ? { ...u, isAnonymous, anonymousAlias: alias || u.anonymousAlias }
          : u
      ));
    });

    socket.current.on("message_pinned", ({ messageId, plaintext }) => {
      setMessages((p) => p.map((m) =>
        (m._id || m.messageId) === messageId ? { ...m, isPinned: true } : m
      ));
      setPinnedMsgs((p) => {
        const exists = p.find((m) => (m._id || m.messageId) === messageId);
        if (exists) return p;
        return [{ _id: messageId, plaintext }, ...p];
      });
      show("📌 A message was pinned", "ok");
    });

    socket.current.on("message_unpinned", ({ messageId }) => {
      setMessages((p) => p.map((m) =>
        (m._id || m.messageId) === messageId ? { ...m, isPinned: false } : m
      ));
      setPinnedMsgs((p) => p.filter((m) => (m._id || m.messageId) !== messageId));
    });

    socket.current.on("message_self_destruct_set", ({ messageId, selfDestructAt }) => {
      setMessages((p) => p.map((m) =>
        (m._id || m.messageId) === messageId ? { ...m, selfDestructAt } : m
      ));
    });

    // ── Phase 3: Group socket listeners ───────────────────
    socket.current.on("group_message", (data) => {
      const msg = data.message || data;
      const msgId = msg._id || msg.messageId;
      setGroupMessages(p => {
        const exists = p.some(m => (m._id || m.messageId)?.toString() === msgId?.toString());
        if (exists) return p;
        // Convert ObjectId to string before comparing
        const senderId = (msg.sender?._id || msg.sender?.id || msg.senderId)?.toString();
        return [...p, { ...msg, mine: senderId === user.id?.toString() }];
      });
    });
    socket.current.on("group_created", (group) => {
      setGroups(p => {
        // Don't add if already in list (creator already added it from REST response)
        const exists = p.some(g => g._id === group._id);
        if (exists) return p;
        show(`🎉 You were added to group "${group.name}"`, "ok");
        return [...p, group];
      });
    });
    socket.current.on("group_member_left", ({ groupId, userId: leftUserId }) => {
      setGroups(p => p.map(g =>
        g._id === groupId
          ? { ...g, members: (g.members || []).filter(m => (m._id || m) !== leftUserId) }
          : g
      ));
      // Also update activeGroup if it's the one being viewed
      setActiveGroup(prev =>
        prev && prev._id === groupId
          ? { ...prev, members: (prev.members || []).filter(m => (m._id || m) !== leftUserId) }
          : prev
      );
    });

    // ── Phase 4: Group typing ──────────────────────────────
    socket.current.on("group_typing", ({ senderId, senderName }) => {
      setGroupTypers(p => ({ ...p, [senderId]: senderName }));
    });
    socket.current.on("group_stop_typing", ({ senderId }) => {
      setGroupTypers(p => {
        const updated = { ...p };
        delete updated[senderId];
        return updated;
      });
    });

    const onKey = (e) => {
      const isPrintScreen = e.key === "PrintScreen";
      const isMacShot = e.metaKey && e.shiftKey && ["3","4","5","6"].includes(e.key);
      const isWinSnip = e.metaKey && e.shiftKey && e.key === "s";
      if (isPrintScreen || isMacShot || isWinSnip) {
        e.preventDefault();
        fireScreenshot();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      socket.current.off("online_users");
      socket.current.off("receive_message");
      socket.current.off("user_typing");
      socket.current.off("user_stopped_typing");
      socket.current.off("screenshot_alert");
      socket.current.off("message_deleted");
      socket.current.off("message_edited");
      socket.current.off("message_reacted");
      socket.current.off("message_seen");
      socket.current.off("user_anonymous_changed");
      socket.current.off("message_pinned");
      socket.current.off("message_unpinned");
      socket.current.off("message_self_destruct_set");
      socket.current.off("group_message");
      socket.current.off("group_created");
      socket.current.off("group_member_left");
      socket.current.off("group_typing");
      socket.current.off("group_stop_typing");
      socket.current.disconnect();
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    http.get("/users").then((r) => setUsers(r.users || []));
    http.get("/messages/unread-counts").then((r) => {
      if (r.unreadCounts) setUnreadCounts(r.unreadCounts);
    });
    // Phase 2: Load groups on mount
    loadGroups();
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (groupTypingTimer.current) clearTimeout(groupTypingTimer.current);
    };
  }, []);

  const searchMessages = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const activeId = active ? (active._id || active.id) : "";
      const res = await http.get(`/messages/search?q=${encodeURIComponent(searchQuery)}&userId=${activeId}`);
      setSearchResults(res.messages || []);
    } catch { show("Search failed"); }
    setSearching(false);
  };

  const setSelfDestruct = async (msgId, seconds) => {
    try {
      const res = await http.post("/messages/self-destruct", { messageId: msgId, seconds });
      if (res.selfDestructAt) {
        setMessages((p) => p.map((m) =>
          (m._id || m.messageId) === msgId
            ? { ...m, selfDestructAt: res.selfDestructAt }
            : m
        ));
        show(`💥 Message will self-destruct in ${seconds}s`, "ok");
        setDestructId(null);
      }
    } catch { show("Failed to set self-destruct"); }
  };

  useEffect(() => {
    if (!active) return;
    setSearchResults(null);
    setSearchQuery("");
    const activeId = active._id || active.id;
    http.get(`/messages/conversation/${activeId}`)
      .then((r) => {
        const msgs = r.messages || [];
        setMessages(msgs);
        msgs.forEach((msg) => {
          const senderId = msg.sender?._id || msg.sender?.id;
          if (senderId !== user.id && !msg.isRead) {
            http.put(`/messages/read/${msg._id}`);
            socket.current?.emit("message_read", { messageId: msg._id, senderId });
          }
        });
        setUnreadCounts((prev) => ({ ...prev, [activeId]: 0 }));
      });
  }, [active]);

  // ── Phase 3 & 4: Load group messages + reset typing ───────
  useEffect(() => {
    if (!activeGroup) return;
    setGroupMessages([]);
    setGroupTypers({});
    loadGroupMessages(activeGroup._id);
    socket.current?.emit("join_group", { groupId: activeGroup._id, userId: user.id });
  }, [activeGroup]);

  useEffect(() => {
    const hasSelfDestruct = messages.some(m => m.selfDestructAt);
    if (!hasSelfDestruct) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setMessages(prev => {
        const updated = prev.filter(m => {
          if (!m.selfDestructAt) return true;
          const timeLeft = new Date(m.selfDestructAt) - now;
          if (timeLeft <= 0) return false;
          return true;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fireScreenshot = () => {
    if (!active) return;
    if (screenshotCooldown.current) return;
    screenshotCooldown.current = true;
    setTimeout(() => { screenshotCooldown.current = false; }, 5000);
    const rid = active._id || active.id;
    http.post("/messages/screenshot", {
      messageId:  messages[messages.length - 1]?._id,
      receiverId: rid,
    });
    socket.current?.emit("screenshot_detected", { senderId: user.id, receiverId: rid });
    show("📸 Screenshot attempt detected & reported!", "warn");
  };

  const onType = (e) => {
    setText(e.target.value);
    if (!active) return;
    const rid = active._id || active.id;
    socket.current.emit("typing", { receiverId: rid, senderId: user.id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.current.emit("stop_typing", { receiverId: rid, senderId: user.id });
    }, 1500);
  };

  useEffect(() => {
    if (!active) { setPinnedMsgs([]); return; }
    const activeId = active._id || active.id;
    http.get(`/messages/pinned/${activeId}`).then((r) => {
      setPinnedMsgs(r.pinned || []);
    });
    setReplyTo(null);
  }, [active]);

  const sendFile = async (file) => {
    if (!file || !active) return;
    const MAX = 15 * 1024 * 1024;
    if (file.size > MAX) { show("File too large (max 15 MB)"); return; }
    setSending(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(",")[1];
        const mimeType = file.type;
        const isVoice  = mimeType.startsWith("audio/");
        const body = {
          receiverId:    active._id || active.id,
          data:          base64,
          mimeType,
          fileName:      file.name,
          messageType:   isVoice ? "voice" : "file",
          plaintext:     isVoice ? "[Voice Note]" : `[File: ${file.name}]`,
          ...(replyTo ? {
            replyToId:     replyTo.messageId,
            replyToText:   replyTo.plaintext,
            replyToSender: replyTo.senderName,
          } : {}),
        };
        const res = await http.post("/messages/send-file", body);
        if (res.data) {
          setMessages((p) => [...p, {
            ...res.data,
            plaintext:  body.plaintext,
            sender:     { _id: user.id, username: user.username },
            mine:       true,
            attachment: { data: base64, mimeType, fileName: file.name },
          }]);
          setReplyTo(null);
          show(isVoice ? "🎤 Voice note sent!" : "📎 File sent!", "ok");
        } else {
          show(res.message || "Failed to send file");
        }
        setSending(false);
      };
      reader.readAsDataURL(file);
    } catch { show("File send error"); setSending(false); }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) sendFile(file);
    e.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorder.current = mr;
      setRecording(true);
    } catch {
      show("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    setRecording(false);
  };

  const sendVoiceNote = async () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], "voice-note.webm", { type: "audio/webm" });
    await sendFile(file);
    setAudioBlob(null);
  };

  const discardVoice = () => { setAudioBlob(null); setRecording(false); };

  const pinMessage = async (msg) => {
    const msgId = msg._id || msg.messageId;
    try {
      const res = await http.post("/messages/pin", { messageId: msgId });
      if (res.messageId) {
        setMessages((p) => p.map((m) =>
          (m._id || m.messageId) === msgId ? { ...m, isPinned: true } : m
        ));
        setPinnedMsgs((p) => {
          const exists = p.find((m) => (m._id || m.messageId) === msgId);
          return exists ? p : [{ ...msg, _id: msgId }, ...p];
        });
        socket.current.emit("message_pinned", {
          messageId: msgId,
          plaintext: msg.plaintext,
          receiverId: active._id || active.id,
        });
        show("📌 Message pinned", "ok");
      }
    } catch { show("Failed to pin message"); }
  };

  const unpinMessage = async (msgId) => {
    try {
      await http.post("/messages/unpin", { messageId: msgId });
      setMessages((p) => p.map((m) =>
        (m._id || m.messageId) === msgId ? { ...m, isPinned: false } : m
      ));
      setPinnedMsgs((p) => p.filter((m) => (m._id || m.messageId) !== msgId));
      socket.current.emit("message_unpinned", {
        messageId: msgId,
        receiverId: active._id || active.id,
      });
      show("📌 Message unpinned", "ok");
    } catch { show("Failed to unpin message"); }
  };

  const startReply = (msg) => {
    const sName = msg.sender?.username || msg.senderName || "User";
    setReplyTo({
      messageId:  msg._id || msg.messageId,
      plaintext:  msg.plaintext || (msg.messageType === "voice" ? "[Voice Note]" : "[File]"),
      senderName: sName,
    });
    msgInputRef.current?.focus();
  };

  const send = async () => {
    if (!text.trim() || !active || sending) return;
    setSending(true);
    try {
      const msgText = text.trim();
      const res = await http.post("/messages/send", {
        receiverId:      active._id || active.id,
        plaintext:       msgText,
        sentAnonymously: currentUser.isAnonymous,
        ...(replyTo ? {
          replyToId:     replyTo.messageId,
          replyToText:   replyTo.plaintext,
          replyToSender: replyTo.senderName,
        } : {}),
      });
      if (res.data) {
        setMessages((p) => [...p, {
          ...res.data,
          plaintext: msgText,
          sender:    { _id: user.id, username: user.username },
          mine:      true,
          replyTo:   replyTo || null,
        }]);
        setText("");
        setReplyTo(null);
        socket.current.emit("stop_typing", {
          receiverId: active._id || active.id, senderId: user.id,
        });
      } else {
        show(res.message || "Failed to send");
      }
    } catch { show("Connection error"); }
    setSending(false);
  };

  const onEnter = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const deleteMessage = async (msgId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await http.post("/messages/delete", { messageId: msgId });
      setMessages((p) => p.filter((m) => (m._id || m.messageId) !== msgId));
      show("Message deleted", "ok");
      socket.current.emit("message_deleted", {
        messageId:  msgId,
        receiverId: active._id || active.id,
      });
    } catch { show("Failed to delete message"); }
  };

  const saveEdit = async (msgId) => {
    if (!editText.trim()) return;
    try {
      await http.post("/messages/edit", { messageId: msgId, newText: editText.trim() });
      setMessages((p) => p.map((m) =>
        (m._id || m.messageId) === msgId
          ? { ...m, plaintext: editText.trim(), isEdited: true }
          : m
      ));
      socket.current.emit("message_edited", {
        messageId:  msgId,
        newText:    editText.trim(),
        receiverId: active._id || active.id,
      });
      setEditingId(null);
      setEditText("");
      show("Message updated", "ok");
    } catch { show("Failed to edit message"); }
  };

  const verifyChain = async () => {
    if (activeGroup) {
      const r = await http.get(`/groups/${activeGroup._id}/verify-chain`);
      if (r.valid) show(`✅ "${activeGroup.name}" chain OK — ${r.totalBlocks} blocks verified`, "ok");
      else show(`❌ Chain tampered at block #${r.brokenAtBlock}`, "error");
    } else {
      const r = await http.get("/messages/verify-chain");
      if (r.valid) show(`✅ Blockchain OK — ${r.totalBlocks} blocks verified`, "ok");
      else show(`❌ Chain tampered at block #${r.brokenAtBlock}`, "error");
    }
  };

  // ── Phase 2: Group API functions ─────────────────────────
  const loadGroups = async () => {
    try {
      const r = await http.get("/groups");
      if (r.groups) setGroups(r.groups);
    } catch { console.error("Failed to load groups"); }
  };

  const createGroup = async () => {
    if (!groupForm.name.trim()) { show("Group name is required"); return; }
    if (groupForm.members.length === 0) { show("Add at least one member"); return; }
    setGroupBusy(true);
    try {
      const r = await http.post("/groups/create", {
        name:        groupForm.name.trim(),
        description: groupForm.description.trim(),
        members:     groupForm.members,
      });
      if (r.group) {
        setGroups(p => [...p, r.group]);
        setShowCreateGroup(false);
        setGroupForm({ name: "", description: "", members: [] });
        show(`✅ Group "${r.group.name}" created!`, "ok");
        // Auto-open the new group
        setActiveGroup(r.group);
        setActive(null);
        setChatMode("group");
        setGroupMessages([]);
      } else {
        show(r.message || "Failed to create group");
      }
    } catch { show("Failed to create group"); }
    setGroupBusy(false);
  };

  // ── Phase 3: Group message functions ─────────────────────
  const loadGroupMessages = async (groupId) => {
    try {
      const r = await http.get(`/groups/${groupId}/messages`);
      if (r.messages) {
        // Set mine correctly — compare sender._id (ObjectId) with user.id (string)
        const msgs = r.messages.map(msg => ({
          ...msg,
          mine: (msg.sender?._id || msg.sender?.id || msg.senderId)?.toString() === user.id?.toString(),
        }));
        setGroupMessages(msgs);
      }
    } catch { show("Failed to load group messages"); }
  };

  const sendGroupMessage = async () => {
    if (!text.trim() || !activeGroup || sending) return;
    setSending(true);
    const plaintext = text.trim();
    setText("");
    try {
      const r = await http.post(`/groups/message`, {
        groupId:  activeGroup._id,
        plaintext,
      });
      if (r.data) {
        // Add sender's message immediately — don't wait for socket
        // (socket may delay or miss if not yet in room)
        setGroupMessages(p => {
          const msgId = r.data._id?.toString();
          const exists = p.some(m => (m._id || m.messageId)?.toString() === msgId);
          if (exists) return p; // socket already delivered it
          return [...p, { ...r.data, mine: true, plaintext }];
        });
        // Stop typing indicator
        socket.current.emit("group_stop_typing", {
          groupId:  activeGroup._id,
          senderId: user.id,
        });
        if (groupTypingTimer.current) clearTimeout(groupTypingTimer.current);
      } else {
        show(r.message || "Failed to send");
        setText(plaintext);
      }
    } catch {
      show("Failed to send group message");
      setText(plaintext);
    }
    setSending(false);
  };

  // ── Phase 4: Group typing emit ────────────────────────────
  const onGroupType = (e) => {
    setText(e.target.value);
    if (!activeGroup) return;
    socket.current.emit("group_typing", {
      groupId:    activeGroup._id,
      senderId:   user.id,
      senderName: currentUser.isAnonymous ? currentUser.anonymousAlias : currentUser.username,
    });
    if (groupTypingTimer.current) clearTimeout(groupTypingTimer.current);
    groupTypingTimer.current = setTimeout(() => {
      socket.current.emit("group_stop_typing", {
        groupId:  activeGroup._id,
        senderId: user.id,
      });
    }, 1500);
  };

  const leaveGroup = async (groupId) => {
    try {
      const r = await http.post(`/groups/${groupId}/leave`, {});
      if (r.message) {
        setGroups(p => p.filter(g => g._id !== groupId));
        if (activeGroup?._id === groupId) {
          setActiveGroup(null);
          setShowGroupInfo(false);
          setChatMode("group");
          setGroupMessages([]);
          setGroupTypers({});
        }
        show(r.message || "Left group", "ok");
        // Emit socket event so other members know
        socket.current.emit("leave_group", { groupId });
      } else {
        show(r.message || "Failed to leave group");
      }
    } catch { show("Failed to leave group"); }
  };

  const loadBlockchain = async () => {
    setChainLoading(true);
    setShowBlockchain(true);
    try {
      const url = activeGroup ? `/groups/${activeGroup._id}/blockchain` : "/messages/blockchain";
      const r = await http.get(url);
      setBlockchainData(r.chain || []);
    } catch { show("Failed to load blockchain"); }
    setChainLoading(false);
  };

  const reactToMessage = async (msgId, emoji) => {
    try {
      const res = await http.post("/messages/react", { messageId: msgId, emoji });
      if (res.reactions) {
        setMessages((p) => p.map((m) =>
          (m._id || m.messageId) === msgId ? { ...m, reactions: res.reactions } : m
        ));
        socket.current.emit("message_reacted", {
          messageId:  msgId,
          reactions:  res.reactions,
          receiverId: active._id || active.id,
        });
      }
    } catch { show("Failed to react"); }
  };

  const handleAnon = async () => {
    const r = await toggleAnon();
    if (r.isAnonymous !== undefined) {
      const updated = {
        ...currentUser,
        isAnonymous:    r.isAnonymous,
        anonymousAlias: r.alias || currentUser.anonymousAlias,
        username:       r.isAnonymous
                          ? (r.alias || currentUser.anonymousAlias || currentUser.username)
                          : (currentUser.realUsername || currentUser.username),
      };
      setCurrentUser(updated);
      localStorage.setItem("sc_user", JSON.stringify(updated));
    }
    show(r.message || "Anonymous toggled", "ok");
    socket.current.emit("anonymous_mode_changed", {
      userId:      user.id,
      isAnonymous: r.isAnonymous,
      alias:       r.alias,
    });
  };

  const openProfile = () => {
    setProfileForm({
      username: currentUser.realUsername || currentUser.username || "",
      bio:      currentUser.bio || "",
      avatar:   currentUser.avatar || null,
    });
    setShowProfile(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { show("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 300;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
        else       { if (h > MAX) { w = w * MAX / h; h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        setProfileForm((p) => ({ ...p, avatar: compressed }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!profileForm.username.trim()) { show("Username cannot be empty"); return; }
    setProfileBusy(true);
    try {
      const res = await http.put("/users/update-profile", {
        username: profileForm.username.trim(),
        bio:      profileForm.bio || "",
        avatar:   profileForm.avatar || null,
      });
      if (res.user) {
        const updated = {
          ...currentUser,
          username:     res.user.username,
          realUsername: res.user.realUsername || res.user.username,
          bio:          res.user.bio,
          avatar:       res.user.avatar,
        };
        setCurrentUser(updated);
        localStorage.setItem("sc_user", JSON.stringify(updated));
        show("✅ Profile updated!", "ok");
        setShowProfile(false);
      } else {
        show(res.message || "Update failed");
      }
    } catch (e) {
      console.error(e);
      show("Failed to connect to server");
    }
    setProfileBusy(false);
  };

  const uid      = (u)   => u?._id || u?.id;
  const isOnline = (u)   => onlineIds.includes(uid(u));
  const isActive = (u)   => uid(active) === uid(u);
  const isMine   = (msg) => (uid(msg.sender) === user.id || msg.mine);
  const fmt      = (d)   => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const name     = (u)   => (u?.isAnonymous ? u?.anonymousAlias : u?.username) || "User";
  const initial  = (u)   => { const n = name(u); return n && n.length > 0 ? n[0].toUpperCase() : "U"; };
  const avatar   = (u)   => u?.avatar || currentUser?.avatar || null;

  const toastColor = toast?.type === "ok" ? C.green : toast?.type === "warn" ? C.orange : C.red;
  const toastBg = toast?.type === "ok" ? `${C.green}12` : toast?.type === "warn" ? `${C.orange}12` : `${C.red}12`;
  const toastBorder = toast?.type === "ok" ? `${C.green}33` : toast?.type === "warn" ? `${C.orange}33` : `${C.red}33`;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>

      {/* Sidebar overlay */}
      <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} style={{ display: "none" }} />

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 999,
          padding: "16px 22px", background: C.cardBg,
          border: `1px solid ${toastBorder}`,
          borderRadius: 16,
          color: toastColor, fontSize: 14, maxWidth: 380,
          boxShadow: `0 8px 32px ${C.shadow}, 0 0 0 1px ${toastBorder}`,
          animation: "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          fontWeight: 500,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>
            {toast.type === "ok" ? "✓" : toast.type === "warn" ? "⚠" : "✕"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* ══════════════════════════════════════════
          ENCRYPTION VISUALIZER MODAL
      ══════════════════════════════════════════ */}
      {encryptionMsg && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.88)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, backdropFilter: "blur(8px)",
        }} onClick={e => { if (e.target === e.currentTarget) setEncryptionMsg(null); }}>
          <div style={{
            width: "100%", maxWidth: 900, background: C.cardBg,
            borderRadius: 24,
            boxShadow: `0 0 80px ${C.accent}08`,
            animation: "fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            maxHeight: "90vh", overflowY: "auto",
            border: `1px solid ${C.border}`,
          }}>
            <div style={{ padding: "28px 32px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.headerBg, zIndex: 10, borderRadius: "24px 24px 0 0" }}>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 800, color: C.accent }}>🔐 Encryption Visualizer</div>
                <div style={{ fontSize: 15, color: C.muted, marginTop: 6 }}>AES-256-CBC + RSA-2048 · Block #{encryptionMsg.blockIndex}</div>
              </div>
              <button onClick={() => setEncryptionMsg(null)} style={{ background: "none", border: "none", color: C.muted, fontSize: 28, cursor: "pointer", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                onMouseEnter={e => { e.target.style.background = C.bg3; e.target.style.color = C.text; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.muted; }}>✕</button>
            </div>

            <div style={{ padding: "36px 40px" }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, color: C.accent, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
                  <span style={{ background: C.accent, color: "#fff", width: 36, height: 36, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>1</span>
                  Original Message
                </div>
                <div style={{ padding: "16px 18px", background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, fontSize: 18, color: C.text, wordBreak: "break-all", lineHeight: 1.7 }}>
                  {encryptionMsg.plaintext || <span style={{ color: C.muted, fontStyle: "italic" }}>Plaintext not available</span>}
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: 32, color: C.muted, marginBottom: 28, opacity: 0.5 }}>↓</div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, color: C.orange, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
                  <span style={{ background: C.orange, color: "#000", width: 36, height: 36, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>2</span>
                  AES-256-CBC Encrypted
                </div>
                <div style={{ padding: "16px 18px", background: C.bg, borderRadius: 14, border: `1px solid ${C.orange}33`, fontSize: 14, color: C.orange, wordBreak: "break-all", lineHeight: 1.8, fontFamily: "'Inter', sans-serif" }}>
                  {encryptionMsg.encryptedContent || "N/A"}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  <div style={{ flex: 1, padding: "16px 20px", background: C.bg, borderRadius: 14, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 16, color: C.muted, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>IV</div>
                    <div style={{ fontSize: 18, color: C.orange, wordBreak: "break-all", fontFamily: "'Inter', sans-serif" }}>{encryptionMsg.iv || "N/A"}</div>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: 32, color: C.muted, marginBottom: 28, opacity: 0.5 }}>↓</div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, color: C.purple, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
                  <span style={{ background: C.purple, color: "#fff", width: 36, height: 36, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>3</span>
                  RSA-2048 Encrypted Key
                </div>
                <div style={{ padding: "16px 18px", background: C.bg, borderRadius: 14, border: `1px solid ${C.purple}33`, fontSize: 14, color: C.purple, wordBreak: "break-all", lineHeight: 1.8, fontFamily: "'Inter', sans-serif" }}>
                  {encryptionMsg.encryptedAESKey ? encryptionMsg.encryptedAESKey.substring(0, 120) + "..." : "N/A"}
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: 32, color: C.muted, marginBottom: 28, opacity: 0.5 }}>↓</div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 14, color: C.accent, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
                  <span style={{ background: C.accent, color: "#fff", width: 36, height: 36, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>4</span>
                  Blockchain Block #{encryptionMsg.blockIndex}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ padding: "14px 16px", background: C.bg, borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 16, color: C.muted, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>SHA-256 Hash</div>
                    <div style={{ fontSize: 18, color: C.accent, wordBreak: "break-all", fontFamily: "'Inter', sans-serif" }}>{encryptionMsg.messageHash || "N/A"}</div>
                  </div>
                  <div style={{ padding: "14px 16px", background: C.bg, borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 16, color: C.muted, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Previous Block Hash</div>
                    <div style={{ fontSize: 18, color: C.muted, wordBreak: "break-all", fontFamily: "'Inter', sans-serif" }}>{encryptionMsg.previousHash || "0000000000000000"}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24, padding: "16px 18px", background: C.bg, borderRadius: 14, border: `1px solid ${C.accent}22` }}>
                <div style={{ fontSize: 18, color: C.accent, fontWeight: 700, marginBottom: 16 }}>🔒 Security Summary</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {[
                    { label: "AES-256-CBC", desc: "Message encrypted" },
                    { label: "RSA-2048", desc: "Key protected" },
                    { label: "SHA-256", desc: "Hash verified" },
                    { label: encryptionMsg.isVerified ? "✓ Verified" : "⚠ Unverified", desc: "Blockchain status" },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: "14px 20px", background: C.headerBg, borderRadius: 12, border: `1px solid ${C.border}`, flex: "1 1 auto", minWidth: 120 }}>
                      <div style={{ fontSize: 15, color: C.accent, fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 14, color: C.muted }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          BLOCKCHAIN EXPLORER MODAL
      ══════════════════════════════════════════ */}
      {showBlockchain && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.88)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, backdropFilter: "blur(8px)",
        }} onClick={e => { if (e.target === e.currentTarget) setShowBlockchain(false); }}>
          <div style={{
            width: "100%", maxWidth: 950, background: C.cardBg,
            borderRadius: 24,
            boxShadow: `0 0 80px ${C.purple}08`,
            animation: "fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            maxHeight: "90vh", display: "flex", flexDirection: "column",
            border: `1px solid ${C.border}`,
          }}>
            <div style={{ padding: "28px 32px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, position: "sticky", top: 0, background: C.headerBg, zIndex: 10, borderRadius: "24px 24px 0 0" }}>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 800, color: C.purple }}>
                  ⛓ Blockchain Explorer{activeGroup ? ` — ${activeGroup.name}` : ""}
                </div>
                <div style={{ fontSize: 15, color: C.muted, marginTop: 6 }}>
                  {chainLoading ? "Loading..." : `${blockchainData.length} blocks · SHA-256 Hash Chain`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={verifyChain} style={{
                  padding: "10px 18px", background: "transparent",
                  border: `1.5px solid ${C.accent}`, color: C.accent,
                  fontFamily: "'Inter', sans-serif", fontSize: 12,
                  letterSpacing: "1px", cursor: "pointer", borderRadius: 10,
                  fontWeight: 600, transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.target.style.background = C.accent; e.target.style.color = "#fff"; }}
                  onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.accent; }}>✓ Verify All</button>
                <button onClick={() => setShowBlockchain(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 28, cursor: "pointer", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.target.style.background = C.bg3; e.target.style.color = C.text; }}
                  onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.muted; }}>✕</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              {[
                { label: "Total Blocks", value: blockchainData.length, color: C.purple },
                { label: "Algorithm", value: "SHA-256", color: C.accent },
                { label: "Status", value: "Verified ✓", color: C.green },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, padding: "18px 20px", borderRight: i < 2 ? `1px solid ${C.border}` : "none", textAlign: "center" }}>
                  <div style={{ fontSize: 14, color: C.muted, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 26, color: s.color, fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ overflowY: "auto", padding: "28px 32px", flex: 1 }}>
              {chainLoading ? (
                <div style={{ textAlign: "center", color: C.muted, padding: 50, fontSize: 20 }}>
                  <div className="spinner" style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTopColor: C.purple, borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
                  Loading blockchain...
                </div>
              ) : blockchainData.length === 0 ? (
                <div style={{ textAlign: "center", color: C.muted, padding: 50, fontSize: 20 }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
                  No blocks yet — send a message first!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {blockchainData.map((block, i) => (
                    <div key={block.blockIndex} style={{ display: "flex", gap: 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 18, flexShrink: 0 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: `linear-gradient(135deg, ${C.purple}, ${C.accent})`, boxShadow: `0 0 16px ${C.purple}55`, flexShrink: 0, marginTop: 26 }} />
                        {i < blockchainData.length - 1 && (
                          <div style={{ width: 2, flex: 1, background: `linear-gradient(180deg, ${C.purple}44, transparent)`, minHeight: 24 }} />
                        )}
                      </div>
                      <div style={{
                        flex: 1, padding: "24px 28px", marginBottom: 16,
                        background: C.bg, borderRadius: 14,
                        border: `1px solid ${C.border}`,
                        borderLeft: `4px solid ${C.purple}`,
                        transition: "all 0.2s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.transform = "translateX(4px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateX(0)"; }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 800, color: C.purple }}>
                            Block #{block.blockIndex}
                          </span>
                          <span style={{ fontSize: 14, color: C.muted, background: C.bg3, padding: "6px 14px", borderRadius: 8 }}>
                            {new Date(block.blockTimestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div>
                            <span style={{ fontSize: 10, color: C.muted, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>Hash: </span>
                            <span style={{ fontSize: 20, color: C.accent, fontFamily: "'Inter', sans-serif", wordBreak: "break-all" }}>{block.messageHash}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: 10, color: C.muted, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>Prev: </span>
                            <span style={{ fontSize: 20, color: C.muted, fontFamily: "'Inter', sans-serif", wordBreak: "break-all" }}>
                              {block.previousHash === "0000000000000000" ? "0000000000000000 (Genesis)" : block.previousHash}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                            <span style={{ fontSize: 18, color: C.muted }}>From: <span style={{ color: C.text, fontWeight: 600 }}>{block.sender?.toString().slice(-6) || "N/A"}</span></span>
                            {block.receiver ? (
                              <span style={{ fontSize: 18, color: C.muted }}>→ To: <span style={{ color: C.text, fontWeight: 600 }}>{block.receiver.toString().slice(-6)}</span></span>
                            ) : (
                              <span style={{ fontSize: 18, color: C.purple }}>👥 Group message</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PROFILE VIEWER MODAL
      ══════════════════════════════════════════ */}
      {viewingUser && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, backdropFilter: "blur(8px)",
        }} onClick={e => { if (e.target === e.currentTarget) setViewingUser(null); }}>
          <div style={{
            width: 400, background: C.cardBg,
            borderRadius: 24,
            boxShadow: `0 0 80px ${C.accent}08`,
            animation: "fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}>
            <div style={{
              width: "100%", height: 200,
              background: viewingUser.avatar
                ? "transparent"
                : `linear-gradient(135deg, ${C.bg3}, ${C.purple}33)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              {viewingUser.avatar ? (
                <img src={viewingUser.avatar} alt="profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.85)" }} />
              ) : (
                <div style={{ fontSize: 80, color: `${C.purple}44`, fontFamily: "'Inter', sans-serif", fontWeight: 800 }}>
                  {initial(viewingUser)}
                </div>
              )}
              <button onClick={() => setViewingUser(null)} style={{
                position: "absolute", top: 14, right: 14,
                background: "rgba(0,0,0,0.5)", border: `1px solid ${C.border}`,
                color: C.text, fontSize: 20, width: 36, height: 36,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 12, backdropFilter: "blur(8px)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.target.style.background = "rgba(0,0,0,0.7)"; }}
                onMouseLeave={e => { e.target.style.background = "rgba(0,0,0,0.5)"; }}>✕</button>
              {isOnline(viewingUser) && (
                <div style={{
                  position: "absolute", bottom: 14, left: 14,
                  padding: "5px 14px", background: `${C.green}22`,
                  border: `1.5px solid #2ecc71`, color: "#2ecc71", fontSize: 12,
                  borderRadius: 20, fontWeight: 600, backdropFilter: "blur(8px)",
                }}>● Online</div>
              )}
            </div>

            <div style={{ padding: "24px 28px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, marginTop: -36 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                  background: `${C.purple}22`, border: `4px solid ${C.cardBg}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 800, color: C.purple,
                  boxShadow: `0 4px 20px ${C.shadow}`,
                }}>
                  {viewingUser.avatar
                    ? <img src={viewingUser.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : initial(viewingUser)
                  }
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>
                    {name(viewingUser)}
                  </div>
                  {viewingUser.isAnonymous && (
                    <div style={{ fontSize: 12, color: C.purple, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600, marginTop: 2 }}>Anonymous</div>
                  )}
                </div>
              </div>

              {viewingUser.bio ? (
                <div style={{
                  padding: "16px 18px", background: C.bg,
                  borderRadius: 14,
                  fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 20,
                  border: `1px solid ${C.border}`,
                }}>
                  "{viewingUser.bio}"
                </div>
              ) : (
                <div style={{ fontSize: 14, color: C.muted, fontStyle: "italic", marginBottom: 20 }}>
                  No bio yet.
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                <div style={{
                  flex: 1, padding: "14px", background: C.bg,
                  borderRadius: 14, textAlign: "center",
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 14, color: C.muted, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Status</div>
                  <div style={{ fontSize: 20, color: isOnline(viewingUser) ? "#2ecc71" : C.muted, fontWeight: 700 }}>
                    {isOnline(viewingUser) ? "● Online" : "Offline"}
                  </div>
                  {!isOnline(viewingUser) && viewingUser.lastSeen && (
                    <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
                      Last seen {new Date(viewingUser.lastSeen).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
                <div style={{
                  flex: 1, padding: "14px", background: C.bg,
                  borderRadius: 14, textAlign: "center",
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 14, color: C.muted, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Identity</div>
                  <div style={{ fontSize: 20, color: viewingUser.isAnonymous ? C.purple : C.accent, fontWeight: 700 }}>
                    {viewingUser.isAnonymous ? "🕵️ Anonymous" : "👤 Public"}
                  </div>
                </div>
              </div>

              <button onClick={() => { setActive(viewingUser); setActiveGroup(null); setViewingUser(null); }} style={{
                width: "100%", padding: "14px",
                background: C.accent, border: "none",
                borderRadius: 14,
                color: "#fff", fontFamily: "'Inter', sans-serif",
                fontSize: 15, fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 6px 24px ${C.accentGlow}`,
                transition: "all 0.3s ease",
              }}
                onMouseEnter={e => { e.target.style.transform = "scale(1.02)"; e.target.style.boxShadow = `0 8px 30px ${C.accentGlow}`; }}
                onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = `0 4px 16px ${C.accentGlow}`; }}
              >
                💬 Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PROFILE EDIT MODAL
      ══════════════════════════════════════════ */}
      {showProfile && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, backdropFilter: "blur(8px)",
        }} onClick={e => { if (e.target === e.currentTarget) setShowProfile(false); }}>
          <div style={{
            width: 460, background: C.cardBg,
            borderRadius: 24,
            boxShadow: `0 0 60px ${C.accent}08`,
            padding: "40px 36px",
            animation: "fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>
              Edit Profile
            </div>
            <div style={{ fontSize: 13, color: C.muted, letterSpacing: "1px", marginBottom: 32 }}>
              Update your name, photo & bio
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
              <div style={{
                width: 88, height: 88, flexShrink: 0,
                background: C.bg, border: `3px solid ${C.accent}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 700, color: C.accent,
                overflow: "hidden", position: "relative", borderRadius: "50%",
              }}>
                {profileForm.avatar
                  ? <img src={profileForm.avatar} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initial(currentUser)
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: C.text, marginBottom: 10, fontWeight: 600 }}>Profile Picture</div>
                <label style={{
                  display: "inline-block", padding: "10px 18px",
                  background: C.bg, border: `1.5px solid ${C.accent}`,
                  color: C.accent, fontSize: 13, cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", fontWeight: 600,
                  borderRadius: 12, transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.target.style.background = C.accent; e.target.style.color = "#fff"; }}
                  onMouseLeave={e => { e.target.style.background = C.bg; e.target.style.color = C.accent; }}>
                  📷 Choose Photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange}
                    style={{ display: "none" }} />
                </label>
                {profileForm.avatar && (
                  <button onClick={() => setProfileForm(p => ({ ...p, avatar: null }))}
                    style={{ marginLeft: 10, padding: "10px 14px", background: "transparent", border: `1.5px solid ${C.red}`, color: C.red, fontSize: 13, cursor: "pointer", borderRadius: 12, fontWeight: 600, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.target.style.background = `${C.red}15`; }}
                    onMouseLeave={e => { e.target.style.background = "transparent"; }}>Remove</button>
                )}
                <div style={{ fontSize: 14, color: C.muted, marginTop: 8 }}>JPG, PNG — max 5MB</div>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 14, color: C.muted, letterSpacing: "1px", marginBottom: 8, display: "block", fontWeight: 600 }}>Username</label>
              <input
                value={profileForm.username}
                onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))}
                placeholder="Your username"
                style={{
                  width: "100%", padding: "14px 16px", boxSizing: "border-box",
                  background: C.bg, border: `1.5px solid ${C.border}`,
                  color: C.text, fontFamily: "'Inter', sans-serif",
                  fontSize: 15, outline: "none", borderRadius: 14,
                  transition: "all 0.25s",
                }}
                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentGlow}`; }}
                onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 14, color: C.muted, letterSpacing: "1px", marginBottom: 8, display: "block", fontWeight: 600 }}>
                Bio <span style={{ color: C.muted, fontSize: 11 }}>({profileForm.bio.length}/120)</span>
              </label>
              <textarea
                value={profileForm.bio}
                onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value.slice(0, 120) }))}
                placeholder="Tell others about yourself..."
                rows={3}
                style={{
                  width: "100%", padding: "14px 16px", boxSizing: "border-box",
                  background: C.bg, border: `1.5px solid ${C.border}`,
                  color: C.text, fontFamily: "'Inter', sans-serif",
                  fontSize: 14, outline: "none", resize: "none", lineHeight: 1.6,
                  borderRadius: 14, transition: "all 0.25s",
                }}
                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentGlow}`; }}
                onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowProfile(false)} style={{
                flex: 1, padding: "14px",
                background: "transparent", border: `1.5px solid ${C.border}`,
                color: C.muted, fontFamily: "'Inter', sans-serif",
                fontSize: 14, cursor: "pointer", borderRadius: 14,
                fontWeight: 600, transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.target.style.borderColor = C.text; e.target.style.color = C.text; }}
                onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}>Cancel</button>
              <button onClick={saveProfile} disabled={profileBusy} style={{
                flex: 2, padding: "14px",
                background: profileBusy ? C.bg3 : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                border: "none",
                color: profileBusy ? C.muted : "#fff",
                fontFamily: "'Inter', sans-serif", fontSize: 14,
                fontWeight: 700, borderRadius: 14,
                cursor: profileBusy ? "not-allowed" : "pointer",
                boxShadow: profileBusy ? "none" : `0 6px 24px ${C.accentGlow}`,
                transition: "all 0.3s ease",
              }}
                onMouseEnter={e => { if (!profileBusy) { e.target.style.transform = "scale(1.02)"; e.target.style.boxShadow = `0 8px 30px ${C.accentGlow}`; }}}
                onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = profileBusy ? "none" : `0 6px 24px ${C.accentGlow}`; }}>
                {profileBusy ? "Saving..." : "Save Profile →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SIDEBAR — Beautiful & Human
      ══════════════════════════════════════════ */}
      <aside className={isMobile ? (showSidebar ? "sidebar-mobile-show" : "sidebar-mobile-hidden") : ""}
        style={{
          width: 480, display: "flex", flexDirection: "column",
          background: C.sidebarBg, borderRight: `1px solid ${C.border}`,
          flexShrink: 0, height: "100vh",
        }}>
        {/* Header */}
        <div style={{ padding: "24px 24px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 20,
            display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>💬</span> SecureChat
          </div>

          {/* User badge */}
          <div onClick={openProfile} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", background: C.bg2, borderRadius: 16,
            cursor: "pointer", border: `1.5px solid ${C.border}`,
            transition: "all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `0 4px 20px ${C.accentGlow}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{
              width: 56, height: 56, flexShrink: 0, overflow: "hidden",
              background: currentUser.isAnonymous ? `${C.purple}22` : `${C.accent}15`,
              border: `2.5px solid ${currentUser.isAnonymous ? C.purple : C.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700,
              color: currentUser.isAnonymous ? C.purple : C.accent,
              borderRadius: "50%",
              transition: "all 0.3s",
            }}>
              {currentUser.avatar
                ? <img src={currentUser.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initial(currentUser)
              }
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 17, color: C.text, fontWeight: 700, wordBreak: "break-word" }}>
                {name(currentUser)}
              </div>
              {currentUser.bio && <div style={{ fontSize: 13, color: C.muted, wordBreak: "break-word", marginTop: 3, lineHeight: 1.4 }}>{currentUser.bio}</div>}
            </div>
            <span style={{ fontSize: 14, color: C.muted, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = C.accent}
              onMouseLeave={e => e.target.style.color = C.muted}>✏️</span>
          </div>

          {/* Anonymous toggle */}
          <button onClick={handleAnon} style={{
            width: "100%", marginTop: 12, padding: "12px",
            background: currentUser.isAnonymous ? `${C.purple}15` : C.bg2,
            border: `1.5px solid ${currentUser.isAnonymous ? C.purple : C.border}`,
            color: currentUser.isAnonymous ? C.purple : C.muted,
            fontFamily: "'Inter', sans-serif", fontSize: 14,
            letterSpacing: "1px", fontWeight: 600, cursor: "pointer",
            borderRadius: 14, transition: "all 0.25s",
          }}
            onMouseEnter={e => { e.target.style.borderColor = currentUser.isAnonymous ? C.purple : C.accent; e.target.style.color = currentUser.isAnonymous ? C.purple : C.accent; }}
            onMouseLeave={e => { e.target.style.borderColor = currentUser.isAnonymous ? C.purple : C.border; e.target.style.color = currentUser.isAnonymous ? C.purple : C.muted; }}>
            {currentUser.isAnonymous ? "👤 Exit Anonymous Mode" : "🕵️ Go Anonymous"}
          </button>
        </div>

        {/* ── Phase 1: Chat Mode Tabs ── */}
        <div style={{
          display: "flex", margin: "10px 14px 0",
          background: C.bg3, borderRadius: 12, padding: 4,
          flexShrink: 0,
        }}>
          {[
            { key: "direct", label: "💬 Direct" },
            { key: "group",  label: "👥 Groups" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setChatMode(tab.key)} style={{
              flex: 1, padding: "9px 0",
              background: chatMode === tab.key ? C.bg2 : "none",
              border: "none", borderRadius: 9,
              boxShadow: chatMode === tab.key ? `0 1px 4px ${C.shadow}` : "none",
              color: chatMode === tab.key ? C.text : C.muted,
              fontFamily: "'Inter', sans-serif",
              fontSize: 13, fontWeight: chatMode === tab.key ? 600 : 400,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* User List — only shown in Direct mode */}
        {chatMode === "direct" && (
          <>
        <div style={{ padding: "14px 20px 8px", fontSize: 12, letterSpacing: "2px", color: C.muted, textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, display: "inline-block" }} />
          Online · {users.filter(u => isOnline(u)).length}
          <span style={{ marginLeft: 8, width: 8, height: 8, borderRadius: "50%", background: C.muted, display: "inline-block" }} />
          Offline · {users.filter(u => !isOnline(u)).length}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px" }}>
          {users.length === 0 && (
            <div style={{ padding: "32px 20px", fontSize: 15, color: C.muted, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>👥</div>
              No other users yet
            </div>
          )}

          {/* Online users */}
          {users.filter(u => isOnline(u)).length > 0 && (
            <div style={{ padding: "10px 8px 4px", fontSize: 12, letterSpacing: "2px", color: C.green, textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
              Online
            </div>
          )}
          {users.filter(u => isOnline(u)).map(u => (
            <div key={uid(u)} onClick={() => { setActive(u); setActiveGroup(null); if (isMobile) setShowSidebar(false); }} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "16px 18px", cursor: "pointer",
              background: isActive(u) ? `${C.accent}10` : "transparent",
              borderRadius: 14, margin: "3px 0",
              transition: "all 0.2s ease",
              border: `1.5px solid ${isActive(u) ? `${C.accent}33` : "transparent"}`,
            }}
              onMouseEnter={e => { if (!isActive(u)) { e.currentTarget.style.background = C.listHover; e.currentTarget.style.transform = "translateX(2px)"; }}}
              onMouseLeave={e => { if (!isActive(u)) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}}
            >
              <div style={{
                width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                background: u.avatar ? "transparent" : `${C.accent}15`,
                border: `2.5px solid ${isActive(u) ? C.accent : C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 700, color: C.accent,
                overflow: "hidden", position: "relative",
                transition: "all 0.3s",
              }}>
                {u.avatar
                  ? <img src={u.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initial(u)
                }
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#2ecc71", border: `2.5px solid ${C.sidebarBg}`,
                  boxShadow: `0 0 8px #2ecc71`,
                }} />
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{
                  fontSize: 20, fontWeight: isActive(u) ? 700 : 600,
                  color: isActive(u) ? C.accent : C.text,
                  wordBreak: "break-word",
                  transition: "color 0.2s",
                }}>
                  {name(u)}
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>
                  {u.bio ? u.bio : "End-to-end encrypted"}
                </div>
              </div>
              {(unreadCounts[uid(u)] || 0) > 0 && (
                <div style={{
                  minWidth: 28, height: 28, borderRadius: 14,
                  background: C.accent,
                  color: "#fff",
                  fontSize: 13, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 7px", flexShrink: 0,
                  boxShadow: `0 2px 8px ${C.accentGlow}`,
                }}>
                  {unreadCounts[uid(u)] > 99 ? "99+" : unreadCounts[uid(u)]}
                </div>
              )}
              <span onClick={e => { e.stopPropagation(); setViewingUser(u); }}
                style={{ fontSize: 20, color: C.muted, cursor: "pointer", padding: "6px", borderRadius: 8, transition: "all 0.2s" }}
                onMouseEnter={e => { e.target.style.color = C.accent; e.target.style.background = C.hoverBg; }}
                onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.background = "transparent"; }}>ⓘ</span>
            </div>
          ))}

          {/* Offline users */}
          {users.filter(u => !isOnline(u)).length > 0 && (
            <div style={{ padding: "14px 8px 4px", fontSize: 12, letterSpacing: "2px", color: C.muted, textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, borderTop: `1px solid ${C.border}`, marginTop: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted }} />
              Offline
            </div>
          )}
          {users.filter(u => !isOnline(u)).map(u => (
            <div key={uid(u)} onClick={() => { setActive(u); setActiveGroup(null); if (isMobile) setShowSidebar(false); }} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "16px 18px", cursor: "pointer",
              background: isActive(u) ? `${C.accent}08` : "transparent",
              borderRadius: 14, margin: "3px 0",
              transition: "all 0.2s ease", opacity: 0.7,
              border: `1.5px solid ${isActive(u) ? `${C.border}88` : "transparent"}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = C.listHover; e.currentTarget.style.transform = "translateX(2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = isActive(u) ? "1" : "0.7"; e.currentTarget.style.background = isActive(u) ? `${C.accent}08` : "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                background: u.avatar ? "transparent" : `${C.muted}15`,
                border: `2.5px solid ${isActive(u) ? C.border : `${C.border}66`}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 700, color: C.muted,
                overflow: "hidden", position: "relative",
                transition: "all 0.3s",
              }}>
                {u.avatar
                  ? <img src={u.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.3)" }} />
                  : initial(u)
                }
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 16, height: 16, borderRadius: "50%",
                  background: C.muted, border: `2.5px solid ${C.sidebarBg}`,
                }} />
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{
                  fontSize: 20, fontWeight: isActive(u) ? 600 : 500,
                  color: isActive(u) ? C.text : C.muted,
                  wordBreak: "break-word",
                  transition: "color 0.2s",
                }}>
                  {name(u)}
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>
                  {u.lastSeen ? `Last seen ${new Date(u.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Offline"}
                </div>
              </div>
              {(unreadCounts[uid(u)] || 0) > 0 && (
                <div style={{
                  minWidth: 28, height: 28, borderRadius: 14,
                  background: C.red, color: "#fff",
                  fontSize: 13, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 7px", flexShrink: 0,
                }}>
                  {unreadCounts[uid(u)] > 99 ? "99+" : unreadCounts[uid(u)]}
                </div>
              )}
              <span onClick={e => { e.stopPropagation(); setViewingUser(u); }}
                style={{ fontSize: 20, color: C.muted, cursor: "pointer", padding: "6px", borderRadius: 8, transition: "all 0.2s" }}
                onMouseEnter={e => { e.target.style.color = C.accent; e.target.style.background = C.hoverBg; }}
                onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.background = "transparent"; }}>ⓘ</span>
            </div>
          ))}
        </div>
          </>
        )}

        {/* ── Phase 2: Groups List ── */}
        {chatMode === "group" && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {/* Header row */}
            <div style={{
              padding: "14px 20px 8px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ fontSize: 12, letterSpacing: "2px", color: C.muted, textTransform: "uppercase", fontWeight: 700 }}>
                Groups · {groups.length}
              </div>
              <button onClick={() => setShowCreateGroup(true)} style={{
                background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                border: "none", borderRadius: 8,
                color: "#fff", fontSize: 12, fontWeight: 700,
                padding: "5px 12px", cursor: "pointer",
                boxShadow: `0 2px 8px ${C.accentGlow}`,
              }}>+ New</button>
            </div>

            {/* Groups list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px" }}>
              {groups.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 48, opacity: 0.25, marginBottom: 12 }}>👥</div>
                  <div style={{ fontSize: 15, color: C.muted, fontWeight: 600, marginBottom: 6 }}>No groups yet</div>
                  <div style={{ fontSize: 13, color: C.muted, opacity: 0.7, marginBottom: 16 }}>
                    Create a group to chat with multiple people
                  </div>
                  <button onClick={() => setShowCreateGroup(true)} style={{
                    padding: "10px 22px",
                    background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                    border: "none", borderRadius: 12,
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", boxShadow: `0 4px 16px ${C.accentGlow}`,
                  }}>Create a Group</button>
                </div>
              ) : (
                groups.map(g => (
                  <div key={g._id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", cursor: "pointer",
                    background: activeGroup?._id === g._id ? `${C.accent}15` : "transparent",
                    borderRadius: 12, margin: "2px 0",
                    transition: "background .15s",
                    border: `1px solid ${activeGroup?._id === g._id ? C.accent + "40" : "transparent"}`,
                  }}
                    onClick={() => { setActiveGroup(g); setActive(null); if (isMobile) setShowSidebar(false); }}
                    onMouseEnter={e => { if (activeGroup?._id !== g._id) e.currentTarget.style.background = C.bg3; }}
                    onMouseLeave={e => { if (activeGroup?._id !== g._id) e.currentTarget.style.background = "transparent"; }}
                  >
                    {/* Group avatar */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                      background: `linear-gradient(135deg, ${C.purple}, ${C.accent})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 800, color: "#fff",
                      boxShadow: `0 2px 8px ${C.shadow}`,
                    }}>
                      {g.avatar
                        ? <img src={g.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: 13, objectFit: "cover" }} />
                        : g.name[0]?.toUpperCase()
                      }
                    </div>

                    {/* Group info */}
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {g.name}
                        </span>
                        <span title="End-to-end encrypted" style={{ fontSize: 10, flexShrink: 0 }}>🔐</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                        {g.members?.length || 0} member{g.members?.length !== 1 ? "s" : ""}
                        {g.description ? ` · ${g.description}` : ""}
                      </div>
                    </div>

                    {/* Active indicator */}
                    {activeGroup?._id === g._id && (
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, flexShrink: 0 }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={logout} style={{
          margin: "18px 22px 22px", padding: "18px",
          background: "transparent", border: `1.5px solid ${C.border}`,
          color: C.muted, fontFamily: "'Inter', sans-serif",
          fontSize: 15, fontWeight: 700, letterSpacing: "1px",
          textTransform: "uppercase", cursor: "pointer",
          borderRadius: 14, transition: "all 0.25s",
        }}
          onMouseEnter={e => { e.target.style.borderColor = C.red; e.target.style.color = C.red; e.target.style.background = `${C.red}08`; }}
          onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; e.target.style.background = "transparent"; }}>
          ← Logout
        </button>
      </aside>

      {/* ══════════════════════════════════════════
          PHASE 5: GROUP INFO MODAL
      ══════════════════════════════════════════ */}
      {showGroupInfo && activeGroup && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.75)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }} onClick={e => { if (e.target === e.currentTarget) setShowGroupInfo(false); }}>
          <div className="modal-inner" style={{
            width: 420, background: C.cardBg,
            borderRadius: 20, border: `1px solid ${C.border}`,
            boxShadow: `0 24px 60px ${C.shadow}`,
            overflow: "hidden", animation: "fadeInScale .25s ease",
          }}>
            {/* Top banner */}
            <div style={{
              height: 100,
              background: `linear-gradient(135deg, ${C.purple}, ${C.accent})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, fontWeight: 800, color: "#fff",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                overflow: "hidden",
              }}>
                {activeGroup.avatar
                  ? <img src={activeGroup.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : activeGroup.name[0].toUpperCase()
                }
              </div>
              {/* Close button */}
              <button onClick={() => setShowGroupInfo(false)} style={{
                position: "absolute", top: 12, right: 12,
                background: "rgba(0,0,0,0.3)", border: "none",
                borderRadius: 8, color: "#fff",
                fontSize: 18, cursor: "pointer", padding: "4px 10px",
              }}>✕</button>
            </div>

            <div style={{ padding: "20px 24px 24px" }}>
              {/* Group name */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>
                  {activeGroup.name}
                </div>
                {activeGroup.description && (
                  <div style={{ fontSize: 14, color: C.muted }}>{activeGroup.description}</div>
                )}
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                  Created {new Date(activeGroup.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[
                  { label: "Members", value: activeGroup.members?.length || 0, icon: "👥" },
                  { label: "Messages", value: groupMessages.length, icon: "💬" },
                ].map((s, i) => (
                  <div key={i} style={{
                    flex: 1, padding: "12px", background: C.bg3,
                    borderRadius: 12, border: `1px solid ${C.border}`,
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* ── Encryption & Blockchain status ── */}
              <div style={{
                padding: "14px 16px", marginBottom: 20,
                background: `${C.green}0a`, border: `1px solid ${C.green}33`,
                borderRadius: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.green, display: "flex", alignItems: "center", gap: 6 }}>
                    🔐 End-to-End Secured
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>AES-256 · SHA-256</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setShowGroupInfo(false); loadBlockchain(); }} style={{
                    flex: 1, padding: "8px 10px",
                    background: "transparent", border: `1px solid ${C.purple}55`,
                    borderRadius: 8, color: C.purple,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    transition: "all .2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `${C.purple}10`}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >⛓ View Chain ({groupMessages.length} blocks)</button>
                  <button onClick={() => { setShowGroupInfo(false); verifyChain(); }} style={{
                    flex: 1, padding: "8px 10px",
                    background: "transparent", border: `1px solid ${C.green}55`,
                    borderRadius: 8, color: C.green,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    transition: "all .2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `${C.green}10`}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >✓ Verify Integrity</button>
                </div>
              </div>

              {/* Members list */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
                  Members
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                  {(activeGroup.members || []).map((m, i) => {
                    const memberId = m._id || m.id || m;
                    const memberUser = users.find(u => uid(u) === memberId) || { username: "Member", isOnline: false };
                    const isMe = memberId === user.id;
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "8px 12px", background: C.bg3,
                        borderRadius: 10, border: `1px solid ${C.border}`,
                      }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
                          overflow: "hidden",
                        }}>
                          {memberUser.avatar
                            ? <img src={memberUser.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : (memberUser.username || "M")[0].toUpperCase()
                          }
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                            {memberUser.username || "Member"}{isMe ? " (You)" : ""}
                          </div>
                          <div style={{ fontSize: 12, color: isOnline(memberUser) ? C.green : C.muted }}>
                            {isOnline(memberUser) ? "● Online" : "Offline"}
                          </div>
                        </div>
                        {/* Admin badge */}
                        {activeGroup.admin === memberId && (
                          <span style={{ fontSize: 10, padding: "2px 8px", background: `${C.accent}20`, border: `1px solid ${C.accent}44`, borderRadius: 6, color: C.accent, fontWeight: 700 }}>
                            Admin
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leave group button */}
              <button onClick={() => {
                if (window.confirm(`Leave "${activeGroup.name}"? You'll need to be re-added to rejoin.`)) {
                  setShowGroupInfo(false);
                  leaveGroup(activeGroup._id);
                }
              }} style={{
                width: "100%", padding: "13px",
                background: `${C.red}15`,
                border: `1px solid ${C.red}44`,
                borderRadius: 12, color: C.red,
                fontFamily: "'Inter', sans-serif",
                fontSize: 14, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.red}25`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${C.red}15`; }}
              >
                🚪 Leave Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PHASE 2: CREATE GROUP MODAL
      ══════════════════════════════════════════ */}
      {showCreateGroup && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, backdropFilter: "blur(4px)",
        }} onClick={e => { if (e.target === e.currentTarget) setShowCreateGroup(false); }}>
          <div className="modal-inner" style={{
            width: 440, background: C.cardBg,
            borderRadius: 20, border: `1px solid ${C.border}`,
            boxShadow: `0 24px 60px ${C.shadow}`,
            animation: "fadeInScale .25s ease", overflow: "hidden",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>👥 Create Group</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Add members and start chatting together</div>
              </div>
              <button onClick={() => setShowCreateGroup(false)} style={{
                background: C.bg3, border: "none", borderRadius: "50%",
                color: C.muted, fontSize: 16, width: 32, height: 32,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {/* Group name */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Group Name *
                </div>
                <input
                  value={groupForm.name}
                  onChange={e => setGroupForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Project Team, Study Group..."
                  maxLength={50}
                  style={{
                    width: "100%", padding: "11px 14px",
                    background: C.bg, border: `1.5px solid ${C.border}`,
                    borderRadius: 12, color: C.text,
                    fontFamily: "'Inter', sans-serif", fontSize: 14,
                    outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e  => e.target.style.borderColor = C.border}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Description <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                </div>
                <input
                  value={groupForm.description}
                  onChange={e => setGroupForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What's this group about?"
                  maxLength={200}
                  style={{
                    width: "100%", padding: "11px 14px",
                    background: C.bg, border: `1.5px solid ${C.border}`,
                    borderRadius: 12, color: C.text,
                    fontFamily: "'Inter', sans-serif", fontSize: 14,
                    outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e  => e.target.style.borderColor = C.border}
                />
              </div>

              {/* Members selector */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Add Members *</span>
                  {groupForm.members.length > 0 && (
                    <span style={{ color: C.accent, textTransform: "none", letterSpacing: 0 }}>
                      {groupForm.members.length} selected
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                  {users.map(u => {
                    const uid_u = uid(u);
                    const checked = groupForm.members.includes(uid_u);
                    return (
                      <label key={uid_u} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "9px 12px",
                        background: checked ? `${C.accent}12` : C.bg,
                        borderRadius: 12, cursor: "pointer",
                        border: `1px solid ${checked ? C.accent + "55" : C.border}`,
                        transition: "all 0.15s",
                      }}>
                        <input type="checkbox" checked={checked}
                          onChange={e => {
                            setGroupForm(p => ({
                              ...p,
                              members: e.target.checked
                                ? [...p.members, uid_u]
                                : p.members.filter(m => m !== uid_u),
                            }));
                          }}
                          style={{ accentColor: C.accent, width: 16, height: 16, flexShrink: 0 }}
                        />
                        {/* Avatar */}
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
                          background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: "#fff",
                        }}>
                          {u.avatar
                            ? <img src={u.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : initial(u)
                          }
                        </div>
                        {/* Name */}
                        <span style={{ fontSize: 14, color: C.text, fontWeight: 500, flex: 1 }}>
                          {name(u)}
                        </span>
                        {/* Online dot */}
                        {isOnline(u) && (
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => {
                  setShowCreateGroup(false);
                  setGroupForm({ name: "", description: "", members: [] });
                }} style={{
                  flex: 1, padding: "12px",
                  background: "transparent", border: `1px solid ${C.border}`,
                  borderRadius: 12, color: C.muted,
                  fontFamily: "'Inter', sans-serif", fontSize: 14,
                  cursor: "pointer", transition: "all 0.2s",
                }}>Cancel</button>
                <button onClick={createGroup} disabled={groupBusy} style={{
                  flex: 2, padding: "12px",
                  background: groupBusy ? C.bg3 : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                  border: "none", borderRadius: 12,
                  color: groupBusy ? C.muted : "#fff",
                  fontFamily: "'Inter', sans-serif", fontSize: 14,
                  fontWeight: 700, cursor: groupBusy ? "not-allowed" : "pointer",
                  boxShadow: groupBusy ? "none" : `0 4px 16px ${C.accentGlow}`,
                  transition: "all 0.2s",
                }}>
                  {groupBusy ? "Creating..." : "✓ Create Group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MAIN CHAT AREA
      ══════════════════════════════════════════ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, background: C.chatPattern, position: "relative" }} className={prefersDark ? "chat-wallpaper chat-wallpaper-dark" : "chat-wallpaper chat-wallpaper-light"}>
        {/* Wallpaper tint overlay */}
        <div className={prefersDark ? "chat-wallpaper-tint chat-wallpaper-tint-dark" : "chat-wallpaper-tint chat-wallpaper-tint-light"} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* ── Mobile top bar ── */}
        <div className="mobile-header" style={{
          display: "none", alignItems: "center", gap: 12,
          padding: "14px 16px", background: C.headerBg,
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          {active ? (
            <button onClick={() => { setActive(null); setShowSidebar(true); }} style={{
              background: "none", border: "none",
              color: C.accent, fontSize: 22, cursor: "pointer", padding: "0 4px",
            }}>←</button>
          ) : (
            <button onClick={() => setShowSidebar(true)} style={{
              background: "none", border: "none",
              color: C.accent, fontSize: 22, cursor: "pointer", padding: "0 4px",
            }}>☰</button>
          )}
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, flex: 1 }}>
            {active ? name(active) : "💬 SecureChat"}
          </div>
          {active && isOnline(active) && (
            <span style={{ fontSize: 11, color: "#2ecc71", fontWeight: 600 }}>● ONLINE</span>
          )}
        </div>

        {!active && !activeGroup ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, background: C.chatPattern, backdropFilter: "blur(4px)" }}>
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.accent}22, ${C.purple}22)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 56, boxShadow: `0 8px 40px ${C.accent}15`,
              animation: "float 4s ease-in-out infinite",
            }}>💬</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, color: C.text, fontWeight: 700 }}>Select a chat to begin</div>
            <div style={{ fontSize: 14, color: C.muted, opacity: 0.7 }}>AES-256 · RSA-2048 · Blockchain Verified</div>
          </div>

        ) : activeGroup && !active ? (
          /* ══════════════════════════════════════════
             PHASE 3: GROUP CHAT AREA
          ══════════════════════════════════════════ */
          <>
            {/* Group header */}
            <div style={{
              padding: "14px 20px", background: C.headerBg,
              borderBottom: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0, boxShadow: `0 2px 8px ${C.shadow}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Back button mobile */}
                <button className="mobile-back" onClick={() => { setActiveGroup(null); setShowSidebar(true); }} style={{
                  display: "none", background: "none", border: "none",
                  color: C.accent, fontSize: 22, cursor: "pointer",
                }}>←</button>

                {/* Group avatar — click to open info */}
                <div onClick={() => setShowGroupInfo(true)} style={{
                  width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.purple}, ${C.accent})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 700, color: "#fff",
                  overflow: "hidden", boxShadow: `0 2px 8px ${C.shadow}`,
                  cursor: "pointer",
                }}>
                  {activeGroup.avatar
                    ? <img src={activeGroup.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : activeGroup.name[0].toUpperCase()
                  }
                </div>

                {/* Group name — click to open info */}
                <div onClick={() => setShowGroupInfo(true)} style={{ cursor: "pointer" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>{activeGroup.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    👥 {activeGroup.members?.length || 0} members
                    {activeGroup.description && ` · ${activeGroup.description}`}
                  </div>
                </div>
              </div>

              {/* Header right buttons */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={verifyChain} style={{
                  padding: "7px 12px", background: "transparent",
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  color: C.muted, fontSize: 12, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.color = C.green; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
                >✓ Verify</button>

                <button onClick={loadBlockchain} style={{
                  padding: "7px 12px", background: "transparent",
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  color: C.muted, fontSize: 12, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.color = C.purple; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
                >⛓ Explorer</button>

                <button onClick={() => setShowGroupInfo(true)} style={{
                  padding: "7px 14px", background: "transparent",
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  color: C.muted, fontSize: 13, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
                >ⓘ Info</button>
              </div>
            </div>

            {/* Group messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {groupMessages.length === 0 && (
                <div style={{ textAlign: "center", color: C.muted, fontSize: 14, marginTop: 60, opacity: 0.6 }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
                  No messages yet — say hello!
                </div>
              )}
              {groupMessages.map((msg, i) => {
                const senderId = msg.sender?._id || msg.sender?.id || msg.senderId;
                const mine = senderId === user.id || msg.mine;
                const msgId = msg._id || msg.messageId;
                return (
                  <div key={msgId || i} className="msg-max-width" style={{ maxWidth: "70%", alignSelf: mine ? "flex-end" : "flex-start" }}>
                    {/* Sender name — always show in group */}
                    <div style={{ fontSize: 12, color: mine ? C.accent : C.purple, fontWeight: 600, marginBottom: 3, paddingLeft: 4 }}>
                      {mine ? "You" : (msg.sender?.username || msg.senderName || "Member")}
                    </div>
                    <div style={{
                      padding: "10px 14px",
                      background: mine ? C.sent : C.recv,
                      border: `1px solid ${mine ? C.sentBorder : C.recvBorder}`,
                      borderRadius: mine ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                      boxShadow: `0 1px 4px ${C.shadow}`,
                    }}>
                      <div style={{ fontSize: 15, color: C.text, lineHeight: 1.55, wordBreak: "break-word" }}>
                        {msg.plaintext || (
                          <span style={{ color: C.muted, fontStyle: "italic", fontSize: 13 }}>
                            🔒 Encrypted
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, justifyContent: "flex-end" }}>
                        <span style={{ fontSize: 11, color: C.muted }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <button onClick={() => setEncryptionMsg(msg)} style={{
                          fontSize: 11, padding: "2px 7px",
                          background: "transparent",
                          border: `1px solid ${C.border}`, borderRadius: 6,
                          color: C.muted, cursor: "pointer",
                          transition: "all .15s",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
                        >🔐</button>
                        {mine && (
                          <span style={{ fontSize: 13, color: msg.isRead ? C.green : C.muted, fontWeight: 700, letterSpacing: -1 }}>
                            {msg.isRead ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Typing indicator */}
            <div style={{ minHeight: 24, padding: "4px 20px", display: "flex", alignItems: "center", gap: 6 }}>
              {Object.keys(groupTypers).length > 0 && (
                <>
                  <span style={{ fontSize: 12, color: C.muted }}>
                    {Object.values(groupTypers).join(", ")} {Object.keys(groupTypers).length === 1 ? "is" : "are"} typing
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 2, color: C.muted }}>
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </span>
                </>
              )}
            </div>

            {/* Group input bar */}
            <div style={{
              padding: "12px 16px", background: C.headerBg,
              borderTop: `1px solid ${C.border}`,
              display: "flex", gap: 10, alignItems: "flex-end",
              boxShadow: `0 -2px 8px ${C.shadow}`,
            }}>
              <textarea
                rows={1} value={text} onChange={onGroupType}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendGroupMessage(); }}}
                placeholder={`Message ${activeGroup.name}...`}
                style={{
                  flex: 1, padding: "12px 16px",
                  background: C.bg3, border: `1.5px solid ${C.border}`,
                  borderRadius: 20, color: C.text,
                  fontFamily: "'Inter', sans-serif", fontSize: 15,
                  resize: "none", outline: "none",
                  maxHeight: 120, lineHeight: 1.55, boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e  => e.target.style.borderColor = C.border}
              />
              <button onClick={sendGroupMessage} disabled={!text.trim() || sending} style={{
                width: 46, height: 46, alignSelf: "flex-end",
                background: !text.trim() || sending
                  ? C.bg3
                  : `linear-gradient(135deg, ${C.accent}, #3b82f6)`,
                border: "none", borderRadius: "50%",
                color: !text.trim() || sending ? C.muted : "#fff",
                fontSize: 18, cursor: !text.trim() || sending ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: !text.trim() || sending ? "none" : `0 4px 16px ${C.accentGlow}`,
              }}>
                {sending ? "⏳" : "➤"}
              </button>
            </div>
          </>

        ) : (
          <>
            {/* ── Chat header ── */}
            <div style={{
              padding: "16px 24px", background: C.headerBg,
              borderBottom: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 56, height: 56, flexShrink: 0, overflow: "hidden",
                  background: active.avatar ? "transparent" : `${C.purple}22`,
                  border: `2.5px solid ${isOnline(active) ? C.green : C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 700, color: C.purple,
                  borderRadius: "50%", position: "relative",
                  transition: "all 0.3s",
                }}>
                  {active.avatar
                    ? <img src={active.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : initial(active)
                  }
                  {isOnline(active) && (
                    <div style={{
                      position: "absolute", bottom: 0, right: 0,
                      width: 14, height: 14, borderRadius: "50%",
                      background: "#2ecc71", border: `2.5px solid ${C.cardBg}`,
                      boxShadow: `0 0 8px #2ecc71`,
                    }} />
                  )}
                </div>
                <div onClick={() => setViewingUser(active)} style={{ cursor: "pointer" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                    {name(active)}
                    {isOnline(active) && <span style={{ fontSize: 12, color: "#2ecc71", fontWeight: 600 }}>● online</span>}
                  </div>
                  <div style={{ fontSize: 16, color: C.muted, marginTop: 3 }}>
                    {active.bio || "End-to-end encrypted · Blockchain verified"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={verifyChain} style={{
                  padding: "10px 18px", background: "transparent",
                  border: `1.5px solid ${C.accent}`,
                  color: C.accent, fontFamily: "'Inter', sans-serif",
                  fontSize: 12, letterSpacing: "1px",
                  textTransform: "uppercase", cursor: "pointer",
                  borderRadius: 12, fontWeight: 600,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.target.style.background = C.accent; e.target.style.color = "#fff"; }}
                  onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.accent; }}>✓ Verify</button>
                <button onClick={loadBlockchain} style={{
                  padding: "10px 18px", background: "transparent",
                  border: `1.5px solid ${C.purple}`,
                  color: C.purple, fontFamily: "'Inter', sans-serif",
                  fontSize: 12, letterSpacing: "1px",
                  textTransform: "uppercase", cursor: "pointer",
                  borderRadius: 12, fontWeight: 600,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.target.style.background = C.purple; e.target.style.color = "#fff"; }}
                  onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.purple; }}>⛓ Explorer</button>
              </div>
            </div>

            {/* ── Search bar ── */}
            <div style={{
              padding: "10px 20px", background: C.headerBg,
              borderBottom: `1px solid ${C.border}`,
              display: "flex", gap: 10, flexShrink: 0,
            }}>
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); if (!e.target.value.trim()) setSearchResults(null); }}
                onKeyDown={e => e.key === "Enter" && searchMessages()}
                placeholder="🔍 Search messages..."
                style={{
                  flex: 1, padding: "11px 16px", background: C.searchBg,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 14, color: C.text,
                  fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none",
                  transition: "all 0.25s",
                }}
                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentGlow}`; }}
                onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
              />
              <button onClick={searchMessages} disabled={searching} style={{
                padding: "11px 20px", background: searching ? C.bg3 : C.purple,
                border: "none", color: searching ? C.muted : "#fff",
                fontFamily: "'Inter', sans-serif", fontSize: 13,
                fontWeight: 700, cursor: searching ? "not-allowed" : "pointer",
                borderRadius: 14, transition: "all 0.2s",
                boxShadow: searching ? "none" : `0 4px 16px ${C.purple}33`,
              }}
                onMouseEnter={e => { if (!searching) e.target.style.transform = "scale(1.05)"; }}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}>
                {searching ? "..." : "Search"}
              </button>
              {searchResults !== null && (
                <button onClick={() => { setSearchResults(null); setSearchQuery(""); }} style={{
                  padding: "11px 16px", background: "transparent",
                  border: `1.5px solid ${C.border}`, color: C.muted,
                  fontSize: 13, cursor: "pointer", borderRadius: 14,
                  fontWeight: 600, transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.target.style.borderColor = C.red; e.target.style.color = C.red; }}
                  onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}>✕</button>
              )}
            </div>

            {/* ── Pinned messages banner ── */}
            {pinnedMsgs.length > 0 && (
              <div style={{
                padding: "10px 20px", background: C.headerBg,
                borderBottom: `1px solid ${C.accent}22`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", flexShrink: 0,
              }} onClick={() => setShowPinned(!showPinned)}>
                <span style={{ color: C.accent, fontSize: 13, letterSpacing: "1px", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  📌 {pinnedMsgs.length} pinned message{pinnedMsgs.length !== 1 ? "s" : ""}
                </span>
                <span style={{ color: C.muted, fontSize: 12, fontWeight: 500 }}>{showPinned ? "▲ hide" : "▼ show"}</span>
              </div>
            )}
            {showPinned && pinnedMsgs.length > 0 && (
              <div style={{
                background: C.headerBg, borderBottom: `1px solid ${C.border}`,
                maxHeight: 180, overflowY: "auto", padding: "10px 16px", flexShrink: 0,
              }}>
                {pinnedMsgs.map((pm) => (
                  <div key={pm._id || pm.messageId} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", marginBottom: 6,
                    background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`,
                  }}>
                    <span style={{ color: C.text, fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      📌 {pm.plaintext || "[attachment]"}
                    </span>
                    <button onClick={() => unpinMessage(pm._id || pm.messageId)} style={{
                      background: "none", border: "none", color: C.muted,
                      cursor: "pointer", fontSize: 12, marginLeft: 10, fontWeight: 500,
                      transition: "color 0.2s",
                    }}
                      onMouseEnter={e => e.target.style.color = C.red}
                      onMouseLeave={e => e.target.style.color = C.muted}>unpin</button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Messages area ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10, background: "transparent" }}>
              {/* Search results banner */}
              {searchResults !== null && (
                <div style={{ padding: "12px 16px", background: `${C.purple}12`, border: `1px solid ${C.purple}33`, borderRadius: 12, color: C.purple, fontSize: 13, marginBottom: 4, fontWeight: 500 }}>
                  🔍 {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
                  {searchResults.length === 0 && " — No messages found"}
                </div>
              )}
              {(searchResults !== null ? searchResults : messages).map((msg, i) => {
                const mine  = isMine(msg);
                const msgId = msg._id || msg.messageId;
                const isEditingThis = editingId === msgId;
                return (
                  <div key={msgId || i} className="msg-max-width" style={{ maxWidth: "70%", alignSelf: mine ? "flex-end" : "flex-start", animation: "fadeIn 0.3s ease" }}>
                    {/* Sender name (received only) */}
                    {!mine && (
                      <div style={{ fontSize: 12, color: C.accent, marginBottom: 4, paddingLeft: 4, fontWeight: 600 }}>
                        {msg.sentAnonymously
                          ? (msg.sender?.anonymousAlias || msg.senderName || "Ghost")
                          : (msg.sender?.username || msg.senderName || "User")
                        }
                        {msg.sentAnonymously && <span style={{ fontSize: 11, color: C.purple, marginLeft: 6, fontWeight: 500 }}>(anon)</span>}
                      </div>
                    )}
                    <div className={mine ? "msg-bubble-sent" : "msg-bubble-recv"} style={{
                      padding: "16px 22px", position: "relative",
                      background: mine ? C.msgSentBg : C.msgRecvBg,
                      border: mine ? "none" : `1px solid ${C.recvBorder}`,
                      borderRadius: mine ? '22px 22px 6px 22px' : '22px 22px 22px 6px',
                      boxShadow: mine ? `0 2px 8px rgba(0,0,0,0.15)` : `0 2px 8px rgba(0,0,0,0.06)`,
                      maxWidth: 620,
                      width: "fit-content",
                      color: mine ? C.sentText : C.recvText,
                      transition: "all 0.2s",
                    }}
                      onMouseEnter={e => {
                        if (mine) {
                          const actions = e.currentTarget.querySelector(".msg-actions");
                          if (actions) actions.style.display = "flex";
                        }
                        const picker = e.currentTarget.querySelector(".reaction-picker");
                        if (picker) picker.style.display = "flex";
                      }}
                      onMouseLeave={e => {
                        if (mine) {
                          const actions = e.currentTarget.querySelector(".msg-actions");
                          if (actions) actions.style.display = "none";
                        }
                        const picker = e.currentTarget.querySelector(".reaction-picker");
                        if (picker) picker.style.display = "none";
                      }}
                    >
                      {/* ── Reaction picker ── */}
                      <div className="reaction-picker" style={{
                        display: "none", position: "absolute",
                        top: -48, left: mine ? "auto" : 0, right: mine ? 0 : "auto",
                        gap: 2, background: C.cardBg,
                        border: `1px solid ${C.border}`,
                        borderRadius: 26, padding: "6px 8px",
                        boxShadow: `0 8px 28px ${C.shadow}`,
                        zIndex: 25,
                        backdropFilter: "blur(12px)",
                        alignItems: "center",
                      }}>
                        {["👍","❤️","😂","😮","😢","🔥"].map(emoji => (
                          <button key={emoji} onClick={() => reactToMessage(msgId, emoji)} style={{
                            background: "none", border: "none",
                            fontSize: 16, cursor: "pointer",
                            padding: "3px 5px", lineHeight: 1,
                            transition: "transform .15s, background .15s",
                            borderRadius: 12,
                          }}
                            onMouseEnter={e => { e.target.style.transform = "scale(1.3)"; e.target.style.background = C.hoverBg; }}
                            onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.background = "transparent"; }}
                          >{emoji}</button>
                        ))}
                        <button onClick={() => startReply(msg)} style={{
                          background: "none", border: "none",
                          fontSize: 14, cursor: "pointer",
                          padding: "3px 6px", color: C.muted,
                          borderRadius: 10,
                          transition: "all .15s",
                        }}
                          title="Reply"
                          onMouseEnter={e => { e.target.style.color = C.accent; e.target.style.background = C.hoverBg; }}
                          onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.background = "transparent"; }}
                        >↩</button>
                      </div>

                      {/* Edit/Delete buttons + Self-destruct picker */}
                      {mine && (
                        <>
                        <div className="msg-actions" style={{
                          display: "none", position: "absolute",
                          top: -92, right: 0, gap: 4,
                          background: C.cardBg, border: `1px solid ${C.border}`,
                          padding: "6px 10px", borderRadius: 14,
                          boxShadow: `0 4px 16px ${C.shadow}`,
                          backdropFilter: "blur(12px)",
                          zIndex: 26,
                        }}>
                          <button onClick={() => startReply(msg)}
                            style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, padding: "4px 10px", borderRadius: 8, transition: "all 0.2s", fontWeight: 500 }}
                            onMouseEnter={e => e.target.style.color = C.accent}
                            onMouseLeave={e => e.target.style.color = C.muted}>
                            ↩ Reply
                          </button>
                          <button onClick={() => msg.isPinned ? unpinMessage(msg._id || msg.messageId) : pinMessage(msg)}
                            style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, padding: "4px 10px", borderRadius: 8, transition: "all 0.2s", fontWeight: 500 }}
                            onMouseEnter={e => { e.target.style.color = C.accent; e.target.style.background = C.hoverBg; }}
                            onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.background = "transparent"; }}>
                            {msg.isPinned ? "📌 Unpin" : "📌 Pin"}
                          </button>
                          <button onClick={() => { setEditingId(msgId); setEditText(msg.plaintext || ""); }}
                            style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, padding: "4px 10px", borderRadius: 8, transition: "all 0.2s", fontWeight: 500 }}
                            onMouseEnter={e => { e.target.style.color = C.accent; e.target.style.background = C.hoverBg; }}
                            onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.background = "transparent"; }}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => deleteMessage(msgId)}
                            style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, padding: "4px 10px", borderRadius: 8, transition: "all 0.2s", fontWeight: 500 }}
                            onMouseEnter={e => { e.target.style.color = C.red; e.target.style.background = `${C.red}10`; }}
                            onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.background = "transparent"; }}>
                            🗑 Delete
                          </button>
                          <button onClick={() => setDestructId(destructId === msgId ? null : msgId)}
                            style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, padding: "4px 10px", borderRadius: 8, transition: "all 0.2s", fontWeight: 500 }}
                            onMouseEnter={e => { e.target.style.color = C.orange; e.target.style.background = `${C.orange}10`; }}
                            onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.background = "transparent"; }}>
                            💥 Self-Destruct
                          </button>
                        </div>

                        {/* Self-destruct timer picker */}
                        {destructId === msgId && (
                          <div style={{
                            position: "absolute", top: -86, right: 0,
                            background: C.cardBg, border: `1px solid ${C.border}`,
                            padding: "10px 14px", zIndex: 20, borderRadius: 16,
                            display: "flex", flexDirection: "column", gap: 6,
                            boxShadow: `0 8px 32px ${C.shadow}`,
                            backdropFilter: "blur(12px)",
                          }}>
                            <div style={{ fontSize: 11, color: C.orange, marginBottom: 2, letterSpacing: "0.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 10 }}>💥</span> SELF-DESTRUCT IN</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {[5, 10, 30, 60, 300].map(s => (
                                <button key={s} onClick={() => setSelfDestruct(msgId, s)} style={{
                                  padding: "5px 10px", background: "transparent",
                                  border: `1px solid ${C.border}`, color: C.muted,
                                  fontSize: 11, cursor: "pointer", borderRadius: 10,
                                  fontWeight: 600, transition: "all 0.2s",
                                }}
                                  onMouseEnter={e => { e.target.style.background = C.orange; e.target.style.color = "#000"; e.target.style.borderColor = C.orange; }}
                                  onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.muted; e.target.style.borderColor = C.border; }}>
                                  {s < 60 ? `${s}s` : `${s/60}m`}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        </>
                      )}

                      {/* ── Reply quote ── */}
                      {msg.replyTo?.messageId && (
                        <div style={{
                          borderLeft: `3px solid ${C.accent}`,
                          paddingLeft: 10, marginBottom: 10,
                          background: C.headerBg,
                          padding: "8px 12px", borderRadius: 8,
                        }}>
                          <div style={{ fontSize: 11, color: C.accent, letterSpacing: "0.5px", marginBottom: 2, fontWeight: 600 }}>
                            ↩ {msg.replyTo.senderName || "User"}
                          </div>
                          <div style={{ fontSize: 13, color: mine ? "rgba(255,255,255,0.6)" : C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {msg.replyTo.plaintext || "[attachment]"}
                          </div>
                        </div>
                      )}

                      {/* ── Attachment (file / voice) ── */}
                      {msg.attachment?.data && (() => {
                        const { data, mimeType, fileName } = msg.attachment;
                        const src = `data:${mimeType};base64,${data}`;
                        if (mimeType?.startsWith("image/")) {
                          return (
                            <a href={src} target="_blank" rel="noreferrer">
                              <img src={src} alt={fileName} style={{
                                maxWidth: "100%", maxHeight: 260,
                                display: "block", marginBottom: 10,
                                borderRadius: 12, border: `1px solid ${C.border}`,
                              }} />
                            </a>
                          );
                        }
                        if (mimeType?.startsWith("audio/")) {
                          return (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 12, color: C.accent, marginBottom: 6, letterSpacing: "1px", fontWeight: 600 }}>🎤 VOICE NOTE</div>
                              <audio controls src={src} style={{ width: "100%", filter: "invert(1) hue-rotate(90deg)", borderRadius: 8 }} />
                            </div>
                          );
                        }
                        if (mimeType?.startsWith("video/")) {
                          return (
                            <video controls src={src} style={{
                              maxWidth: "100%", maxHeight: 240,
                              display: "block", marginBottom: 10,
                              borderRadius: 12, border: `1px solid ${C.border}`,
                            }} />
                          );
                        }
                        return (
                          <a href={src} download={fileName} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "14px 18px", marginBottom: 12,
                            background: C.bg3, borderRadius: 12,
                            color: C.accent, textDecoration: "none", fontSize: 14,
                            border: `1px solid ${C.border}`,
                          }}>
                            <span style={{ fontSize: 22 }}>📎</span>
                            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</span>
                            <span style={{ fontSize: 14, color: C.muted }}>↓</span>
                          </a>
                        );
                      })()}

                      {/* Message text or edit input */}
                      {isEditingThis ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            autoFocus rows={2}
                            style={{
                              background: C.bg, border: `1.5px solid ${C.accent}`,
                              color: C.text, fontFamily: "'Inter', sans-serif",
                              fontSize: 15, padding: "12px 14px", resize: "none", outline: "none",
                              width: "100%", boxSizing: "border-box", borderRadius: 12,
                            }}
                          />
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => { setEditingId(null); setEditText(""); }}
                              style={{ padding: "8px 16px", background: "transparent", border: `1.5px solid ${C.border}`, color: C.muted, fontSize: 13, cursor: "pointer", borderRadius: 10, fontWeight: 600 }}>
                              Cancel
                            </button>
                            <button onClick={() => saveEdit(msgId)}
                              style={{ padding: "8px 16px", background: C.accent, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", borderRadius: 10 }}>
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 16, lineHeight: 1.7, wordBreak: "break-word", fontWeight: 400, letterSpacing: "0.2px" }}>
                          {msg.plaintext ||
                            <span style={{ color: C.muted, fontStyle: "italic", fontSize: 14 }}>
                              🔒 Encrypted — visible only to recipient
                            </span>
                          }
                          {msg.isEdited && <span style={{ fontSize: 12, color: mine ? "rgba(255,255,255,0.4)" : C.muted, marginLeft: 6, fontWeight: 500, fontStyle: "italic" }}>(edited)</span>}
                          {msg.selfDestructAt && (() => {
                            const secs = Math.max(0, Math.round((new Date(msg.selfDestructAt) - Date.now()) / 1000));
                            const urgent = secs <= 5;
                            return (
                              <span style={{
                                fontSize: 12, marginLeft: 6,
                                color: urgent ? C.red : (mine ? "rgba(255,255,255,0.6)" : C.orange),
                                fontWeight: urgent ? 700 : 500,
                                animation: urgent ? "pulse 0.5s infinite" : "none",
                                padding: "1px 6px",
                                background: urgent ? `${C.red}15` : "transparent",
                                borderRadius: 10,
                                display: "inline-flex", alignItems: "center", gap: 3,
                              }}>
                                <span style={{ fontSize: 10 }}>💥</span> {secs}s
                              </span>
                            );
                          })()}
                        </div>
                      )}

                      {/* ── Reaction counts ── */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                          {Object.entries(msg.reactions).map(([emoji, reactors]) =>
                            reactors && reactors.length > 0 ? (
                              <button key={emoji} onClick={() => reactToMessage(msgId, emoji)} style={{
                                background: reactors.includes(user.id) ? `${C.accent}15` : C.bg3,
                                border: `1px solid ${reactors.includes(user.id) ? C.accent : C.border}`,
                                borderRadius: 16, padding: "3px 10px",
                                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                                fontSize: 16, color: C.text,
                                transition: "all .15s",
                              }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = `${C.accent}15`; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = reactors.includes(user.id) ? C.accent : C.border; e.currentTarget.style.background = reactors.includes(user.id) ? `${C.accent}15` : C.bg3; }}
                              >
                                <span>{emoji}</span>
                                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{reactors.length}</span>
                              </button>
                            ) : null
                          )}
                        </div>
                      )}

                      {/* Meta row */}
                      {!isEditingThis && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {msg.screenshotDetected && (
                            <span style={{
                              fontSize: 10, padding: "3px 8px",
                              background: `${C.red}18`,
                              borderRadius: 20,
                              color: C.red, fontWeight: 600,
                              letterSpacing: "0.5px",
                              display: "flex", alignItems: "center", gap: 4,
                            }}>📸 SS</span>
                          )}
                          {msg.isPinned && (
                            <span style={{
                              fontSize: 10, padding: "3px 8px",
                              background: `${C.accent}15`,
                              borderRadius: 20,
                              color: C.accent, fontWeight: 600,
                              letterSpacing: "0.5px",
                              display: "flex", alignItems: "center", gap: 4,
                            }}>📌 PINNED</span>
                          )}
                          {/* Unified meta badge group */}
                          <div style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "5px 14px",
                            background: mine
                              ? (prefersDark ? `rgba(255,255,255,0.12)` : `rgba(0,0,0,0.06)`)
                              : (prefersDark ? C.bg3 : C.bg3),
                            borderRadius: 20,
                            backdropFilter: "blur(4px)",
                          }}>
                            {msg.isVerified && (
                              <span style={{
                                fontSize: 11, color: mine ? (prefersDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)") : C.green,
                                fontWeight: 600, letterSpacing: "0.5px",
                                display: "flex", alignItems: "center", gap: 3,
                              }}>
                                <span style={{ fontSize: 9 }}>✓</span> Verified
                              </span>
                            )}
                            <span style={{
                              fontSize: 11,
                              color: mine ? (prefersDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)") : C.muted,
                              fontWeight: 500,
                              display: "flex", alignItems: "center", gap: 3,
                            }}>
                              <span style={{ fontSize: 9 }}>🔒</span> E2E
                            </span>
                            {/* Encryption visualizer */}
                            <button onClick={() => setEncryptionMsg(msg)} style={{
                              fontSize: 11, padding: "2px 8px",
                              background: "transparent",
                              border: "none",
                              color: mine ? (prefersDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)") : C.muted,
                              cursor: "pointer", borderRadius: 10,
                              transition: "all .15s", fontWeight: 500,
                              display: "flex", alignItems: "center", gap: 3,
                            }}
                              onMouseEnter={e => { e.target.style.color = mine ? (prefersDark ? "#fff" : "#000") : C.accent; }}
                              onMouseLeave={e => { e.target.style.color = mine ? (prefersDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)") : C.muted; }}
                            >
                              <span style={{ fontSize: 9 }}>🔐</span> View
                            </button>
                            {/* Time - now next to View */}
                            <span style={{
                              fontSize: 12,
                              color: mine ? (prefersDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)") : C.muted,
                              fontWeight: 500,
                              letterSpacing: "0.3px",
                            }}>{fmt(msg.createdAt)}</span>
                            {/* Read receipts */}
                            {mine && (
                              <span
                                title={msg.isRead ? "Seen" : "Delivered"}
                                style={{
                                  fontSize: 14, fontWeight: 700, letterSpacing: -1,
                                  color: msg.isRead
                                    ? (mine ? (prefersDark ? "#fff" : C.accent) : C.accent)
                                    : (mine ? (prefersDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)") : C.muted),
                                }}>
                                {msg.isRead ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* ── Typing indicator ── */}
            <div style={{ minHeight: 28, padding: "6px 24px", display: "flex", alignItems: "center", gap: 8 }}>
              {isTyping && (
                <>
                  <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{name(active)} is typing</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3, color: C.muted }}>
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </span>
                </>
              )}
            </div>

            {/* ── Reply preview bar ── */}
            {replyTo && (
              <div style={{
                padding: "10px 20px", background: C.bg2,
                borderTop: `1px solid ${C.accent}22`,
                display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
              }}>
                <div style={{ width: 3, height: 36, background: C.accent, borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 11, color: C.accent, letterSpacing: "1px", fontWeight: 600 }}>↩ Replying to {replyTo.senderName}</div>
                  <div style={{ fontSize: 13, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {replyTo.plaintext}
                  </div>
                </div>
                <button onClick={() => setReplyTo(null)} style={{
                  background: "none", border: "none", color: C.muted,
                  cursor: "pointer", fontSize: 18, lineHeight: 1,
                  padding: "4px", borderRadius: 8, transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.target.style.color = C.red; e.target.style.background = `${C.red}10`; }}
                  onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.background = "transparent"; }}>✕</button>
              </div>
            )}

            {/* ── Voice note preview ── */}
            {audioBlob && (
              <div style={{
                padding: "12px 20px", background: C.bg2,
                borderTop: `1px solid ${C.accent}22`,
                display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
              }}>
                <span style={{ color: C.accent, fontSize: 13, letterSpacing: "1px", fontWeight: 600 }}>🎤 Voice note ready</span>
                <audio controls src={URL.createObjectURL(audioBlob)} style={{ height: 36, flex: 1, borderRadius: 8 }} />
                <button onClick={sendVoiceNote} disabled={sending} style={{
                  padding: "8px 18px", background: C.accent, border: "none",
                  color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13,
                  borderRadius: 10, transition: "all 0.2s",
                }}
                  onMouseEnter={e => { if (!sending) e.target.style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => e.target.style.transform = "scale(1)"}>Send</button>
                <button onClick={discardVoice} style={{
                  background: "none", border: "none", color: C.muted,
                  cursor: "pointer", fontSize: 18, padding: "4px",
                  borderRadius: 8, transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.target.style.color = C.red; e.target.style.background = `${C.red}10`; }}
                  onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.background = "transparent"; }}>✕</button>
              </div>
            )}

            {/* ── Input bar ── */}
            <div style={{
              padding: "14px 20px", background: C.headerBg,
              borderTop: `1px solid ${C.border}`,
              display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0,
            }}>
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={onFileChange}
                accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
              />

              {/* File attach button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                title="Attach file"
                style={{
                  background: "none", border: `1.5px solid ${C.border}`,
                  color: C.muted, cursor: "pointer",
                  fontSize: 20, padding: "12px 14px", alignSelf: "stretch",
                  borderRadius: 14, transition: "all .15s",
                }}
                onMouseEnter={e => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent; }}
                onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}
              >📎</button>

              {/* Voice record button */}
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={sending || !!audioBlob}
                title="Hold to record voice note"
                style={{
                  background: recording ? `${C.accent}22` : "none",
                  border: `1.5px solid ${recording ? C.accent : C.border}`,
                  color: recording ? C.accent : C.muted,
                  cursor: "pointer", fontSize: 20,
                  padding: "12px 14px", alignSelf: "stretch",
                  borderRadius: 14, transition: "all .15s",
                }}
              >{recording ? "🔴" : "🎤"}</button>

              <textarea
                ref={msgInputRef}
                rows={1} value={text} onChange={onType} onKeyDown={onEnter}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: "14px 18px",
                  background: C.bg, border: `1.5px solid ${C.border}`,
                  color: C.text, fontFamily: "'Inter', sans-serif",
                  fontSize: 15, resize: "none", outline: "none",
                  maxHeight: 120, lineHeight: 1.6, boxSizing: "border-box",
                  borderRadius: 18, transition: "all 0.25s",
                }}
                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentGlow}`; }}
                onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
              />
              <button onClick={send} disabled={!text.trim() || sending} style={{
                padding: "14px 22px", alignSelf: "stretch",
                background: !text.trim() || sending ? C.bg3 : C.accent,
                border: "none",
                color: !text.trim() || sending ? C.muted : "#fff",
                fontFamily: "'Inter', sans-serif", fontSize: 18,
                fontWeight: 700, borderRadius: 18,
                cursor: !text.trim() || sending ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s ease",
                boxShadow: !text.trim() || sending ? "none" : `0 2px 8px ${C.accentGlow}`,
              }}
                onMouseEnter={e => { if (text.trim() && !sending) { e.target.style.transform = "scale(1.08)"; e.target.style.boxShadow = `0 4px 16px ${C.accentGlow}`; }}}
                onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = !text.trim() || sending ? "none" : `0 2px 8px ${C.accentGlow}`; }}>
                {sending ? "⏳" : "➤"}
              </button>
            </div>
          </>
        )}
      </div></main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. ROOT APP
// ─────────────────────────────────────────────────────────────
function AppInner() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: C.bg, color: C.accent,
      fontFamily: "'Inter', sans-serif", fontSize: 14,
      letterSpacing: "3px", textTransform: "uppercase", fontWeight: 700,
    }}>
      <div className="spinner" style={{ width: 24, height: 24, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", marginRight: 16, animation: "spin 1s linear infinite" }} />
      Loading SecureChat...
    </div>
  );

  return user ? <ChatPage /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
