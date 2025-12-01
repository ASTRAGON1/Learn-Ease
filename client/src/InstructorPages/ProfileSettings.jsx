import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileSettings.css";

/* Icons for password visibility */
const Eye = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none"/>
  </svg>
);
const EyeOff = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M1 1l22 22" strokeWidth="2" fill="none"/>
    <path d="M3 7s4-5 9-5 9 5 9 5m-4.5 9.5C14.9 17.8 13.5 18 12 18 7 18 3 12 3 12a26 26 0 0 1 2.5-3.3" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none"/>
  </svg>
);

const COUNTRIES = [
  "United States","United Kingdom","Germany","France","Canada","India",
  "Morocco","Algeria","Tunisia","Spain","Italy","Australia","Brazil","Japan"
];

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");

  // LearnEase Profile
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarURL, setAvatarURL] = useState("");

  // Private setting
  const [email, setEmail] = useState("");
  const [storedPassword, setStoredPassword] = useState(""); // real old password (not shown)
  const [passwordMask] = useState("•••••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");

  const [notif, setNotif] = useState({
    updates: true, admin: true, performance: true, ranking: true, followers: false,
  });

  // ---- Prefill data from backend ----
  useEffect(() => {
    (async () => {
      // TODO: replace with your real API call
      // const me = await (await fetch("/api/me")).json();
      const me = {
        firstName: "Rojola",
        lastName: "Doe",
        headline: "",
        bio: "",
        country: "",
        website: "",
        email: "rojola@example.com",
        avatarUrl: "",           // put a URL if you already have one
        password: "OldSecret1!"  // backend will send hashed or raw per your plan
      };

      setFirst(me.firstName || "");
      setLast(me.lastName || "");
      setHeadline(me.headline || "");
      setBio(me.bio || "");
      setCountry(me.country || "");
      setWebsite(me.website || "");
      setEmail(me.email || "");
      setAvatarURL(me.avatarUrl || "");
      setStoredPassword(me.password || ""); // keep it in state, never render
    })();
  }, []);

  // preview selected image
  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarURL(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const onDropAvatar = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setAvatarFile(f);
  };

  const saveProfile = async () => {
    try {
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await fetch("/api/me/avatar", { method: "PUT", body: fd });
      }
      await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first, last, headline, bio, country, website }),
      });
      alert("Profile saved");
    } catch { alert("Failed to save"); }
  };

  // Private settings
