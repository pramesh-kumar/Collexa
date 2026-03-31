import { createContext, useContext, useState } from "react";
import { generateKeyPair, encryptPrivateKey, decryptPrivateKey } from "../utils/crypto";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = async (t, password) => {
    localStorage.setItem("token", t);
    setToken(t);
    await setupKeys(t, password);
  };

  const setupKeys = async (t, password) => {
    if (!crypto.subtle) {
      console.warn("crypto.subtle unavailable — E2E encryption disabled (HTTP context)");
      return;
    }
    try {
      // Fetch existing keys from server
      const { data } = await api.get("/auth/keys", {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (data.encryptedPrivateKey) {
        // Decrypt private key with password and store in localStorage
        const privateKey = await decryptPrivateKey(data.encryptedPrivateKey, password);
        localStorage.setItem("privateKey", privateKey);
        localStorage.setItem("publicKey", data.publicKey);
      } else {
        // First time — generate new key pair
        const { publicKey, privateKey } = await generateKeyPair();
        const encryptedPrivateKey = await encryptPrivateKey(privateKey, password);
        // Upload to server
        await api.post("/auth/keys", { publicKey, encryptedPrivateKey }, {
          headers: { Authorization: `Bearer ${t}` },
        });
        localStorage.setItem("privateKey", privateKey);
        localStorage.setItem("publicKey", publicKey);
      }
    } catch (err) {
      console.error("Key setup failed:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("privateKey");
    localStorage.removeItem("publicKey");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
