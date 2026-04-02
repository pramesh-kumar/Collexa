import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { decryptText } from "../utils/crypto";

const SocketContext = createContext();

// Request browser notification permission once
const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

// Soft beep using Web Audio API
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {}
};

const showBrowserNotification = (title, body, onClick) => {
  if ("Notification" in window && Notification.permission === "granted") {
    const n = new Notification(title, {
      body,
      icon: "/favicon.ico",
    });
    n.onclick = () => { window.focus(); onClick(); n.close(); };
  }
};

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadMap, setUnreadMap] = useState({});
  const clearUnreadFrom = useRef((id) => setUnreadMap((prev) => { const n = { ...prev }; delete n[id]; return n; })).current;
  const addUnread = useRef((senderId) => setUnreadMap((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }))).current;
  const matchProfilesRef = useRef({});
  const navigate = useNavigate();

  // Request permission on mount
  useEffect(() => { requestNotificationPermission(); }, []);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setOnlineUsers(new Set());
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      path: "/api/socket.io",
      auth: { token },
    });

    // Fetch persisted unread counts from backend on load
    fetch("/api/chat/unread-counts", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(({ unreadCounts }) => { if (unreadCounts) setUnreadMap(unreadCounts); })
      .catch(() => {});

    socket.on("onlineList", (ids) => setOnlineUsers(new Set(ids)));
    socket.on("userOnline", (id) => setOnlineUsers((prev) => new Set([...prev, id])));
    socket.on("userOffline", (id) => setOnlineUsers((prev) => { const s = new Set(prev); s.delete(id); return s; }));

    socket.on("newMessage", async (msg) => {
      const senderId = msg.senderId?.toString?.() || msg.senderId;
      const receiverId = msg.receiverId?.toString?.() || msg.receiverId;
      const currentPath = window.location.pathname;
      const isInChat = currentPath === `/chat/${senderId}`;
      const myId = JSON.parse(atob(token.split(".")[1])).userId?.toString();
      // only increment if I am the receiver, not the sender
      if (receiverId !== myId) return;
      if (isInChat) return;

      setUnreadMap((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));

      // Get name from cache or fetch it
      if (!matchProfilesRef.current[senderId]) {
        try {
          const r = await fetch(`/api/users/profile/${senderId}`, { headers: { Authorization: `Bearer ${token}` } });
          const { profile } = await r.json();
          if (profile?.name) matchProfilesRef.current[senderId] = profile.name;
        } catch {}
      }

      const displayName = matchProfilesRef.current[senderId] || "Someone";
      let preview;
      if (msg.type === "text") {
        try {
          const privateKey = localStorage.getItem("privateKey");
          const plain = privateKey ? await decryptText(msg.text, privateKey) : msg.text;
          preview = plain?.slice(0, 50);
        } catch {
          preview = "New message";
        }
      } else {
        preview = msg.type === "image" ? "📷 Image"
          : msg.type === "audio" ? "🎤 Voice message"
          : "📎 File";
      }

      const goToChat = () => navigate(`/chat/${senderId}`);

      if (document.visibilityState === "visible") {
        playNotificationSound();
        toast(
          (t) => (
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { toast.dismiss(t.id); goToChat(); }}>
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm shrink-0">
                {displayName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                <p className="text-xs text-gray-500 truncate max-w-[180px]">{preview}</p>
              </div>
            </div>
          ),
          { duration: 4000 }
        );
      } else {
        playNotificationSound();
        showBrowserNotification(`💬 ${displayName}`, preview, goToChat);
      }
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers, unreadMap, clearUnreadFrom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
