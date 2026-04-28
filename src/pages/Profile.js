import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";
import mountain from "../assets/mountain.jpg";

function Profile({ user }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [activeTab, setActiveTab] = useState("posts");

  // 🔥 Load profile from MySQL
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const res = await fetch(
          `http://localhost:5000/profile/${user.uid}`
        );
        const data = await res.json();

        if (data) {
          setName(data.name || "");
          setPhoto(data.photo || "");
        } else {
          setName(user.displayName || "");
          setPhoto(user.photoURL || "");
        }
      }
    };

    loadProfile();
  }, [user]);

  if (!user) {
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ← Back
        </button>
        <h2>Login first</h2>
      </div>
    );
  }

  // 🔥 Initials avatar
  const getInitials = () => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // 📸 Upload image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 💾 Save to Firebase + MySQL
  const handleSave = async () => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photo || null,
      });

      await fetch("http://localhost:5000/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          name,
          email: user.email,
          photo,
        }),
      });

      alert("Profile saved permanently!");
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    }
  };

  const removePhoto = () => {
    setPhoto("");
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate("/")}>
        ← Back
      </button>

      <div style={styles.profileBox}>
        {/* HEADER */}
        <div style={styles.header}>
          <label style={{ cursor: "pointer" }}>
            {photo ? (
              <img src={photo} style={styles.avatar} alt="profile" />
            ) : (
              <div style={styles.initialAvatar}>{getInitials()}</div>
            )}

            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </label>

          <div style={styles.info}>
            <h2>{name || "User"}</h2>
            <p style={{ color: "#ccc" }}>{user.email}</p>

            {/* Tabs */}
            <div style={styles.tabs}>
              {["posts", "trips", "settings"].map((tab) => (
                <button
                  key={tab}
                  style={
                    activeTab === tab ? styles.activeTab : styles.tab
                  }
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={styles.content}>
          {activeTab === "posts" && <p>No posts yet 📷</p>}

          {activeTab === "trips" && (
            <p>Your saved trips will appear here 🧳</p>
          )}

          {activeTab === "settings" && (
            <div style={styles.settings}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                placeholder="Name"
              />

              <button style={styles.saveBtn} onClick={handleSave}>
                Save Changes
              </button>

              <button style={styles.removeBtn} onClick={removePhoto}>
                Remove Profile Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    minHeight: "100vh",
    backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${mountain})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
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

  profileBox: {
    width: "700px",
    padding: "30px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(15px)",
  },

  header: {
    display: "flex",
    gap: "30px",
    alignItems: "center",
  },

  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  initialAvatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #16a34a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "bold",
  },

  info: {
    flex: 1,
  },

  tabs: {
    marginTop: "15px",
    display: "flex",
    gap: "20px",
  },

  tab: {
    background: "transparent",
    border: "none",
    color: "#ccc",
    cursor: "pointer",
  },

  activeTab: {
    borderBottom: "2px solid white",
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
  },

  content: {
    marginTop: "30px",
  },

  settings: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
  },

  saveBtn: {
    padding: "10px",
    background: "#16a34a",
    border: "none",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },

  removeBtn: {
    padding: "10px",
    background: "#dc2626",
    border: "none",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Profile;