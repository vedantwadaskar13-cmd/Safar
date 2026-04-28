import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import mountainImg from "../assets/chatbot.jpg";

const Chatbot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tripContext = location.state?.tripContext || {};

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I’m your AI Travel Assistant. Ask me anything about your trip ✈️"
    }
  ]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post("http://localhost:8000/chat", {
        message,
        trip_context: tripContext,
      });

      const aiMessage = {
        sender: "ai",
        text: res.data.response,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Something went wrong. Please try again." }
      ]);
    }

    setMessage("");
  };

  return (
    <div style={styles.page}>

      {/* ✅ BACK BUTTON (TOP-LEFT OF BACKGROUND) */}
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back
      </button>

      <div style={styles.overlay}>
        <div style={styles.chatContainer}>

          <h1 style={styles.heading}>🤖 AI Travel Assistant</h1>
          <p style={styles.subheading}>
            Ask about routes, food, places, and travel tips
          </p>

          <div style={styles.chatBox}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    background:
                      msg.sender === "user"
                        ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
                        : "rgba(255,255,255,0.95)",
                    color: msg.sender === "user" ? "#fff" : "#1e293b",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.inputRow}>
            <input
              type="text"
              placeholder="Ask about your trip..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={styles.input}
            />
            <button onClick={sendMessage} style={styles.sendBtn}>
              Send
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    position: "relative",
    backgroundImage: `url(${mountainImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    fontFamily: "'Poppins', 'sans-serif'"
  },

  /* ✅ BACK BUTTON STYLE */
  backBtn: {
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#1e293b",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
    zIndex: 10,
  },

  overlay: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(15, 23, 42, 0.35)",
    padding: "20px",
  },

  chatContainer: {
    width: "100%",
    maxWidth: "720px",
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(14px)",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  heading: {
    textAlign: "center",
    color: "#ffffff",
    marginBottom: "4px",
    fontSize: "24px",
    fontWeight: "600",
    letterSpacing: "-0.5px",
  },

  subheading: {
    textAlign: "center",
    color: "#e2e8f0",
    marginBottom: "18px",
    fontSize: "13px",
    fontWeight: "400",
  },

  chatBox: {
    height: "400px",
    overflowY: "auto",
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.10)",
    marginBottom: "14px",
  },

  messageBubble: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: "14px",
    fontSize: "16px",
    lineHeight: "1.5",
    fontWeight: "400",
  },

  inputRow: {
    display: "flex",
    gap: "8px",
  },

  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    fontFamily: "'Poppins', 'sans-serif'",
    background: "rgba(255,255,255,0.9)",
  },

  sendBtn: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  }
};

export default Chatbot;
