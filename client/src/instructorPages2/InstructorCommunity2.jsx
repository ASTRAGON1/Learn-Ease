import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./InstructorCommunity2.css";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getMongoDBToken } from "../utils/auth";

/**
 * Minimal, social-style community for instructors.
 * - Left: nav + quick composer
 * - Center: feed / groups / instructors
 * - Right: suggestions, trending
 * - Profile Drawer (click any avatar/name)
 */

const TAGS = ["Announcements", "Tips", "Question", "Win", "Resource", "Events"];

export default function InstructorCommunity2() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("feed"); // feed | groups | instructors
  const [filterTag, setFilterTag] = useState("");
  const [profileUser, setProfileUser] = useState(null); // opens drawer when not null

  const [instructorName, setInstructorName] = useState('Instructor');
  const [email, setEmail] = useState('');
  const [mongoToken, setMongoToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notifications - stored in component state only (no storage)
  const [notifications, setNotifications] = useState([
    { id: Date.now() - 86400000, type: "likes", text: "Maya R. liked your post", time: "2 hours ago", read: false, timestamp: Date.now() - 7200000 },
    { id: Date.now() - 86400000 + 1, type: "comment", text: "Li Wei commented on your post", time: "5 hours ago", read: false, timestamp: Date.now() - 18000000 },
    { id: Date.now() - 86400000 + 2, type: "follow", text: "Alice Park started following you", time: "1 day ago", read: false, timestamp: Date.now() - 86400000 },
  ]);

  // FEED
  const [posts, setPosts] = useState([
    {
      id: 101,
      author: { id: "u5", name: "Maya R.", role: "Speech therapist" },
      tag: "Tips",
      text: "Quick win: add 15s 'movement breaks' between segments — my retention improved ~18%.",
      ts: "2h",
      likes: 12,
      comments: [{ by: "Jon", text: "Stealing this 👀" }],
      saved: false,
    },
    {
      id: 102,
      author: { id: "u7", name: "Li Wei", role: "Special educator" },
      tag: "Question",
      text: "How do you handle parents asking for printable homework every lesson?",
      ts: "5h",
      likes: 7,
      comments: [],
      saved: false,
    },
    {
      id: 103,
      author: { id: "u8", name: "Sarah Johnson", role: "Math specialist" },
      tag: "Win",
      text: "Just had a breakthrough moment with one of my students today! They finally understood fractions after weeks of practice. 🎉",
      ts: "1d",
      likes: 24,
      comments: [
        { by: "Maya R.", text: "That's amazing! Well done!" },
        { by: "Li Wei", text: "Persistence pays off!" }
      ],
      saved: false,
    },
  ]);

  const visiblePosts = useMemo(
    () => (filterTag ? posts.filter((p) => p.tag === filterTag) : posts),
    [posts, filterTag]
  );

  // GROUPS
  const [groups, setGroups] = useState([
    { id: "g1", name: "Autism K–3", members: 428, joined: true },
    { id: "g2", name: "Down Syndrome — Parents Q&A", members: 311, joined: false },
    { id: "g3", name: "Assistive Tech (AAC)", members: 201, joined: false },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState("");

  // INSTRUCTORS
  const [q, setQ] = useState("");
  const [instructors, setInstructors] = useState([
    { id: "u1", name: "Alice Park", area: "AAC", followers: 540, following: false, about: "AAC specialist and SLP." },
    { id: "u2", name: "Ben Gomez", area: "Behavior", followers: 401, following: true, about: "Behavior analytics and SEL." },
    { id: "u3", name: "Carla Zhou", area: "Reading", followers: 670, following: false, about: "Reading intervention, K-5." },
  ]);
  const filteredInstructors = useMemo(
    () =>
      !q
        ? instructors
        : instructors.filter(
            (i) =>
              i.name.toLowerCase().includes(q.toLowerCase()) ||
              i.area.toLowerCase().includes(q.toLowerCase())
          ),
    [q, instructors]
  );

  const initials = (name) =>
    name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  // Check Firebase Auth and get MongoDB token
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      if (!firebaseUser) {
        setLoading(false);
        navigate('/all-login');
        return;
      }

      try {
        const token = await getMongoDBToken();
        if (token) {
          setMongoToken(token);

          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const teacher = data.data || data;
            
            if (teacher._id) {
              setCurrentUserId(teacher._id.toString());
            }
            
            if (teacher.fullName) {
              const firstName = teacher.fullName.split(' ')[0];
              setInstructorName(firstName);
            }
            
            if (teacher.email) {
              setEmail(teacher.email);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  // Function to add a new notification
  const addNotification = (type, text) => {
    const newNotif = {
      id: Date.now(),
      type,
      text,
      time: "Just now",
      read: false,
      timestamp: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Function to mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  // Function to delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Helper to format time
  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // FEED actions
  const createPost = (payload) => {
    const id = Math.floor(Math.random() * 100000);
    setPosts(p => [{
      id,
      author: { id: "you", name: instructorName || "You", role: "Instructor" },
      tag: payload.tag,
      text: payload.text.trim(),
      ts: "now",
      likes: 0,
      comments: [],
      saved: false,
    }, ...p]);
    addNotification("post", "Your post was published successfully");
  };
  const toggleLike = (id) => {
    const post = posts.find(p => p.id === id);
    if (post && post.author.id !== "you") {
      addNotification("likes", `${post.author.name} liked your post`);
    }
    setPosts(p => p.map(x => x.id === id ? { ...x, likes: x.likes + 1 } : x));
  };
  const addComment = (id, text) => {
    const post = posts.find(p => p.id === id);
    if (post && post.author.id !== "you") {
      addNotification("comment", `${post.author.name} commented on your post`);
    }
    setPosts(p => p.map(x => x.id === id ? { ...x, comments:[...x.comments, { by:instructorName || "You", text }] } : x));
  };
  const toggleSave = (id) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, saved: !x.saved } : x));

  // GROUP actions
  const toggleJoin = (gid) => {
    const group = groups.find(g => g.id === gid);
    const wasJoined = group?.joined;
    setGroups(g => g.map(x => x.id === gid ? { ...x, joined: !x.joined } : x));
    if (!wasJoined) {
      addNotification("group", `You joined the group "${group?.name}"`);
    }
  };
  const createGroup = () => {
    if (!newGroup.trim()) return;
    setGroups(g => [
      { id:`g${g.length+10}`, name:newGroup.trim(), members:1, joined:true },
      ...g
    ]);
    setNewGroup("");
    setShowCreate(false);
  };

  // INSTRUCTOR actions
  const toggleFollow = (uid) => {
    const instructor = instructors.find(i => i.id === uid);
    const wasFollowing = instructor?.following;
    setInstructors(arr => arr.map(x => x.id === uid ? { ...x, following: !x.following } : x));
    if (!wasFollowing) {
      addNotification("follow", `${instructor?.name} started following you`);
    }
  };

  // Profile open helper
  const openProfile = (userLikeObj) => {
    // Try to resolve full instructor from directory, else from post author
    const found = instructors.find(i => i.name === userLikeObj.name) || {
      id: userLikeObj.id,
      name: userLikeObj.name,
      area: userLikeObj.role || "Instructor",
      followers: 0,
      following: false,
      about: "Instructor on LearnEase.",
    };
    setProfileUser(found);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    navigate("/all-login");
  };

  if (loading) {
    return (
      <div className="ld-page">
        <div className="ld-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }


  return (
    <div className="ld-page ic-page-no-sidebar">
      {/* Main Content */}
      <div className="ld-main ic-main-full-width">
        {/* Header */}
        <header className="ld-header">
          <div className="ld-header-left">
            <button className="ld-back-btn" onClick={() => navigate("/instructor-dashboard-2")}>
              <span className="ld-back-chev">‹</span> Dashboard
            </button>
          </div>
          <div className="ld-header-center">
            <div className="ld-search-container">
              <input 
                type="text" 
                placeholder="Search posts, people, groups…" 
                className="ld-search-input"
              />
            </div>
          </div>
          <div className="ld-header-right">
            <div className="ld-notification-wrapper">
              <button className="ld-notification-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="ld-notification-badge">{unreadCount}</span>
                )}
              </button>
              <div className="ld-notification-popover">
                <div className="ld-notification-popover-header">
                  <h4>Notifications {unreadCount > 0 && `(${unreadCount})`}</h4>
                  {notifications.length > 0 && (
                    <button 
                      className="ld-notification-clear-btn"
                      onClick={() => setNotifications([])}
                      title="Clear all"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="ld-notification-popover-list">
                  {notifications.length === 0 ? (
                    <div className="ld-notification-empty">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`ld-notification-popover-item ${notif.read ? 'read' : ''}`} 
                        data-type={notif.type}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="ld-notification-popover-icon">
                          {notif.type === "likes" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                          ) : notif.type === "comment" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                          ) : notif.type === "follow" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="8.5" cy="7" r="4"></circle>
                              <line x1="20" y1="8" x2="20" y2="14"></line>
                              <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                          ) : notif.type === "group" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                          ) : notif.type === "post" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                          )}
                        </div>
                        <div className="ld-notification-popover-content">
                          <div className="ld-notification-popover-text">{notif.text}</div>
                          <div className="ld-notification-popover-time">{notif.time}</div>
                        </div>
                        {!notif.read && <div className="ld-notification-unread-dot"></div>}
                        <button 
                          className="ld-notification-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="ld-profile">
              <div className="ld-profile-info">
                <div className="ld-profile-name">{instructorName}</div>
                {email && <div className="ld-profile-username">{email}</div>}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="ld-content">
          <div className="ic-layout">
            {/* LEFT NAV */}
            <aside className="ic-left">
              <nav className="ic-nav">
                {[
                  ["feed","Home Feed","🏠"],
                  ["instructors","Instructors","👥"],
                  ["groups","Groups","👪"],
                  ["saved","Saved","⭐"], // local only (alias feed filter)
                ].map(([key,label,icon])=>(
                  <button
                    key={key}
                    className={`ic-nav-btn ${tab===key ? "active":""}`}
                    onClick={()=>setTab(key==="saved" ? "feed" : key)}
                  >
                    <span className="ic-nav-icon">{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </nav>

              <div className="ic-mini-composer">
                <Composer compact onPost={createPost} />
              </div>

              <div className="ic-left-card">
                <h4>Quick links</h4>
                <ul>
                  <li><Link to="/HelpAndSupport-2">Help & Support</Link></li>
                  <li><Link to="/GetSupport-2">Contact Admin</Link></li>
                  <li><a href="#!" onClick={(e)=>e.preventDefault()}>Creator Guidelines</a></li>
                </ul>
              </div>
            </aside>

            {/* CENTER MAIN */}
            <main className="ic-center">
              <div className="ic-tabs">
                {["feed","groups","instructors"].map(t=>(
                  <button
                    key={t}
                    className={`ic-tab ${tab===t ? "active":""}`}
                    onClick={()=>setTab(t)}
                  >
                    {t==="feed" ? "Feed" : t==="groups" ? "Groups" : "Instructors"}
                  </button>
                ))}
              </div>

              {tab==="feed" && (
                <>
                  <Composer onPost={createPost} />

                  <div className="ic-filters">
                    <div className="ic-chips">
                      <button className={`ic-chip ${!filterTag ? "active":""}`} onClick={()=>setFilterTag("")}>All</button>
                      {TAGS.map(t=>(
                        <button
                          key={t}
                          className={`ic-chip ${filterTag===t ? "active":""}`}
                          onClick={()=>setFilterTag(t)}
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ic-post-list">
                    {visiblePosts.map(p=>(
                      <PostCard
                        key={p.id}
                        post={p}
                        initials={initials}
                        onLike={()=>toggleLike(p.id)}
                        onComment={(txt)=>addComment(p.id, txt)}
                        onSave={()=>toggleSave(p.id)}
                        onOpenProfile={()=>openProfile(p.author)}
                      />
                    ))}
                    {visiblePosts.length===0 && (
                      <div className="ic-empty">No posts for "{filterTag}".</div>
                    )}
                  </div>
                </>
              )}

              {tab==="groups" && (
                <>
                  <div className="ic-between">
                    <h3>Groups</h3>
                    <button className="ic-primary-btn" onClick={()=>setShowCreate(true)}>+ Create group</button>
                  </div>

                  <div className="ic-group-list">
                    {groups.map(g=>(
                      <div className="ic-group" key={g.id}>
                        <div className="ic-group-left">
                          <div className="ic-avatar">{g.name[0]}</div>
                          <div>
                            <div className="ic-g-name">{g.name}</div>
                            <div className="ic-muted">{g.members} members</div>
                          </div>
                        </div>
                        <button
                          className={`ic-pill ${g.joined ? "outline":"fill"}`}
                          onClick={()=>toggleJoin(g.id)}
                        >
                          {g.joined? "Joined":"Join"}
                        </button>
                      </div>
                    ))}
                  </div>

                  {showCreate && (
                    <Modal title="Create a group" onClose={()=>setShowCreate(false)}>
                      <div className="ic-field">
                        <label>Group name</label>
                        <input
                          className="ic-input"
                          placeholder="ex. Literacy K–1"
                          value={newGroup}
                          onChange={(e)=>setNewGroup(e.target.value)}
                        />
                      </div>
                      <div className="ic-foot">
                        <button className="ic-secondary-btn" onClick={()=>setShowCreate(false)}>Cancel</button>
                        <button className="ic-primary-btn" onClick={createGroup}>Create</button>
                      </div>
                    </Modal>
                  )}
                </>
              )}

              {tab==="instructors" && (
                <>
                  <div className="ic-search-row">
                    <input
                      className="ic-input"
                      placeholder="Search instructors or areas…"
                      value={q}
                      onChange={(e)=>setQ(e.target.value)}
                    />
                  </div>

                  <div className="ic-ins-list">
                    {filteredInstructors.map(i=>(
                      <div className="ic-ins-card" key={i.id}>
                        <div className="ic-ins-left" onClick={()=>setProfileUser(i)}>
                          <div className="ic-avatar">{initials(i.name)}</div>
                          <div>
                            <div className="ic-name">{i.name}</div>
                            <div className="ic-muted">{i.area}</div>
                          </div>
                        </div>
                        <div className="ic-ins-right">
                          <div className="ic-muted">{i.followers} followers</div>
                          <button
                            className={`ic-pill ${i.following? "outline":"fill"}`}
                            onClick={()=>toggleFollow(i.id)}
                          >
                            {i.following? "Following":"Follow"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </main>

            {/* RIGHT SUGGESTIONS */}
            <aside className="ic-right">
              <div className="ic-side-card">
                <h4>Trending tags</h4>
                <div className="ic-chips">
                  {["Tips","Question","Resource","Announcements","Events"].map(t=>(
                    <button
                      key={t}
                      className={`ic-chip ic-chip-sm ${filterTag===t ? "active":""}`}
                      onClick={()=>setFilterTag(s=>s===t? "":t)}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ic-side-card">
                <h4>Who to follow</h4>
                <ul className="ic-who">
                  {instructors.slice(0,3).map(p=>(
                    <li key={p.id} onClick={()=>setProfileUser(p)}>
                      <div className="ic-avatar">{initials(p.name)}</div>
                      <div>
                        <div className="ic-name">{p.name}</div>
                        <div className="ic-muted">{p.area}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ic-side-card">
                <h4>Upcoming events</h4>
                <ul className="ic-bullets">
                  <li>Office Hours — Fri 10:00 UTC</li>
                  <li>Webinar: Better quizzes — Mon 16:00</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* PROFILE DRAWER */}
      {profileUser && (
        <ProfileDrawer
          user={profileUser}
          onClose={()=>setProfileUser(null)}
        />
      )}
    </div>
  );
}

/* ---------------- Subcomponents ---------------- */

function Composer({ onPost, compact=false }) {
  const [text, setText] = useState("");
  const [tag, setTag] = useState("Tips");

  const submit = () => {
    if (!text.trim()) return;
    onPost?.({ text, tag });
    setText("");
    setTag("Tips");
  };

  return (
    <div className={`ic-composer ${compact? "compact":""}`}>
      <textarea
        className="ic-ta"
        placeholder={compact? "Share a quick tip…":"Share a tip, question, or win…"}
        value={text}
        onChange={(e)=>setText(e.target.value)}
      />
      <div className="ic-composer-foot">
        <select className="ic-input ic-select" value={tag} onChange={(e)=>setTag(e.target.value)}>
          {TAGS.map(t=>(<option key={t}>{t}</option>))}
        </select>
        <button className="ic-primary-btn" onClick={submit}>Post</button>
      </div>
    </div>
  );
}

function PostCard({ post, initials, onLike, onComment, onSave, onOpenProfile }) {
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const [c, setC] = useState("");

  const submit = () => {
    if (!c.trim()) return;
    onComment(c.trim());
    setC(""); setOpen(true);
  };

  return (
    <div className="ic-post">
      <div className="ic-post-header">
        <div className="ic-avatar ic-avatar-click" onClick={onOpenProfile}>{initials(post.author.name)}</div>
        <div className="ic-meta">
          <div className="ic-meta-a">
            <button className="ic-link ic-name" onClick={onOpenProfile}>{post.author.name}</button>
            <span className="ic-dot">·</span>
            <span className="ic-muted">{post.author.role}</span>
          </div>
          <div className="ic-muted">{post.ts} · #{post.tag}</div>
        </div>
        <div className="ic-h-right">
          <button className="ic-ghost" onClick={()=>setMenu(v=>!v)}>⋯</button>
          {menu && (
            <div className="ic-menu" onMouseLeave={()=>setMenu(false)}>
              <button onClick={onSave}>{post.saved? "Unsave":"Save"}</button>
              <button className="ic-warn" onClick={()=>alert("Reported (demo)")}>Report</button>
            </div>
          )}
        </div>
      </div>

      <div className="ic-body">{post.text}</div>

      <div className="ic-actions">
        <button className="ic-pill ic-pill-outline" onClick={onLike}>👍 {post.likes}</button>
        <button className="ic-pill ic-pill-outline" onClick={()=>setOpen(v=>!v)}>💬 {post.comments.length}</button>
        <span className={`ic-save ${post.saved? "on":""}`} onClick={onSave}>⭐</span>
      </div>

      {open && (
        <div className="ic-comments">
          {post.comments.map((m,i)=>(
            <div key={i} className="ic-comment">
              <strong>{m.by}</strong> {m.text}
            </div>
          ))}
          <div className="ic-comment-add">
            <input
              className="ic-input"
              placeholder="Write a comment…"
              value={c}
              onChange={(e)=>setC(e.target.value)}
              onKeyDown={(e)=>e.key==="Enter" && submit()}
            />
            <button className="ic-primary-btn" onClick={submit}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="ic-modal-backdrop" onClick={onClose}>
      <div className="ic-modal" onClick={(e)=>e.stopPropagation()}>
        <div className="ic-modal-head">
          <h3>{title}</h3>
          <button className="ic-x" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Profile Drawer — Content tab is intentionally empty for backend to fill later */
function ProfileDrawer({ user, onClose }) {
  const [tab, setTab] = useState("content"); // content | about
  const initials = user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const [following, setFollowing] = useState(!!user.following);

  return (
    <div className="ic-drawer-backdrop" onClick={onClose}>
      <div className="ic-drawer" onClick={(e)=>e.stopPropagation()}>
        <div className="ic-cover" />
        <button className="ic-x ic-x-abs" onClick={onClose}>×</button>

        <div className="ic-drawer-head">
          <div className="ic-avatar ic-avatar-big">{initials}</div>
          <div className="ic-drawer-info">
            <div className="ic-drawer-name">{user.name}</div>
            <div className="ic-muted">{user.area}</div>
            <div className="ic-stats">
              <span><strong>{user.followers}</strong> followers</span>
              <span>·</span>
              <span><strong>0</strong> contents</span>
            </div>
          </div>
          <div className="ic-drawer-actions">
            <button className="ic-secondary-btn" onClick={()=>alert("Message (demo)")}>Message</button>
            <button
              className={`ic-pill ${following? "outline":"fill"}`}
              onClick={()=>setFollowing(v=>!v)}
            >
              {following? "Following":"Follow"}
            </button>
          </div>
        </div>

        <div className="ic-drawer-tabs">
          <button className={`ic-drawer-tab ${tab==="content"?"active":""}`} onClick={()=>setTab("content")}>Content</button>
          <button className={`ic-drawer-tab ${tab==="about"?"active":""}`} onClick={()=>setTab("about")}>About</button>
        </div>

        <div className="ic-drawer-body">
          {tab==="content" && (
            <div className="ic-content-grid">
              <div className="ic-empty ic-empty-large">No content yet. (Will be filled by backend)</div>
            </div>
          )}
          {tab==="about" && (
            <div className="ic-about">
              <p>{user.about || "Instructor on LearnEase."}</p>
              <ul className="ic-bullets">
                <li>Focus area: {user.area}</li>
                <li>Joined: 2025</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

