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
          <div className="space-y-2">
            {matches.map((m) => (
              <div
                key={m._id}
                onClick={() => navigate(`/chat/${m.userId}`)}
                className="bg-white rounded-2xl shadow-sm flex items-center gap-3 px-4 py-3 cursor-pointer hover:shadow-md transition relative"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={m.profilePhotos?.[0] || `https://ui-avatars.com/api/?name=${m.name}&size=100&background=fda4af&color=fff`}
                    className="w-14 h-14 rounded-full object-cover"
                    alt={m.name}
                  />
                  {onlineUsers.has(m.userId?.toString()) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{m.name}, {m.age}</p>
                  <p className="text-xs text-rose-500 truncate">{m.branch} • Year {m.year}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/user/${m.userId}`); }}
                    className="text-xs text-rose-500 hover:text-rose-600 mt-0.5 font-medium">View Profile →</button>
                </div>

                {/* Remove */}
                <button
                  onClick={(e) => handleRemove(e, m.userId)}
                  className="shrink-0 text-gray-500 hover:text-red-500 transition text-lg font-bold"
                  title="Remove match"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
