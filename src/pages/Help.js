import { useState } from "react";
import { useNavigate } from "react-router-dom";
import mountain from "../assets/mountain.jpg";

export default function Help() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "How do I plan a trip?",
      a: "Click on “Plan Trip”, enter your destination, days, budget and travel style.",
    },
    {
      q: "Where can I see my saved trips?",
      a: "Your saved trips will appear inside your Profile under the Trips tab.",
    },
    {
      q: "Can I update my profile?",
      a: "Yes, go to Profile → Settings and update your name or profile picture.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate("/")}>
        ← Back
      </button>

      <div style={styles.card}>
        <h1 style={styles.title}>Help & Support</h1>
        <p style={styles.subtitle}>
          Need help using Safar? Click below to explore answers.
        </p>

        {/* FAQ */}
        <div style={styles.section}>
          <h3> Frequently Asked Questions</h3>

          {faqs.map((item, index) => (
            <div
              key={index}
              style={styles.faq}
              onClick={() => toggleFAQ(index)}
            >
              <div style={styles.question}>
                {item.q}
                <span>
                  {openIndex === index ? "▲" : "▼"}
                </span>
              </div>

              {openIndex === index && (
                <p style={styles.answer}>{item.a}</p>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={styles.section}>
          <h3>📞 Contact Support</h3>
          <p>Email: support@safar.com</p>
          <p>Phone: +91 70571 74952</p>
        </div>

        {/* AI */}
        <div style={styles.section}>
          <h3>💬 Quick Help</h3>
          <button style={styles.helpBtn} onClick={() => navigate("/chat")}>
            Ask AI Assistant
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${mountain})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    position: "relative",
  },

  backBtn: {
    position: "absolute",
    top: "15px",
    left: "15px",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "rgba(0,0,0,0.5)",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
  },

  card: {
    width: "100%",
    maxWidth: "720px",
    padding: "25px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },

  title: {
    fontSize: "28px",
    marginBottom: "10px",
    textAlign: "center",
  },

  subtitle: {
    color: "#ddd",
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "14px",
  },

  section: {
    marginTop: "20px",
  },

  faq: {
    background: "rgba(255,255,255,0.1)",
    padding: "12px",
    borderRadius: "10px",
    marginTop: "10px",
    cursor: "pointer",
    transition: "0.3s",
  },

  question: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "14px",
    gap: "10px",
  },

  answer: {
    marginTop: "8px",
    color: "#ddd",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  helpBtn: {
    padding: "10px 16px",
    background: "#2563eb",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    width: "100%",
  },
};
