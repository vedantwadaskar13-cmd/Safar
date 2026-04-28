const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// 🔥 DB CONNECTION
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Vw,130505",
  database: "safar_db",
});

db.connect((err) => {
  if (err) {
    console.log("❌ DB Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});


// ================= PROFILE =================

// Save / Update Profile
app.post("/profile", (req, res) => {
  const { userId, name, email, photo } = req.body;

  const sql = `
    INSERT INTO user_profiles (userId, name, email, photo)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    email = VALUES(email),
    photo = VALUES(photo)
  `;

  db.query(sql, [userId, name, email, photo], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Profile save failed" });
    }

    res.json({ message: "Profile saved successfully" });
  });
});

// Get Profile
app.get("/profile/:userId", (req, res) => {
  const sql = "SELECT * FROM user_profiles WHERE userId = ?";

  db.query(sql, [req.params.userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0] || null);
  });
});


// ================= TRIPS =================

// Save Trip (INPUT + OUTPUT)
app.post("/trips", (req, res) => {
  const {
    userId,
    destination,
    days,
    people,
    budget,
    travelType,
    plan,
  } = req.body;

  const sql = `
    INSERT INTO trips 
    (userId, destination, days, people, budget, travelType, plan)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [userId, destination, days, people, budget, travelType, plan],
    (err, result) => {
      if (err) {
        console.log("❌ Trip Save Error:", err);
        return res.status(500).json({ error: "Trip save failed" });
      }

      res.json({
        message: "Trip saved successfully ✅",
        tripId: result.insertId,
      });
    }
  );
});

// Get User Trips
app.get("/trips/:userId", (req, res) => {
  const sql = `
    SELECT * FROM trips 
    WHERE userId = ? 
    ORDER BY createdAt DESC
  `;

  db.query(sql, [req.params.userId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Fetch failed" });
    }

    res.json(result);
  });
});


// ================= START SERVER =================

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});