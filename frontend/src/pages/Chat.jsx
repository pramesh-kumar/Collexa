import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api from "../utils/api";
import Navbar from "../components/Navbar";

let socket;

const Chat = () => {
  const { userId: receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [myId, setMyId] = useState(null);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const payload = JSON.parse(atob(token.split(".")[1]));
    setMyId(payload.userId);

    api.get(`/chat/${receiverId}`)
      .then(({ data }) => setMessages(data.messages))
      .catch(() => toast.error("Failed to load chat"));

    socket = io(import.meta.env.VITE_SOCKET_URL || "/", { path: "/api/socket.io", auth: { token } });
    socket.on("newMessage", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("error", (err) => toast.error(err));

    return () => socket.disconnect();
  }, [receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit("sendMessage", { receiverId, text });
    setText("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-lg mx-auto w-full flex flex-col p-4">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[calc(100vh-200px)]">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.senderId === myId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  msg.senderId === myId
                    ? "bg-rose-500 text-white rounded-br-sm"
                    : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="bg-rose-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-rose-600 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
