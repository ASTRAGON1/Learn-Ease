import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./InstructorCommunity.css";

/**
 * Minimal, social-style community for instructors.
 * - Left: nav + quick composer
 * - Center: feed / groups / instructors
 * - Right: suggestions, trending
 * - Profile Drawer (click any avatar/name)
 */

const TAGS = ["Announcements", "Tips", "Question", "Win", "Resource", "Events"];

export default function InstructorCommunity() {
  const [tab, setTab] = useState("feed"); // feed | groups | instructors
  const [filterTag, setFilterTag] = useState("");
  const [profileUser, setProfileUser] = useState(null); // opens drawer when not null

  // FEED
  const [posts, setPosts] = useState([
    {
      id: 101,
      author: { id: "u5", name: "Maya R.", role: "Speech therapist" },
      tag: "Tips",
      text:
        "Quick win: add 15s ‘movement breaks’ between segments — my retention improved ~18%.",
      ts: "2h",
      likes: 12,
      comments: [{ by: "Jon", text: "Stealing this 👀" }],
      saved: false,
    },
    {
      id: 102,
      author: { id: "u7", name: "Li Wei", role: "Special educator" },
      tag: "Question",
      text:
        "How do you handle parents asking for printable homework every lesson?",
      ts: "5h",
      likes: 7,
      comments: [],
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
    { id: "u2", name: "Ben Gomez", area: "Behavior", followers: 401, following: true,  about: "Behavior analytics and SEL." },
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

  // FEED actions
  const createPost = (payload) => {
    const id = Math.floor(Math.random() * 100000);
    setPosts(p => [{
      id,
      author: { id: "you", name: "You", role: "Instructor" },
      tag: payload.tag,
      text: payload.text.trim(),
      ts: "now",
      likes: 0,
      comments: [],
      saved: false,
    }, ...p]);
  };
  const toggleLike = (id) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, likes: x.likes + 1 } : x));
  const addComment = (id, text) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, comments:[...x.comments, { by:"You", text }] } : x));
  const toggleSave = (id) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, saved: !x.saved } : x));

  // GROUP actions
  const toggleJoin = (gid) =>
    setGroups(g => g.map(x => x.id === gid ? { ...x, joined: !x.joined } : x));
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
  const toggleFollow = (uid) =>
    setInstructors(arr => arr.map(x => x.id === uid ? { ...x, following: !x.following } : x));

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

  return (
    <div className="ic-page">
      {/* Top bar */}
      <div className="ic-topbar">
        <Link to="/InstructorDash" className="ic-back">‹ Dashboard</Link>
        <div className="ic-search">
          <input placeholder="Search posts, people, groups…" />
        </div>
        <div className="ic-top-actions">
          <button className="ghost">🔔</button>
          <button className="ghost">✉️</button>
          <div className="ic-me">YOU</div>
        </div>
      </div>

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
                className={`nav-btn ${tab===key ? "active":""}`}
                onClick={()=>setTab(key==="saved" ? "feed" : key)}
              >
                <span className="ico">{icon}</span>{label}
              </button>
            ))}
          </nav>

          <div className="ic-mini-composer">
            <Composer compact onPost={createPost} />
          </div>

          <div className="ic-left-card">
            <h4>Quick links</h4>
            <ul>
              <li><Link to="/HelpAndSupport">Help & Support</Link></li>
              <li><Link to="/getSupport">Contact Admin</Link></li>
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
                className={`tab ${tab===t ? "active":""}`}
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
                <div className="chips">
                  <button className={`chip ${!filterTag ? "active":""}`} onClick={()=>setFilterTag("")}>All</button>
                  {TAGS.map(t=>(
                    <button
                      key={t}
                      className={`chip ${filterTag===t ? "active":""}`}
                      onClick={()=>setFilterTag(t)}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="post-list">
                {visiblePosts.map(p=>(
                  <PostCard
                    key={p.id}
                    post={p}
                    initials={(n)=>n? n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase():"?"}
                    onLike={()=>toggleLike(p.id)}
                    onComment={(txt)=>addComment(p.id, txt)}
                    onSave={()=>toggleSave(p.id)}
                    onOpenProfile={()=>openProfile(p.author)}
                  />
                ))}
                {visiblePosts.length===0 && (
                  <div className="empty">No posts for “{filterTag}”.</div>
                )}
              </div>
            </>
          )}

          {tab==="groups" && (
            <>
              <div className="between">
                <h3>Groups</h3>
                <button className="primary" onClick={()=>setShowCreate(true)}>+ Create group</button>
              </div>

              <div className="group-list">
                {groups.map(g=>(
                  <div className="group" key={g.id}>
                    <div className="left">
                      <div className="avatar">{g.name[0]}</div>
                      <div>
                        <div className="g-name">{g.name}</div>
                        <div className="muted">{g.members} members</div>
                      </div>
                    </div>
                    <button
                      className={`pill ${g.joined ? "outline":"fill"}`}
                      onClick={()=>toggleJoin(g.id)}
                    >
                      {g.joined? "Joined":"Join"}
                    </button>
                  </div>
                ))}
              </div>

              {showCreate && (
                <Modal title="Create a group" onClose={()=>setShowCreate(false)}>
                  <div className="field">
                    <label>Group name</label>
                    <input
                      className="input"
                      placeholder="ex. Literacy K–1"
                      value={newGroup}
                      onChange={(e)=>setNewGroup(e.target.value)}
                    />
                  </div>
                  <div className="foot">
                    <button className="secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
                    <button className="primary" onClick={createGroup}>Create</button>
                  </div>
                </Modal>
              )}
            </>
          )}

          {tab==="instructors" && (
            <>
              <div className="search-row">
                <input
                  className="input"
                  placeholder="Search instructors or areas…"
                  value={q}
                  onChange={(e)=>setQ(e.target.value)}
                />
              </div>

              <div className="ins-list">
                {filteredInstructors.map(i=>(
                  <div className="ins-card" key={i.id}>
                    <div className="ins-left" onClick={()=>setProfileUser(i)}>
                      <div className="avatar">{initials(i.name)}</div>
                      <div>
                        <div className="name">{i.name}</div>
                        <div className="muted">{i.area}</div>
                      </div>
                    </div>
                    <div className="ins-right">
                      <div className="muted">{i.followers} followers</div>
                      <button
                        className={`pill ${i.following? "outline":"fill"}`}
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
          <div className="side-card">
            <h4>Trending tags</h4>
            <div className="chips">
              {["Tips","Question","Resource","Announcements","Events"].map(t=>(
                <button
                  key={t}
                  className={`chip sm ${filterTag===t ? "active":""}`}
                  onClick={()=>setFilterTag(s=>s===t? "":t)}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>

          <div className="side-card">
            <h4>Who to follow</h4>
            <ul className="who">
              {instructors.slice(0,3).map(p=>(
                <li key={p.id} onClick={()=>setProfileUser(p)}>
                  <div className="avatar">{initials(p.name)}</div>
                  <div>
                    <div className="name">{p.name}</div>
                    <div className="muted">{p.area}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="side-card">
            <h4>Upcoming events</h4>
            <ul className="bullets">
              <li>Office Hours — Fri 10:00 UTC</li>
              <li>Webinar: Better quizzes — Mon 16:00</li>
            </ul>
          </div>
        </aside>
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
    <div className={`composer ${compact? "compact":""}`}>
      <textarea
        className="ta"
        placeholder={compact? "Share a quick tip…":"Share a tip, question, or win…"}
        value={text}
        onChange={(e)=>setText(e.target.value)}
      />
      <div className="composer-foot">
        <select className="input select" value={tag} onChange={(e)=>setTag(e.target.value)}>
          {TAGS.map(t=>(<option key={t}>{t}</option>))}
        </select>
        <button className="primary" onClick={submit}>Post</button>
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
    <div className="post">
      <div className="header">
        <div className="avatar click" onClick={onOpenProfile}>{initials(post.author.name)}</div>
        <div className="meta">
          <div className="a">
            <button className="link name" onClick={onOpenProfile}>{post.author.name}</button>
            <span className="dot">·</span>
            <span className="muted">{post.author.role}</span>
          </div>
          <div className="muted">{post.ts} · #{post.tag}</div>
        </div>
        <div className="h-right">
          <button className="ghost" onClick={()=>setMenu(v=>!v)}>⋯</button>
          {menu && (
            <div className="menu" onMouseLeave={()=>setMenu(false)}>
              <button onClick={onSave}>{post.saved? "Unsave":"Save"}</button>
              <button className="warn" onClick={()=>alert("Reported (demo)")}>Report</button>
            </div>
          )}
        </div>
      </div>

      <div className="body">{post.text}</div>

      <div className="actions">
        <button className="pill outline" onClick={onLike}>👍 {post.likes}</button>
        <button className="pill outline" onClick={()=>setOpen(v=>!v)}>💬 {post.comments.length}</button>
        <span className={`save ${post.saved? "on":""}`} onClick={onSave}>⭐</span>
      </div>

      {open && (
        <div className="comments">
          {post.comments.map((m,i)=>(
            <div key={i} className="comment">
              <strong>{m.by}</strong> {m.text}
            </div>
          ))}
          <div className="comment-add">
            <input
              className="input"
              placeholder="Write a comment…"
              value={c}
              onChange={(e)=>setC(e.target.value)}
              onKeyDown={(e)=>e.key==="Enter" && submit()}
            />
            <button className="primary" onClick={submit}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="x" onClick={onClose}>×</button>
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
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e)=>e.stopPropagation()}>
        <div className="cover" />
        <button className="x abs" onClick={onClose}>×</button>

        <div className="head">
          <div className="avatar big">{initials}</div>
          <div className="info">
            <div className="name">{user.name}</div>
            <div className="muted">{user.area}</div>
            <div className="stats">
              <span><strong>{user.followers}</strong> followers</span>
              <span>·</span>
              <span><strong>0</strong> contents</span>
            </div>
          </div>
          <div className="actions">
            <button className="secondary" onClick={()=>alert("Message (demo)")}>Message</button>
            <button
              className={`pill ${following? "outline":"fill"}`}
              onClick={()=>setFollowing(v=>!v)}
            >
              {following? "Following":"Follow"}
            </button>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab==="content"?"active":""}`} onClick={()=>setTab("content")}>Content</button>
          <button className={`tab ${tab==="about"?"active":""}`} onClick={()=>setTab("about")}>About</button>
        </div>

        <div className="drawer-body">
          {tab==="content" && (
            <div className="content-grid">
              <div className="empty large">No content yet. (Will be filled by backend)</div>
            </div>
          )}
          {tab==="about" && (
            <div className="about">
              <p>{user.about || "Instructor on LearnEase."}</p>
              <ul className="bullets">
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
