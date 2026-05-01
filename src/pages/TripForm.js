import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import mountainImg from "../assets/formpage_bg1.jpg";
import API_BASE_URL from "../config";
import { auth } from "../firebase"; // ✅ NEW

const TripForm = () => {
  const navigate = useNavigate();

  const user = auth.currentUser; // ✅ FIXED (instead of props)

  const [formData, setFormData] = useState({
    state: "",
    destination_city: "",
    user_city: "",
    type: "",
    ageGroup: "",
    days: "",
    budget: "",
    num_people: "",
  });

  const [loading, setLoading] = useState(false);

  console.log("User:", user); // ✅ DEBUG

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FIX: prevent crash if user not loaded
    if (!user) {
      alert("Please login first");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/plan-trip`, {
        userId: user.uid,
        ...formData,
      });

      if (!res.data.success) {
        alert(res.data.error || "Failed to generate trip");
        return;
      }

      navigate("/result", {
        state: { result: res.data.data },
      });

    } catch (error) {
      console.error("Trip generation error:", error);
      alert("Failed to generate trip plan");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      
      {/* BACK BUTTON */}
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back
      </button>

      <div style={styles.container}>
        <div style={styles.glassCard}>

          <div style={styles.brandBox}>
            <h1 style={styles.logoMain}>
              SAFAR <span style={styles.logoAi}>AI</span>
            </h1>
            <div style={styles.brandUnderline}></div>
          </div>

          <p style={styles.tagline}>
            Curating your next world-class experience
          </p>

          <form onSubmit={handleSubmit}>
            <div style={styles.grid}>

              <input
                style={{ ...styles.input, ...styles.blueBorder }}
                type="text"
                name="state"
                placeholder="Enter destination state"
                value={formData.state}
                onChange={handleChange}
                required
              />

              <input
                style={{ ...styles.input, ...styles.blueBorder }}
                type="text"
                name="destination_city"
                placeholder="Enter destination city (optional)"
                value={formData.destination_city}
                onChange={handleChange}
              />

              <input
                style={{ ...styles.input, ...styles.greenBorder }}
                type="text"
                name="user_city"
                placeholder="Leaving from..."
                value={formData.user_city}
                onChange={handleChange}
                required
              />

              <select
                style={{ ...styles.select, ...styles.purpleTheme }}
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Travel type</option>
                {["Cultural", "Nature", "Hill Station", "Adventure", "Any"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <select
                style={{ ...styles.select, ...styles.orangeTheme }}
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Who's going?</option>
                {["Solo", "Couple", "Family", "Friends"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <input
                style={{ ...styles.input, ...styles.redBorder }}
                type="number"
                name="days"
                placeholder="Days"
                value={formData.days}
                onChange={handleChange}
                required
              />

              <input
                style={{ ...styles.input, ...styles.greenBorder }}
                type="number"
                name="num_people"
                placeholder="Number of Travelers"
                value={formData.num_people}
                onChange={handleChange}
                required
                min="1"
              />

              <select
                style={{ ...styles.select, ...styles.goldTheme }}
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Budget</option>
                <option value="Low">Economy</option>
                <option value="Medium">Standard</option>
                <option value="High">Luxury</option>
              </select>

            </div>

            <button 
              style={styles.mainButton} 
              type="submit" 
              disabled={loading || !user} // ✅ FIXED
            >
              {loading ? "Crafting Itinerary..." : "Explore Now"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    position: "relative",
    backgroundImage: `url(${mountainImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
  },

  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(0, 0, 0, 0.25)",
    padding: "20px",
  },

  glassCard: {
    width: "100%",
    maxWidth: "580px",
    padding: "45px",
    borderRadius: "35px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(25px)",
    textAlign: "center",
  },

  backBtn: {
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#1e293b",
    color: "#fff",
    cursor: "pointer",
  },

  logoMain: {
    fontSize: "52px",
    fontWeight: "800",
    color: "#fff",
  },

  logoAi: {
    color: "#4285F4",
  },

  brandUnderline: {
    width: "80px",
    height: "3px",
    background: "linear-gradient(to right, #4285F4, #34A853)",
    margin: "8px auto",
  },

  tagline: {
    color: "#F0F0F0",
    marginBottom: "40px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "25px",
  },

  input: {
    padding: "14px",
    borderRadius: "15px",
  },

  select: {
    padding: "14px",
    borderRadius: "15px",
  },

  mainButton: {
    width: "100%",
    padding: "18px",
    borderRadius: "50px",
    background: "#4285F4",
    color: "#fff",
    cursor: "pointer",
  }
};

export default TripForm;
