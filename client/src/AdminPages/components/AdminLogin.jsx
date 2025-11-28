import React from "react";

function AdminLogin({ loginForm, setLoginForm, loginBusy, loginError, onLogin }) {
  return (
    <div className="login">
      <div className="login-card">
        <div className="le-logo">
          <div className="le-logo-badge">LE</div> LearnEase Admin
        </div>
        <h1>Sign in</h1>
        <form onSubmit={onLogin} className="row" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            required
            value={loginForm.email}
            onChange={(e) => setLoginForm(p => ({ ...p, email: e.target.value }))}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            required
            value={loginForm.password}
            onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))}
          />
          <button className="btn" type="submit" disabled={loginBusy}>
            {loginBusy ? "Logging in..." : "Login"}
          </button>
          {loginError && <div className="sub" style={{ color: "#c1352b" }}>{loginError}</div>}
          <div className="sub">Demo accepts any credentials. Wire api.adminLogin() to enforce real auth.</div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;

