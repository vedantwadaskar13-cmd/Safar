import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import LandingPage from "./LandingPage";
import Profile from "./pages/Profile";
import PlanTrip from "./pages/PlanTrip";
import AIChat from "./pages/AIChat";
import Help from "./pages/Help";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage user={user} />} />
      <Route path="/profile" element={<Profile user={user} />} />
      <Route path="/plan-trip" element={<PlanTrip />} />
      <Route path="/chat" element={<AIChat />} />
      <Route path="/help" element={<Help />} />
    </Routes>
  );
}

export default App;