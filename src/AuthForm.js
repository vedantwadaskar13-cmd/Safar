import React, { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(userCred.user, {
          displayName: name,
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>
        {isLogin ? "Welcome Back!" : "Create Account"}
      </h2>

      <p style={styles.subtitle}>
        {isLogin
          ? "Sign in to continue your journey"
          : "Sign up to start your journey"}
      </p>

      {!isLogin && (
        <div style={styles.inputBox}>
          <span style={styles.icon}>👤</span>
          <input
            style={styles.input}
            type="text"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}

      <div style={styles.inputBox}>
        <span style={styles.icon}>✉️</span>
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div style={styles.inputBox}>
        <span style={styles.icon}>🔒</span>
        <input
          style={styles.input}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <span
          style={styles.eye}
          onClick={() => setShowPassword(!showPassword)}
        >
          👁️
        </span>
      </div>

      {isLogin && (
        <div style={styles.options}>
          <label style={styles.remember}>
            <input type="checkbox" />
            Remember me
          </label>

          <span style={styles.forgot}>Forgot Password?</span>
        </div>
      )}

      <button style={styles.loginBtn} onClick={handleSubmit}>
        {isLogin ? "Login" : "Sign Up"}
      </button>

      <div style={styles.divider}>
        <span style={styles.line}></span>
        <span style={styles.or}>or</span>
        <span style={styles.line}></span>
      </div>

      <button
        style={styles.signupBtn}
        onClick={() => setIsLogin(!isLogin)}
      >
        <span style={{ marginRight: "8px" }}>♙</span>
        {isLogin ? "Sign Up" : "Login"}
      </button>
    </div>
  );
};

const styles = {
  card: {
    width: "360px",
    padding: "28px",
    borderRadius: "18px",
    background: "rgba(6, 29, 62, 0.55)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.35)",
    boxShadow: "0 15px 40px rgba(0,0,0,0.35)",
    color: "white",
    textAlign: "center",
  },

  title: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "8px",
  },

  subtitle: {
    fontSize: "14px",
    marginBottom: "24px",
    color: "rgba(255,255,255,0.9)",
  },

  inputBox: {
    height: "50px",
    display: "flex",
    alignItems: "center",
    marginBottom: "14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.65)",
    background: "rgba(255,255,255,0.04)",
    padding: "0 14px",
  },

  icon: {
    fontSize: "17px",
    marginRight: "12px",
    opacity: 0.9,
  },

  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: "15px",
  },

  eye: {
    cursor: "pointer",
    opacity: 0.85,
  },

  options: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "8px 0 20px",
    fontSize: "13px",
  },

  remember: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  forgot: {
    cursor: "pointer",
  },

  loginBtn: {
    width: "100%",
    height: "48px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "20px",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  line: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.45)",
  },

  or: {
    fontSize: "14px",
  },

  signupBtn: {
    width: "100%",
    height: "48px",
    borderRadius: "9px",
    border: "1px solid rgba(255,255,255,0.75)",
    background: "transparent",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default AuthForm;