import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZa6XxFAJo7gScivCGj1Jf2lrA1ox922M",
  authDomain: "safar-login-3543d.firebaseapp.com",
  projectId: "safar-login-3543d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();