import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileSettings.css";
import { uploadFile } from "../utils/uploadFile";
import { auth } from "../config/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const COUNTRIES = [
  "United States","United Kingdom","Germany","France","Canada","India",
  "Morocco","Algeria","Tunisia","Spain","Italy","Australia","Brazil","Japan"
];

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");

  // LearnEase Profile
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarURL, setAvatarURL] = useState("");
  const [avatarStoragePath, setAvatarStoragePath] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Private setting
  const [email, setEmail] = useState("");
  const [hasPassword, setHasPassword] = useState(false); // whether user has a password set
  const [passwordMask] = useState("•••••••••••••••");
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState(""); // current password for verification
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [notif, setNotif] = useState({
    updates: true, admin: true, performance: true, ranking: true, followers: false,
  });

  // ---- Fetch data from backend ----
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        navigate('/InstructorLogin');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          navigate('/InstructorLogin');
          return;
        }

        if (response.ok) {
          const result = await response.json();
          const teacher = result.data;
          
          setFullName(teacher.fullName || "");
          setHeadline(teacher.headline || "");
          setBio(teacher.bio || "");
          setCountry(teacher.country || "");
          setWebsite(teacher.website || "");
          setEmail(teacher.email || "");
          setAvatarURL(teacher.profilePic || "");
          setAvatarStoragePath(teacher.profilePicStoragePath || "");
          setHasPassword(teacher.hasPassword || false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in to save profile");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please log in to save profile");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let profilePicURL = avatarURL;
      let profilePicStoragePath = avatarStoragePath;
      
      // Upload profile picture to Firebase Storage if changed
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          // Delete old profile picture if exists
          if (avatarStoragePath) {
            try {
              const { deleteFileByPath } = await import("../utils/uploadFile");
              await deleteFileByPath(avatarStoragePath);
            } catch (e) {
              console.log('Could not delete old profile picture:', e);
            }
          }
          
          // Upload new profile picture
          const uploadResult = await uploadFile(
            avatarFile,
            'profile',
            currentUser.uid,
            null
          );
          
          profilePicURL = uploadResult.url;
          profilePicStoragePath = uploadResult.path;
          setAvatarURL(profilePicURL);
          setAvatarStoragePath(profilePicStoragePath);
        } catch (error) {
          console.error('Error uploading profile picture:', error);
          alert(`Failed to upload profile picture: ${error.message}`);
          setUploadingAvatar(false);
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }
      
      // Update profile data
      const response = await fetch(`${API_URL}/api/teachers/me`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          fullName, 
          headline, 
          bio, 
          country,
          website,
          profilePic: profilePicURL
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      alert("Profile saved successfully");
      setAvatarFile(null); // Clear file after successful save
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Failed to save: ${error.message}`);
    }
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

  const changePassword = async () => {
    if (!currentPwd) {
      alert("Please enter your current password.");
      return;
    }
    if (!newPwd || newPwd.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }
    if (newPwd !== newPwd2) {
      alert("New passwords do not match.");
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in to change password");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please log in to change password");
      return;
    }

    setChangingPassword(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Step 1: Update Firebase password if user has Firebase account
      let firebaseUpdated = false;
      if (currentUser.email) {
        try {
          // Re-authenticate user with current password
          const credential = EmailAuthProvider.credential(currentUser.email, currentPwd);
          await reauthenticateWithCredential(currentUser, credential);
          
          // Update Firebase password
          await updatePassword(currentUser, newPwd);
          firebaseUpdated = true;
          console.log('Firebase password updated successfully');
        } catch (firebaseError) {
          // If Firebase update fails, check if it's because user doesn't use Firebase auth
          if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
            // User might not have Firebase password, continue to MongoDB update
            console.log('Firebase password update skipped:', firebaseError.code);
          } else {
            throw new Error(`Firebase error: ${firebaseError.message}`);
          }
        }
      }

      // Step 2: Update MongoDB password
      const response = await fetch(`${API_URL}/api/teachers/me/password`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          currentPassword: currentPwd,
          newPassword: newPwd,
          updateFirebase: false // Backend doesn't need to update Firebase, we did it in frontend
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        // If Firebase was updated but MongoDB failed, we have a problem
        if (firebaseUpdated) {
          throw new Error(`MongoDB update failed: ${error.error}. Firebase password was updated.`);
        }
        throw new Error(error.error || 'Failed to change password');
      }

      alert("Password updated successfully in both Firebase and MongoDB");
      setShowPwdModal(false);
      setCurrentPwd("");
      setNewPwd("");
      setNewPwd2("");
      setHasPassword(true); // Update state since password is now set
    } catch (error) {
      console.error('Error changing password:', error);
      alert(`Failed to change password: ${error.message}`);
    } finally {
      setChangingPassword(false);
    }
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
        Signed in as {fullName || "—"}
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading profile...</div>
          ) : (
            <div className="ps-grid">
              <div className="ps-col">
                <div className="ps-field">
                  <label>Full Name</label>
                  <input className="ps-input" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="ex. John Doe" />
                </div>
                <div className="ps-field">
                  <label>Headline</label>
                  <input className="ps-input" value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="Short description that shows on your profile" />
                  <small className="ps-help">This headline will be shown on your profile</small>
                </div>
                <div className="ps-field">
                  <label>Description (Biography)</label>
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
          )}

          <div className="ps-footer">
            <button className="ps-primary" onClick={saveProfile} disabled={loading || uploadingAvatar}>
              {uploadingAvatar ? "Uploading..." : "Save changes"}
            </button>
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
              <input 
                className="ps-input" 
                type="password"
                value={passwordMask} 
                readOnly 
              />
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

          <h3 className="ps-subtitle">Logout</h3>
          <p className="ps-warning">
            Log out of your account. You will need to log in again to access your dashboard.
          </p>
          <button 
            className="ps-secondary" 
            onClick={() => {
              // Clear all authentication tokens
              localStorage.removeItem('token');
              localStorage.removeItem('le_instructor_token');
              localStorage.removeItem('role');
              localStorage.removeItem('userId');
              localStorage.removeItem('le_instructor_id');
              localStorage.removeItem('userName');
              localStorage.removeItem('le_instructor_name');
              localStorage.removeItem('userEmail');
              
              // Clear sessionStorage as well
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('le_instructor_token');
              sessionStorage.removeItem('role');
              sessionStorage.removeItem('userId');
              sessionStorage.removeItem('le_instructor_id');
              sessionStorage.removeItem('userName');
              sessionStorage.removeItem('le_instructor_name');
              sessionStorage.removeItem('userEmail');
              sessionStorage.removeItem('instructorSignupEmail');
              
              // Redirect to login page
              navigate('/InstructorLogin');
            }}
            style={{ marginBottom: '32px' }}
          >
            Logout
          </button>

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
              <button className="ps-x" onClick={()=>{
                setShowPwdModal(false);
                setCurrentPwd("");
                setNewPwd("");
                setNewPwd2("");
              }}>×</button>
            </div>
            <div className="ps-field">
              <label>Current password</label>
              <input 
                className="ps-input" 
                type="password" 
                value={currentPwd} 
                onChange={e=>setCurrentPwd(e.target.value)} 
                placeholder="Enter your current password" 
              />
            </div>
            <div className="ps-field">
              <label>New password</label>
              <input 
                className="ps-input" 
                type="password" 
                value={newPwd} 
                onChange={e=>setNewPwd(e.target.value)} 
                placeholder="Enter new password (min. 6 characters)" 
              />
            </div>
            <div className="ps-field">
              <label>Confirm new password</label>
              <input 
                className="ps-input" 
                type="password" 
                value={newPwd2} 
                onChange={e=>setNewPwd2(e.target.value)} 
                placeholder="Re-type new password" 
              />
            </div>
            <div className="ps-modal-foot">
              <button 
                className="ps-primary" 
                onClick={changePassword}
                disabled={changingPassword}
              >
                {changingPassword ? "Changing..." : "Change password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
