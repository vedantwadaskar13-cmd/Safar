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

        {/* PDF CONTENT AREA */}
        <div style={styles.wrapper} ref={pdfRef}>

          {/* HEADER */}
          <div style={styles.header}>
            <h1 style={styles.logo}>SAFAR <span style={styles.logoAI}>AI</span></h1>
            <p style={styles.subtitle}>Your Personalized Travel Plan</p>
          </div>

          {/* SECTION 1 */}
          <Section title="📍 Suggested Places" color="#4285F4">
            <Grid>
              {result.Suggested_places?.map((p, i) => (
                <Card key={i}>
                  <h3 style={styles.cardTitle}>{p.place_name}</h3>
                  <p style={styles.text}>{p.place_location_city}</p>
                </Card>
              ))}
            </Grid>
          </Section>

{/* SECTION 2 */}
<Section title="🗓️ Daily Itinerary" color="#A142F4">
  {Object.entries(result.itinerary || {}).map(([day, plan], i) => (
    <Card key={i}>
      <h3 style={styles.cardTitle}>{day.toUpperCase()}</h3>

      <p style={styles.text}>
        <strong>Morning:</strong> {plan.morning?.activity}
      </p>
      <p style={styles.text}>
        Details: {plan.morning?.details}
      </p>
      <p style={styles.text}>
        Transport: {plan.morning?.transport}
      </p>

      <p style={styles.text}>
        <strong>Afternoon:</strong> {plan.afternoon?.activity}
      </p>
      <p style={styles.text}>
        Details: {plan.afternoon?.details}
      </p>
      <p style={styles.text}>
        Transport: {plan.afternoon?.transport}
      </p>

      <p style={styles.text}>
        <strong>Evening:</strong> {plan.evening?.activity}
      </p>
      <p style={styles.text}>
        Details: {plan.evening?.details}
      </p>
      <p style={styles.text}>
        Transport: {plan.evening?.transport}
      </p>
    </Card>
  ))}
</Section>



          {/* SECTION 3 */}
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

          {/* SECTION 4 */}
          <Section title="🗺️ Live Travel Map" color="#1A73E8">
            <div style={styles.mapBox}>
              <TravelMapOSM routes={result.routes} />
            </div>
          </Section>

          {/* SECTION 5 */}
          <Section title="📝 Travel Advice" color="#EA4335">
            <Card>
              {result.recommendations?.map((t, i) => (
                <p key={i} style={styles.text}>• {t}</p>
              ))}
            </Card>
          </Section>

          {/* SECTION 6 - CHATBOT */}
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

        {/* ACTIONS */}
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

/* ---------------- HELPERS ---------------- */

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

/* ---------------- STYLES ---------------- */

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
    padding: "20px",
    gap: "24px",
  },

  wrapper: {
    width: "100%",
    maxWidth: 850,
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(25px) saturate(200%)",
    borderRadius: "35px",
    padding: "45px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },

  header: {
    textAlign: "center",
  },

  logo: {
    fontSize: 52,
    fontWeight: 800,
    letterSpacing: "4px",
    color: "#201243",
    fontFamily: "'Playfair Display', 'serif'",
  },

  logoAI: {
    color: "#e20808",
    fontWeight: 300,
  },

  subtitle: {
    color: "#000000",
    fontSize: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontFamily: "'Playfair Display', 'serif'",
    marginBottom: 14,
    fontWeight: 600,
  },

  sectionBody: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 15,
  },

  card: {
    background: "rgba(196, 220, 243, 0.41)",
    borderRadius: 15,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
  },

  text: {
    fontSize: 18,
    lineHeight: 1.7,
    color: "#000000",
    fontFamily: "'Open Sans', 'sans-serif'",
  },

  link: {
    marginTop: 6,
    color: "#4285F4",
    fontSize: 13,
    textDecoration: "none",
  },

  mapBox: {
    borderRadius: 18,
    overflow: "hidden",
    height: "400px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
  },

  chatBox: {
    background: "rgba(169, 187, 226, 0.95)",
    borderRadius: 15,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  chatText: {
    fontSize: 18,
    color: "#000000",
    lineHeight: 1.6,
    fontFamily: "'Open Sans', 'sans-serif",
  },

  chatBtn: {
    marginTop: 10,
    padding: "12px 16px",
    borderRadius: 20,
    background: "linear-gradient(135deg, #4285F4 0%, #1a73e8 100%)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },

  actions: {
    display: "flex",
    gap: 14,
    width: "100%",
    maxWidth: 850,
  },

  primaryBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 50,
    background: "linear-gradient(135deg, #4285F4 0%, #1a73e8 100%)",
    color: "#fff",
    border: "none",
    fontSize: 16,
    fontWeight: 500,
    cursor: "pointer",
  },

  secondaryBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 50,
    background: "rgba(255,255,255,0.9)",
    border: "none",
    fontSize: 16,
    fontWeight: 500,
    cursor: "pointer",
  },

  center: {
    textAlign: "center",
    padding: 40,
  },

  noData: {
    color: "#fff",
  },
};


export default TravelResult;
