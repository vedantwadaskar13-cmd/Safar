import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import TravelMapOSM from "../components/TravelMapOSM";
import mountainImg from "../assets/formpage_bg1.jpg";

const TravelResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const pdfRef = useRef();

  const downloadPDF = () => {
    html2pdf()
      .set({
        margin: 0.5,
        filename: "SafarAI_Travel_Plan.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { format: "a4", orientation: "portrait" }
      })
      .from(pdfRef.current)
      .save();
  };

  if (!result) {
    return (
      <div style={styles.page}>
        <div style={styles.center}>
          <h2 style={styles.noData}>No trip data available</h2>
          <button style={styles.primaryBtn} onClick={() => navigate("/")}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.wrapper} ref={pdfRef}>
          <div style={styles.header}>
            <h1 style={styles.logo}>SAFAR <span style={styles.logoAI}>AI</span></h1>
            <p style={styles.subtitle}>Your Personalized Travel Plan</p>
          </div>

          <Section title="📍 Suggested Places" color="#4285F4">
            <Grid>
              {(result.suggested_places || []).map((p, i) => (
                <Card key={i}>
                  <h3 style={styles.cardTitle}>{p.name}</h3>
                  <p style={styles.text}>{p.description}</p>
                </Card>
              ))}
            </Grid>
          </Section>

          <Section title="🗓️ Daily Itinerary" color="#A142F4">
            {(result.itinerary || []).map((dayPlan, i) => (
              <Card key={i}>
                <h3 style={styles.cardTitle}>
                  Day {dayPlan.day}: {dayPlan.theme}
                </h3>

                {(dayPlan.activities || []).map((activity, index) => (
                  <div key={index} style={styles.activityBlock}>
                    <p style={styles.text}>
                      <strong>{activity.time}:</strong> {activity.title}
                    </p>

                    <p style={styles.text}>
                      <strong>Details:</strong> {activity.details}
                    </p>

                    <p style={styles.text}>
                      <strong>Location:</strong> {activity.location}
                    </p>

                    <p style={styles.text}>
                      <strong>Transport:</strong> {activity.transport}
                    </p>
                  </div>
                ))}
              </Card>
            ))}
          </Section>

          <Section title="🚗 Travel Routes" color="#34A853">
            {result.routes?.map((r, i) => (
              <Card key={i}>
                <h3 style={styles.cardTitle}>{r.from} → {r.to}</h3>
                <p style={styles.text}>
                  Distance: <b>{r.distance_km}</b> km | Time: <b>{r.travel_time}</b>
                </p>

                {r.map_link && (
                  <a href={r.map_link} target="_blank" rel="noreferrer" style={styles.link}>
                    Open in Google Maps →
                  </a>
                )}
              </Card>
            ))}
          </Section>

          <Section title="🗺️ Live Travel Map" color="#1A73E8">
            <div style={styles.mapBox}>
              <TravelMapOSM routes={result.routes} />
            </div>
          </Section>

          <Section title="📝 Travel Advice" color="#EA4335">
            <Card>
              {result.recommendations?.map((t, i) => (
                <p key={i} style={styles.text}>• {t}</p>
              ))}
            </Card>
          </Section>

          <Section title="🤖 Ask AI Travel Assistant" color="#FBBC05">
            <div style={styles.chatBox}>
              <p style={styles.chatText}>
                Have more questions about your trip? Ask your AI assistant for:
                <br /><br />
                • Best time to visit places
                <br />
                • Local food recommendations
                <br />
                • Travel tips & safety
                <br />
                • Route explanations
                <br />
                • Custom itinerary changes
              </p>

              <button
                style={styles.chatBtn}
                onClick={() => navigate("/chat", { state: { tripContext: result } })}
              >
                💬 Open Chat Assistant
              </button>
            </div>
          </Section>
        </div>

        <div style={styles.actions}>
          <button style={styles.primaryBtn} onClick={downloadPDF}>
            📄 Download PDF
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate("/")}>
            New Plan
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, color, children }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ ...styles.sectionTitle, color }}>{title}</h2>
    <div style={styles.sectionBody}>{children}</div>
  </div>
);

const Grid = ({ children }) => (
  <div style={styles.grid}>{children}</div>
);

const Card = ({ children }) => (
  <div style={styles.card}>{children}</div>
);

const styles = {
  page: {
    backgroundImage: `url(${mountainImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
    fontFamily: "'Montserrat', 'Poppins', 'sans-serif'",
  },

  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.25)",
    padding: "16px",
    gap: "20px",
  },

  wrapper: {
    width: "100%",
    maxWidth: "850px",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(25px) saturate(200%)",
    borderRadius: "25px",
    padding: "25px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  header: {
    textAlign: "center",
  },

  logo: {
    fontSize: "clamp(28px, 6vw, 52px)", // ✅ responsive font
    fontWeight: 800,
    letterSpacing: "3px",
    color: "#201243",
  },

  logoAI: {
    color: "#e20808",
    fontWeight: 300,
  },

  subtitle: {
    color: "#000",
    fontSize: "clamp(14px, 3vw, 20px)",
  },

  sectionTitle: {
    fontSize: "clamp(18px, 4vw, 22px)",
    marginBottom: 12,
    fontWeight: 600,
  },

  sectionBody: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", // ✅ mobile safe
    gap: 12,
  },

  card: {
    background: "rgba(196, 220, 243, 0.41)",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
  },

  activityBlock: {
    padding: "10px 0",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
  },

  cardTitle: {
    fontSize: "clamp(14px, 3.5vw, 16px)",
    fontWeight: 600,
  },

  text: {
    fontSize: "clamp(13px, 3.2vw, 16px)",
    lineHeight: 1.5,
    color: "#000",
  },

  link: {
    marginTop: 6,
    color: "#4285F4",
    fontSize: 12,
  },

  mapBox: {
    borderRadius: 14,
    overflow: "hidden",
    height: "clamp(250px, 40vw, 400px)", // ✅ responsive map
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  },

  chatBox: {
    background: "rgba(169, 187, 226, 0.95)",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  chatText: {
    fontSize: "clamp(13px, 3.2vw, 16px)",
    lineHeight: 1.5,
  },

  chatBtn: {
    padding: "10px 14px",
    borderRadius: 20,
    background: "linear-gradient(135deg, #4285F4, #1a73e8)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap", // ✅ key fix
    gap: 10,
    width: "100%",
    maxWidth: 850,
  },

  primaryBtn: {
    flex: 1,
    minWidth: "140px", // ✅ prevents squish
    padding: 12,
    borderRadius: 40,
    background: "linear-gradient(135deg, #4285F4, #1a73e8)",
    color: "#fff",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
  },

  secondaryBtn: {
    flex: 1,
    minWidth: "140px",
    padding: 12,
    borderRadius: 40,
    background: "rgba(255,255,255,0.9)",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
  },

  center: {
    textAlign: "center",
    padding: 30,
  },

  noData: {
    color: "#fff",
  },
};

export default TravelResult;
