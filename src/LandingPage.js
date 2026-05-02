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
    minHeight: "100vh",
    width: "100%",
    backgroundImage: `linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)), url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "white",
    display: "flex",
    flexDirection: "column",
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
    fontSize: "28px",
    fontWeight: "800",
    cursor: "pointer",
  },

  navBtn: {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },

  profileBtn: {
    padding: "8px 14px",
    background: "#2563eb",
    borderRadius: "8px",
    color: "white",
    border: "none",
  },

  logoutBtn: {
    padding: "8px 14px",
    background: "#dc2626",
    borderRadius: "8px",
    color: "white",
    border: "none",
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  title: {
    fontSize: "64px",
    fontWeight: "900",
  },

  subtitle: {
    marginTop: "20px",
    fontSize: "20px",
  },

  welcome: {
    marginTop: "10px",
    color: "#90ee90",
  },

  btnGroup: {
    marginTop: "25px",
    display: "flex",
    gap: "18px",
  },

  primaryBtn: {
    padding: "14px 24px",
    background: "white",
    color: "#000",
    borderRadius: "10px",
    border: "none",
    fontWeight: "700",
  },

  secondaryBtn: {
    padding: "14px 24px",
    background: "transparent",
    border: "1px solid white",
    borderRadius: "10px",
    color: "white",
  },
};

export default LandingPage;

export default LandingPage;
