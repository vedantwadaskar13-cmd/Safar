import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import AuthForm from "./AuthForm";
import bgImage from "./assets/dashboard.jpg";

const LandingPage = ({ user }) => {
  const navigate = useNavigate();
  const [centered, setCentered] = useState(false);

  useEffect(() => {
    if (user) {
      setTimeout(() => setCentered(true), 300);
    } else {
      setCentered(false);
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <div style={styles.navSideLeft}>
          <div style={styles.logo} onClick={() => navigate("/")}>
            🌊Safar
          </div>
        </div>

        <div style={styles.navCenter}>
          <button style={styles.navBtn} onClick={() => navigate("/")}>
            Home
          </button>
          <button style={styles.navBtn} onClick={() => navigate("/plan-trip")}>
            Plan Trip
          </button>
          
          <button style={styles.navBtn} onClick={() => navigate("/chat")}>
            AI Chat
          </button>
          <button style={styles.navBtn} onClick={() => navigate("/help")}>
            Help
          </button>
        </div>

        <div style={styles.navSideRight}>
          {user ? (
            <>
              <span>{user.displayName || "User"}</span>
              <button
                style={styles.profileBtn}
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <span>Guest</span>
          )}
        </div>
      </div>

      <div style={styles.main}>
        <div
          className="content"
          style={{
            ...styles.left,
            ...(centered ? styles.centered : {}),
          }}
        >
          <h1 style={styles.title}>
            Your Journey,
            <br />
            Intelligently Planned
          </h1>

          <p style={styles.subtitle}>
            Discover eco-friendly & cultural destinations tailored just for you.
          </p>

          {user && (
            <p style={styles.welcome}>
              Welcome, {user.displayName || "Traveler"} 👋
            </p>
          )}

          <div style={styles.btnGroup}>
            <button
              style={styles.primaryBtn}
              onClick={() => navigate("/plan-trip")}
            >
              Plan Trip
            </button>

            
            <button
              style={styles.secondaryBtn}
              onClick={() => navigate("/chat")}
            >
              AI Chat
            </button>
          </div>
        </div>

        {!user && <AuthForm />}
      </div>

      <style>
        {`
          .content {
            transition: all 1.5s ease-in-out;
          }

          button:hover {
            opacity: 0.9;
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    backgroundImage: `linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)), url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "white",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  navbar: {
    display: "flex",
    alignItems: "center",
    padding: "20px 40px",
    background: "rgba(0,0,0,0.22)",
    backdropFilter: "blur(10px)",
  },

  navSideLeft: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-start",
  },

  navSideRight: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    alignItems: "center",
  },

  navCenter: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    gap: "40px",
  },

  logo: {
    fontSize: "34px",
    fontWeight: "800",
    cursor: "pointer",
  },

  navBtn: {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  profileBtn: {
    padding: "8px 14px",
    background: "rgba(37, 99, 235, 0.9)",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },

  logoutBtn: {
    padding: "8px 14px",
    background: "rgba(220, 38, 38, 0.9)",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },

  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "60px 90px",
  },

  left: {
    maxWidth: "560px",
    width: "100%",
  },

  centered: {
    margin: "0 auto",
    textAlign: "center",
    transform: "scale(1.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  title: {
    fontSize: "64px",
    lineHeight: "1.18",
    fontWeight: "900",
    margin: 0,
    textShadow: "0 4px 18px rgba(0,0,0,0.35)",
  },

  subtitle: {
    marginTop: "24px",
    fontSize: "22px",
    lineHeight: "1.5",
    color: "rgba(255,255,255,0.92)",
    maxWidth: "540px",
  },

  welcome: {
    marginTop: "12px",
    color: "#90ee90",
    fontSize: "18px",
    fontWeight: "600",
  },

  btnGroup: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
    gap: "18px",
    width: "100%",
  },

  primaryBtn: {
    padding: "15px 28px",
    background: "white",
    color: "#0f172a",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "17px",
    fontWeight: "800",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  },

  secondaryBtn: {
    padding: "15px 28px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.55)",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer",
    fontSize: "17px",
    fontWeight: "800",
    backdropFilter: "blur(8px)",
  },
};

export default LandingPage;