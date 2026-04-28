import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import LandingPage from "./LandingPage";
import Profile from "./pages/Profile";
import Help from "./pages/Help";

import TripForm from "./pages/TripForm";
import Chatbot from "./pages/Chatbot";
import TravelResult from "./pages/TravelResult";

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
      {/* Existing Routes */}
      <Route path="/" element={<LandingPage user={user} />} />
      <Route path="/profile" element={<Profile user={user} />} />
      <Route path="/plan-trip" element={<TripForm />} />
      <Route path="/help" element={<Help />} />
 
      <Route path="/chat" element={<Chatbot />} /> 
      <Route path="/result" element={<TravelResult />} />

      {/* NEW ROUTE */}
      <Route path="/result" element={<TravelResult />} />
    </Routes>
  );
}

export default App;
