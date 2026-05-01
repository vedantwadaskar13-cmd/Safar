import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { motion } from "framer-motion";
import TravelMapOSM from "../components/TravelMapOSM";
import mountainImg from "../assets/formpage_bg1.jpg";

const TravelResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const pdfRef = useRef();

  const getImage = (name) =>
    `https://source.unsplash.com/800x500/?${name},travel`;

  const downloadPDF = () => {
    html2pdf().from(pdfRef.current).save();
  };

  if (!result) {
    return (
      <div style={styles.page}>
        <h2 style={{ color: "#fff" }}>No trip data</h2>
      </div>
    );
  }

  return (
    <motion.div
      style={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={styles.container}>

        {/* HERO */}
        <motion.div
          style={{
            ...styles.hero,
            backgroundImage: `url(${getImage(
              result.trip_summary?.destination || "travel"
            )})`,
          }}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div style={styles.overlay}>
            <h1>{result.trip_summary?.destination}</h1>
            <p>{result.trip_summary?.duration}</p>
          </div>
        </motion.div>

        {/* CONTENT */}
        <div style={styles.wrapper} ref={pdfRef}>

          {/* PLACES */}
          <Section title="📍 Suggested Places">
            <div style={styles.grid}>
              {result.suggested_places?.map((p, i) => (
                <motion.div
                  key={i}
                  style={styles.card}
                  whileHover={{ scale: 1.05 }}
                >
                  <img src={getImage(p.place_name)} style={styles.img} />
                  <h3>{p.place_name}</h3>
                  <p>{p.place_location_city}</p>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* ITINERARY */}
          <Section title="🗓️ Itinerary">
            {Object.entries(result.itinerary || {}).map(([day, plan], i) => (
              <motion.div
                key={i}
                style={styles.dayCard}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <h2>{day.toUpperCase()}</h2>

                {[plan.morning, plan.afternoon, plan.evening].map((slot, idx) => (
                  <div key={idx} style={styles.activity}>
                    <img
                      src={getImage(slot?.place || "travel")}
                      style={styles.img}
                    />
                    <h4>{slot?.activity}</h4>
                    <p>{slot?.details}</p>
                    <small>🚗 {slot?.transport}</small>
                  </div>
                ))}
              </motion.div>
            ))}
          </Section>

          {/* ROUTES */}
          <Section title="🚗 Routes">
            {result.routes?.map((r, i) => (
              <div key={i} style={styles.card}>
                <h3>{r.from} → {r.to}</h3>
                <p>{r.distance_km} km • {r.travel_time}</p>
              </div>
            ))}
          </Section>

          {/* MAP */}
          <Section title="🗺️ Map">
            <div style={styles.mapBox}>
              <TravelMapOSM routes={result.routes} />
            </div>
          </Section>

          {/* RECOMMENDATIONS */}
          <Section title="💡 Tips">
            <div style={styles.card}>
              {result.recommendations?.map((t, i) => (
                <p key={i}>• {t}</p>
              ))}
            </div>
          </Section>

        </div>

        {/* BUTTONS */}
        <div style={styles.actions}>
          <button style={styles.btn} onClick={downloadPDF}>
            📄 Download
          </button>
          <button style={styles.btn2} onClick={() => navigate("/")}>
            New Plan
          </button>
        </div>

      </div>
    </motion.div>
  );
};

/* COMPONENT */
const Section = ({ title, children }) => (
  <div>
    <h2 style={styles.section}>{title}</h2>
    {children}
  </div>
);

/* STYLES */
const styles = {
  page: {
    backgroundImage: `url(${mountainImg})`,
    backgroundSize: "cover",
    minHeight: "100vh",
  },
  container: {
    padding: "20px",
  },

  hero: {
    height: "250px",
    borderRadius: "20px",
    backgroundSize: "cover",
    marginBottom: "20px",
  },

  overlay: {
    background: "rgba(0,0,0,0.5)",
    height: "100%",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "20px",
  },

  wrapper: {
    background: "rgba(255,255,255,0.15)",
    padding: "30px",
    borderRadius: "20px",
    backdropFilter: "blur(20px)",
  },

  section: {
    marginTop: "20px",
    marginBottom: "10px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "15px",
  },

  card: {
    background: "#fff",
    padding: "10px",
    borderRadius: "10px",
  },

  dayCard: {
    background: "#fff",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "10px",
  },

  activity: {
    marginTop: "10px",
  },

  img: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "10px",
  },

  mapBox: {
    height: "300px",
    borderRadius: "10px",
    overflow: "hidden",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  btn: {
    flex: 1,
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
  },

  btn2: {
    flex: 1,
    padding: "10px",
    background: "#fff",
    border: "none",
    borderRadius: "10px",
  },
};

export default TravelResult;
