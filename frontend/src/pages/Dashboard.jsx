import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import SwipeCard from "../components/SwipeCard";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ branch: "", year: "" });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.branch) params.branch = filters.branch;
      if (filters.year) params.year = filters.year;
      const { data } = await api.get("/users/discover", { params });
      setUsers(data.users);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [filters]);

  const handleSwipe = async (action) => {
    const current = users[users.length - 1];
    if (!current) return;
    try {
      const { data } = await api.post("/swipe", { targetUserId: current.userId, action });
      if (data.matched) toast.success("🎉 It's a match!");
      setUsers((prev) => prev.slice(0, -1));
    } catch {
      toast.error("Swipe failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto p-4">
        <div className="flex gap-3 mb-6">
          <select
            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
          >
            <option value="">All Branches</option>
            {["CSE", "ECE", "ME", "CE", "EE", "EP", "DS"].map((b) => <option key={b}>{b}</option>)}
          </select>
          <select
            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          >
            <option value="">All Years</option>
            {[1, 2, 3, 4, 5].map((y) => <option key={y}>Year {y}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">😔</p>
            <p className="text-gray-500">No more users to discover</p>
            <button onClick={fetchUsers} className="mt-4 text-rose-500 font-medium hover:underline">Refresh</button>
          </div>
        ) : (
          <>
            <div className="relative">
              {users.slice(-3).map((user, i, arr) => (
                <div
                  key={user._id}
                  className="absolute w-full"
                  style={{ zIndex: i, transform: `scale(${0.95 + i * 0.025}) translateY(${(arr.length - 1 - i) * -8}px)` }}
                >
                  {i === arr.length - 1 ? (
                    <SwipeCard profile={user} onSwipe={handleSwipe} />
                  ) : (
                    <div className="bg-white rounded-3xl shadow-md" style={{ height: "100%" }} />
                  )}
                </div>
              ))}
              <div className="invisible pointer-events-none">
                <SwipeCard profile={users[users.length - 1]} onSwipe={() => {}} />
              </div>
            </div>

            <div className="flex justify-center gap-8 mt-6">
              <button
                onClick={() => handleSwipe("pass")}
                className="w-16 h-16 bg-white rounded-full shadow-lg text-3xl flex items-center justify-center hover:scale-110 transition"
              >❌</button>
              <button
                onClick={() => handleSwipe("like")}
                className="w-16 h-16 bg-rose-500 rounded-full shadow-lg text-3xl flex items-center justify-center hover:scale-110 transition"
              >💚</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
