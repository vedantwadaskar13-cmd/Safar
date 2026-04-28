import { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

function LoginCard() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Enter email & password");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login Successful ✅");
      } else {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(userCred.user, {
          displayName: name,
        });

        alert("Signup Successful 🎉");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.card}>
      <h2>{isLogin ? "Welcome Back!" : "Create Account"}</h2>

      {!isLogin && (
        <input
          type="text"
          placeholder="Full Name"
          style={styles.input}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      <input
        type="email"
        placeholder="Email"
        style={styles.input}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        style={styles.input}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSubmit} style={styles.btn}>
        {isLogin ? "Login" : "Sign Up"}
      </button>

      <p style={{ marginTop: "10px" }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <span style={styles.switch} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Sign Up" : "Login"}
        </span>
      </p>
    </div>
  );
}

const styles = {
  card: {
    width: "350px",
    padding: "30px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
    color: "white",
  },

  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "none",
  },

  btn: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  switch: {
    color: "#4f9cff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default LoginCard;