const savePrivate = async () => {
  try {
    await fetch("/api/me/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, notifications: notif }),
    });
    alert("Private settings saved");
  } catch { alert("Failed to save"); }
};

  const changePassword = () => {
    if (!newPwd || newPwd !== newPwd2) {
      alert("Passwords do not match.");
      return;
    }
    console.log({
      oldPassword: storedPassword, // backend can verify
      newPassword: newPwd
    });
    setShowPwdModal(false);
    setNewPwd(""); setNewPwd2("");
    alert("Password updated");
  };

  const closeAccount = () => {
    if (window.confirm("Are you sure you want to close your account? This cannot be undone.")) {
      console.log("Account closed");
      alert("Account closed");
    }
  };

  const handleBack = () => {
    navigate("/InstructorDash");
  };

  return (
    <div className="ps-page">
      <div className="ps-header-row">
        <button type="button" className="ps-back" onClick={handleBack}>
          <span className="chev">‹</span> Dashboard
        </button>
        <h1 className="ps-title">Profile &amp; settings</h1>
        <span className="ps-spacer" aria-hidden />
      </div>
      <div style={{width:"1140px",margin:"0 auto 8px",fontWeight:700}}>
        Signed in as {first || "—"} {last || ""}
      </div>

      <div className="ps-tabs">
        <button className={`ps-tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
          LearnEase Profile
        </button>
        <button className={`ps-tab ${tab === "private" ? "active" : ""}`} onClick={() => setTab("private")}>
          Private setting
        </button>
      </div>

      {tab === "profile" && (
        <section className="ps-card">
          <div className="ps-grid">
            <div className="ps-col">
              <div className="ps-field">
                <label>First Name</label>
                <input className="ps-input" value={first} onChange={e=>setFirst(e.target.value)} placeholder="ex. John" />
              </div>
              <div className="ps-field">
                <label>Last Name</label>
                <input className="ps-input" value={last} onChange={e=>setLast(e.target.value)} placeholder="ex. Doe" />
              </div>
              <div className="ps-field">
                <label>Headline</label>
                <input className="ps-input" value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="Short description that shows on your profile" />
                <small className="ps-help">This headline will be shown on your profile</small>
              </div>
              <div className="ps-field">
                <label>Biography</label>
                <textarea className="ps-textarea" value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell learners about your experience, style, and goals." />
                <small className="ps-help">At least 50 words. Links and coupon codes are not permitted.</small>
              </div>
              <div className="ps-field">
                <label>Country</label>
                <select className="ps-input" value={country} onChange={e=>setCountry(e.target.value)}>
                  <option value="" disabled>Choose your country</option>
                  {COUNTRIES.map(c=>(<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
            </div>

            <div className="ps-col">
              <div className="ps-field">
                <label>Profile Image</label>
                <div className="ps-upload" onDragOver={(e)=>e.preventDefault()} onDrop={onDropAvatar}>
                  <input
                    id="ps-avatar"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e)=>setAvatarFile(e.target.files?.[0]||null)}
                  />
                  <div className="ps-upload-top">
                    Drag &amp; Drop or <label htmlFor="ps-avatar" className="ps-link">Choose file</label> to upload
                  </div>
                  <div className="ps-upload-body" onClick={()=>document.getElementById('ps-avatar')?.click()} role="button" tabIndex={0}>
                    {avatarURL ? (
                      <img src={avatarURL} alt="preview" className="ps-avatar-preview" />
                    ) : (
                      <div className="ps-avatar-icon" aria-hidden />
                    )}
                  </div>
                </div>
                <small className="ps-help">Minimum 200×200 pixels, Maximum 6000×6000 pixels</small>
              </div>

              <div className="ps-field">
                <label>Website</label>
                <input className="ps-input" value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://example.com" />
                <small className="ps-help">Write your website URL, if you have one.</small>
              </div>
            </div>
          </div>

          <div className="ps-footer">
            <button className="ps-primary" onClick={saveProfile}>Save changes</button>
          </div>
        </section>
      )}

      {tab === "private" && (
        <section className="ps-card">
          <h3 className="ps-subtitle">Account security</h3>
          <div className="ps-field sm">
            <label>Email</label>
            <input className="ps-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className="ps-pw-row">
            <div className="ps-field sm flex1">
              <label>Password</label>
              <div className="ps-input-group">
                <input 
                  className="ps-input" 
                  type={showPassword ? "text" : "password"}
                  value={showPassword ? storedPassword : passwordMask} 
                  readOnly 
                />
                <button
                  type="button"
                  className="ps-eye"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
            <button className="ps-secondary" onClick={()=>setShowPwdModal(true)}>Edit</button>
          </div>

          <h3 className="ps-subtitle">Notifications preferences</h3>
          <div className="ps-switchlist">
            {[
              ["updates","Updates and offerings"],
              ["admin","Notifications from the admin"],
              ["performance","Performance notifications"],
              ["ranking","Instructor ranking notifications"],
              ["followers","Profile followers, visitors notifications"],
            ].map(([key,label])=>(
              <label key={key} className="ps-switchrow">
                <span>{label}</span>
                <input type="checkbox" checked={notif[key]} onChange={()=>setNotif(n=>({...n,[key]:!n[key]}))}/>
                <i className="ps-switch" />
              </label>
            ))}
          </div>

          <h3 className="ps-subtitle">Close account</h3>
          <p className="ps-warning">
            <strong>Warning:</strong> If you close your account, you will lose all access to your
            account and data associated with it, even if you create a new account with the same email.
          </p>
          <button className="ps-danger" onClick={closeAccount}>Close account</button>

          <div className="ps-footer">
            <button className="ps-primary" onClick={savePrivate}>Save changes</button>
          </div>
        </section>
      )}

      {showPwdModal && (
        <div className="ps-modal-backdrop" onClick={()=>setShowPwdModal(false)}>
          <div className="ps-modal" onClick={(e)=>e.stopPropagation()}>
            <div className="ps-modal-head">
              <h2>Change Password</h2>
              <button className="ps-x" onClick={()=>setShowPwdModal(false)}>×</button>
            </div>
            {/* old password is kept in state (storedPassword) and not shown */}
            <div className="ps-field">
              <label>New password</label>
              <input className="ps-input" type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="Enter new password" />
            </div>
            <div className="ps-field">
              <label>Confirm new password</label>
              <input className="ps-input" type="password" value={newPwd2} onChange={e=>setNewPwd2(e.target.value)} placeholder="Re-type new password" />
            </div>
            <div className="ps-modal-foot">
              <button className="ps-primary" onClick={changePassword}>Change password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
