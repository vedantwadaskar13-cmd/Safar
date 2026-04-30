import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import mountainImg from "../assets/formpage_bg1.jpg";
import API_BASE_URL from "../config";

const TripForm = ({ user }) => {
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/plan-trip`, {
        userId: user.uid,
        ...formData,
      });

      if (res.data.success) {
        navigate("/result", {
          state: { result: res.data.data },
        });
      } else {
        alert(res.data.error || "Failed to generate trip plan");
      }
    } catch (error) {
      console.error(
        "Trip generation error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.error ||
          "Failed to generate trip plan"
      );
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
              <div style={styles.field}>
                <input
                  style={{ ...styles.input, ...styles.blueBorder }}
                  type="text"
                  name="state"
                  placeholder="Enter destination state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={styles.field}>
                <input
                  style={{ ...styles.input, ...styles.blueBorder }}
                  type="text"
                  name="destination_city"
                  placeholder="Enter destination city (optional)"
                  value={formData.destination_city}
                  onChange={handleChange}
                />
              </div>

              <div style={styles.field}>
                <input
                  style={{ ...styles.input, ...styles.greenBorder }}
                  type="text"
                  name="user_city"
                  placeholder="Leaving from..."
                  value={formData.user_city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={styles.field}>
                <select
                  style={{ ...styles.select, ...styles.purpleTheme }}
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Travel type
                  </option>
                  {["Cultural", "Nature", "Hill Station", "Adventure", "Any"].map(
                    (opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div style={styles.field}>
                <select
                  style={{ ...styles.select, ...styles.orangeTheme }}
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Who's going?
                  </option>
                  {["Solo", "Couple", "Family", "Friends"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <input
                  style={{ ...styles.input, ...styles.redBorder }}
                  type="number"
                  name="days"
                  placeholder="Days"
                  value={formData.days}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={styles.field}>
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
              </div>

              <div style={styles.field}>
                <select
                  style={{ ...styles.select, ...styles.goldTheme }}
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Budget
                  </option>
                  <option value="Low">Economy</option>
                  <option value="Medium">Standard</option>
                  <option value="High">Luxury</option>
                </select>
              </div>
            </div>

            <button style={styles.mainButton} type="submit" disabled={loading}>
              {loading ? "Crafting Itinerary..." : "Explore Now"}
            </button>
          </form>
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
    backgroundAttachment: "fixed",
    minHeight: "100vh",
    fontFamily: "'Montserrat', 'Poppins', sans-serif",
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
    backdropFilter: "blur(25px) saturate(200%)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
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
    fontSize: "14px",
    cursor: "pointer",
    zIndex: 10,
  },

  brandBox: {
    marginBottom: "5px",
  },

  logoMain: {
    fontSize: "52px",
    fontWeight: "800",
    letterSpacing: "4px",
    color: "#FFFFFF",
    margin: "0",
    fontFamily: "'Playfair Display', serif",
  },

  logoAi: {
    color: "#4285F4",
    fontWeight: "300",
  },

  brandUnderline: {
    width: "80px",
    height: "3px",
    background:
      "linear-gradient(to right, #4285F4, #34A853, #FBBC05, #EA4335)",
    margin: "8px auto",
    borderRadius: "2px",
  },

  tagline: {
    color: "#F0F0F0",
    fontSize: "14px",
    marginBottom: "40px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "25px",
  },

  field: {
    width: "100%",
  },

  input: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "15px",
    border: "2px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.95)",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  select: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "15px",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  blueBorder: { borderColor: "#4285F4" },
  greenBorder: { borderColor: "#34A853" },
  redBorder: { borderColor: "#EA4335" },

  purpleTheme: { borderColor: "#A142F4" },
  orangeTheme: { borderColor: "#FB8C00" },
  goldTheme: { borderColor: "#FBBC05" },

  mainButton: {
    width: "100%",
    padding: "18px",
    border: "none",
    borderRadius: "50px",
    background: "linear-gradient(135deg, #4285F4 0%, #1a73e8 100%)",
    color: "#FFFFFF",
    fontSize: "18px",
    cursor: "pointer",
  },
};

export default TripForm;
