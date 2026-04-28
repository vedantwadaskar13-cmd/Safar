import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import mountain from "../assets/travel.jpg";

export default function PlanTrip() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    destination: "",
    days: "",
    people: "",
    budget: "medium",
    type: "cultural",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!form.destination || !form.days || !form.people) {
      alert("Please fill destination, days and people");
      return;
    }

    if (!auth.currentUser) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          destination: form.destination,
          days: form.days,
          people: form.people,
          budget: form.budget,
          travelType: form.type,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Trip saved successfully ✅");
        console.log("Saved Trip:", data);
      } else {
        alert(data.error || "Trip save failed");
      }
    } catch (err) {
      console.error(err);
      alert("Backend not connected. Start your server first.");
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate("/")}>
        ← Back
      </button>

      <div style={styles.card}>
        <h1 style={styles.title}>Plan Your Trip ✈️</h1>

        <p style={styles.subtitle}>
          Tell us about your trip and save it to your history.
        </p>

        <div style={styles.form}>
          <input
            style={styles.input}
            placeholder="Destination e.g. Goa, Manali, Jaipur"
            value={form.destination}
            onChange={(e) => handleChange("destination", e.target.value)}
          />

          <div style={styles.row}>
            <input
              style={styles.input}
              type="number"
              placeholder="Days"
              value={form.days}
              onChange={(e) => handleChange("days", e.target.value)}
            />

            <input
              style={styles.input}
              type="number"
              placeholder="People"
              value={form.people}
              onChange={(e) => handleChange("people", e.target.value)}
            />
          </div>

          <div style={styles.row}>
            <select
              style={styles.input}
              value={form.budget}
              onChange={(e) => handleChange("budget", e.target.value)}
            >
              <option value="low">Low Budget</option>
              <option value="medium">Medium Budget</option>
              <option value="luxury">Luxury Budget</option>
            </select>

            <select
              style={styles.input}
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <option value="eco">Eco Travel</option>
              <option value="cultural">Cultural</option>
              <option value="adventure">Adventure</option>
              <option value="relaxation">Relaxation</option>
            </select>
          </div>

          <button style={styles.generateBtn} onClick={handleGenerate}>
            Generate Plan
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
    padding: "40px",
    position: "relative",
  },

  backBtn: {
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    background: "rgba(0,0,0,0.5)",
    color: "white",
    cursor: "pointer",
  },

  card: {
    width: "650px",
    padding: "35px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },

  title: {
    fontSize: "34px",
    marginBottom: "8px",
  },

  subtitle: {
    color: "#ddd",
    marginBottom: "25px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },

  input: {
    padding: "13px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.15)",
    color: "white",
    outline: "none",
  },

  generateBtn: {
    marginTop: "10px",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px",
  },
};