import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import { useSocket } from "../context/SocketContext";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    api.get("/matches")
      .then(({ data }) => setMatches(data.matches))
      .catch(() => toast.error("Failed to load matches"))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (e, userId) => {
    e.stopPropagation();
    if (confirmId !== userId) {
      setConfirmId(userId);
      toast("Tap ✕ again to remove", { icon: "⚠️", duration: 3000 });
      setTimeout(() => setConfirmId(null), 3000);
      return;
    }
    try {
      await api.delete(`/matches/${userId}`);
      setMatches((prev) => prev.filter((m) => m.userId.toString() !== userId.toString()));
      toast.success("Match removed");
    } catch {
      toast.error("Failed to remove match");
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Matches 💘</h2>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">💔</p>
            <p className="text-gray-500">No matches yet. Keep swiping!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {matches.map((m) => (
              <div
                key={m._id}
                onClick={() => navigate(`/chat/${m.userId}`)}
                className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition relative"
              >
                <div className="relative">
                <img
                  src={m.profilePhotos?.[0] || `https://ui-avatars.com/api/?name=${m.name}&size=200&background=fda4af&color=fff`}
                  className="w-full h-40 object-cover"
                  alt={m.name}
                />
                {onlineUsers.has(m.userId?.toString()) && (
                  <span className="absolute bottom-2 left-2 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                )}
                </div>
                <button
                  onClick={(e) => handleRemove(e, m.userId)}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-red-100 text-red-500 rounded-full w-7 h-7 flex items-center justify-center text-sm shadow transition"
                  title="Remove match"
                >
                  ✕
                </button>
                <div className="p-3">
                  <p className="font-semibold text-gray-800">{m.name}, {m.age}</p>
                  <p className="text-xs text-rose-500">{m.branch} • Year {m.year}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/user/${m.userId}`); }}
                    className="text-xs text-rose-500 hover:text-rose-600 mt-1 font-medium">View Profile →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
