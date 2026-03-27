import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import Navbar from "../components/Navbar";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/matches")
      .then(({ data }) => setMatches(data.matches))
      .catch(() => toast.error("Failed to load matches"))
      .finally(() => setLoading(false));
  }, []);

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
                className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
              >
                <img
                  src={m.profilePhotos?.[0] || `https://ui-avatars.com/api/?name=${m.name}&size=200&background=fda4af&color=fff`}
                  className="w-full h-40 object-cover"
                  alt={m.name}
                />
                <div className="p-3">
                  <p className="font-semibold text-gray-800">{m.name}, {m.age}</p>
                  <p className="text-xs text-rose-500">{m.branch} • Year {m.year}</p>
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
